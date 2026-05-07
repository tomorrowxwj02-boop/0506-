import { read, utils, writeFile } from 'xlsx';
import type { Shipment } from '@/types/shipment';
import { detectColumnMapping } from './templateDetector';

const HEADER_KEYWORDS = [
  '姓名', '电话', '手机', '地址', '重量', '件数', '温层', 
  '编码', '单号', '订单号', '发件人', '收件人', '收货人',
  '寄件人', '发货人', '备注', '要求', '客户单号', '发件电话', '收件电话',
  'ref', 'code', 'sender', 'receiver', 'tel', 'address', 'qty', 'note'
];

const DESCRIPTION_KEYWORDS = ['说明', '提示', '注意', '备注：', '注：', '注意事项'];

function findHeaderRow(rawData: any[][]): number {
  const maxRowsToCheck = 10;
  let bestRowIndex = 0;
  let bestScore = 0;
  
  for (let i = 0; i < Math.min(rawData.length, maxRowsToCheck); i++) {
    const row = rawData[i];
    if (!row || row.length === 0) continue;
    
    const validCells = row.filter(cell => cell && cell.toString().trim());
    if (validCells.length === 0) continue;
    
    const firstCell = validCells[0].toString().trim().toLowerCase();
    
    if (DESCRIPTION_KEYWORDS.some(kw => firstCell.includes(kw.toLowerCase()))) {
      continue;
    }
    
    const isMergedHeader = validCells.length < row.length * 0.5;
    const mergedPenalty = isMergedHeader ? -5 : 0;
    
    let keywordCount = 0;
    for (const cell of validCells) {
      const cellStr = cell.toString().trim().toLowerCase();
      if (HEADER_KEYWORDS.some(keyword => cellStr.includes(keyword.toLowerCase()))) {
        keywordCount++;
      }
    }
    
    const score = keywordCount * 10 + validCells.length + mergedPenalty;
    if (score > bestScore) {
      bestScore = score;
      bestRowIndex = i;
    }
  }
  
  return bestRowIndex;
}

export interface ParseResult {
  data: Shipment[];
  headers: string[];
  totalRows: number;
  errors: string[];
}

function selectBestSheet(workbook: any): string {
  const dataSheetKeywords = ['数据', '订单', '导入', '运单', '列表', '明细', '内容', 'data', 'import', 'order', 'sheet'];
  const skipSheetKeywords = ['说明', '帮助', '指导', '指南', '模板', '填写', 'readme', 'guide', 'help', 'instruction'];
  
  let bestSheetName = workbook.SheetNames[0];
  let bestScore = 0;
  
  for (const sheetName of workbook.SheetNames) {
    const lowerName = sheetName.toLowerCase();
    let score = 0;
    
    for (const keyword of skipSheetKeywords) {
      if (lowerName.includes(keyword.toLowerCase())) {
        score -= 10;
        break;
      }
    }
    
    for (const keyword of dataSheetKeywords) {
      if (lowerName.includes(keyword.toLowerCase())) {
        score += 5;
      }
    }
    
    const sheet = workbook.Sheets[sheetName];
    const rawData = utils.sheet_to_json<any[]>(sheet, { header: 1, defval: '' });
    
    if (rawData && rawData.length > 1) {
      score += rawData.length;
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestSheetName = sheetName;
    }
  }
  
  return bestSheetName;
}

export async function parseExcelFile(
  file: File,
  columnMapping?: Record<string, string>
): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = read(data, { type: 'array' });

        if (!workbook.SheetNames.length) {
          reject(new Error('Excel 文件中没有找到工作表'));
          return;
        }

        const sheetName = selectBestSheet(workbook);
        const sheet = workbook.Sheets[sheetName];
        const rawData = utils.sheet_to_json<any[]>(sheet, { header: 1, defval: '' });

        if (!rawData || rawData.length < 2) {
          reject(new Error('文件为空或只有表头行'));
          return;
        }

        const headerRowIndex = findHeaderRow(rawData);
        if (headerRowIndex === -1) {
          reject(new Error('未能识别到表头列，请确保Excel文件包含表头行'));
          return;
        }

        const headers = rawData[headerRowIndex].map((h: any) => h?.toString().trim() || '');
        const rows = rawData.slice(headerRowIndex + 1);

        console.log('=== 表头信息 ===');
        console.log('表头行索引:', headerRowIndex);
        console.log('表头内容:', headers);
        console.log('映射配置:', columnMapping);

        if (rows.length === 0) {
          reject(new Error('文件中没有数据行'));
          return;
        }

        const shipments = mapRowsToShipments(rows, headers, columnMapping);

        resolve({
          data: shipments,
          headers,
          totalRows: rows.length,
          errors: []
        });
      } catch (error) {
        reject(new Error('文件解析失败：' + (error as Error).message));
      }
    };

    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsArrayBuffer(file);
  });
}

function normalizeHeader(header: string): string {
  return header?.trim().toLowerCase().replace(/[\s\n\r\t]/g, '') || '';
}

function mapRowsToShipments(
  rows: any[][],
  headers: string[],
  columnMapping?: Record<string, string>
): Shipment[] {
  const indexMap: Record<string, number> = {};
  const normalizedHeaders = headers.map((h, i) => ({ original: h, normalized: normalizeHeader(h), index: i }));

  console.log('=== 原始表头 ===');
  console.log('headers:', headers);
  console.log('normalizedHeaders:', normalizedHeaders);

  if (columnMapping) {
    console.log('=== 输入的映射配置 ===');
    console.log('columnMapping:', columnMapping);

    for (const [field, headerName] of Object.entries(columnMapping)) {
      const normalizedHeaderName = normalizeHeader(headerName);
      console.log(`处理字段 ${field}，映射名 "${headerName}"，标准化后 "${normalizedHeaderName}"`);

      let idx = headers.findIndex(h => h === headerName);
      console.log(`  精确匹配查找结果: ${idx}`);
      
      if (idx === -1) {
        idx = headers.findIndex(h => normalizeHeader(h) === normalizedHeaderName);
        console.log(`  标准化匹配查找结果: ${idx}`);
      }
      
      if (idx === -1) {
        idx = headers.findIndex(h => normalizeHeader(h).includes(normalizedHeaderName) || normalizedHeaderName.includes(normalizeHeader(h)));
        console.log(`  包含匹配查找结果: ${idx}`);
      }
      
      if (idx !== -1) {
        indexMap[field] = idx;
        console.log(`  ✓ 成功映射到列 ${idx}: "${headers[idx]}"`);
      } else {
        console.log(`  ✗ 映射失败！在表头中未找到匹配的列`);
      }
    }
  } else {
    const autoMapping = detectColumnMapping(headers);
    console.log('=== 自动检测的映射 ===');
    console.log('autoMapping:', autoMapping);
    
    for (const [field, headerName] of Object.entries(autoMapping)) {
      const idx = headers.findIndex(h => h === headerName);
      if (idx !== -1) indexMap[field] = idx;
    }
  }

  console.log('=== 最终映射索引 ===');
  console.log('indexMap:', indexMap);

  if (!indexMap.senderName) {
    console.log('❌ 警告：senderName 字段没有映射！');
  }

  return rows.map((row, idx) => ({
    externalCode: indexMap.externalCode ? row[indexMap.externalCode]?.toString() || null : null,
    senderName: indexMap.senderName ? row[indexMap.senderName]?.toString() || '' : '',
    senderPhone: indexMap.senderPhone ? row[indexMap.senderPhone]?.toString() || '' : '',
    senderAddress: indexMap.senderAddress ? row[indexMap.senderAddress]?.toString() || '' : '',
    receiverName: indexMap.receiverName ? row[indexMap.receiverName]?.toString() || '' : '',
    receiverPhone: indexMap.receiverPhone ? row[indexMap.receiverPhone]?.toString() || '' : '',
    receiverAddress: indexMap.receiverAddress ? row[indexMap.receiverAddress]?.toString() || '' : '',
    weight: parseFloat(row[indexMap.weight]) || 0,
    pieceCount: parseInt(row[indexMap.pieceCount]) || 0,
    temperature: (row[indexMap.temperature]?.toString() || '常温') as '常温' | '冷藏' | '冷冻',
    remark: indexMap.remark ? row[indexMap.remark]?.toString() || null : null,
    rowIndex: idx + 1
  }));
}

export function exportToExcel(shipments: Shipment[], filename: string = '运单数据.xlsx'): void {
  const headers = ['外部编码', '发件人姓名', '发件人电话', '发件人地址', '收件人姓名', '收件人电话', '收件人地址', '重量(kg)', '件数', '温层', '备注'];
  
  const data = shipments.map(s => [
    s.externalCode || '',
    s.senderName,
    s.senderPhone,
    s.senderAddress,
    s.receiverName,
    s.receiverPhone,
    s.receiverAddress,
    s.weight,
    s.pieceCount,
    s.temperature,
    s.remark || ''
  ]);

  const worksheet = utils.aoa_to_sheet([headers, ...data]);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, '运单数据');

  writeFile(workbook, filename);
}
