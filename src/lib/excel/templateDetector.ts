import type { Shipment } from '@/types/shipment';

type MappingField = 'externalCode' | 'senderName' | 'senderPhone' | 'senderAddress' | 'receiverName' | 'receiverPhone' | 'receiverAddress' | 'weight' | 'pieceCount' | 'temperature' | 'remark';

const FIELD_ALIASES: Record<MappingField, string[]> = {
  externalCode: ['外部编码', '外部单号', '客户单号', '外部订单号', '订单号', '外单号', 'Ref Code', 'ref code', '客户单号'],
  senderName: ['发件人姓名', '寄件人', '发件人', '寄件人姓名', '发货人', '发货人姓名', 'Sender', 'sender'],
  senderPhone: ['发件人电话', '寄件人电话', '发件人手机', '寄件人手机', '发货人电话', '发件电话', 'Sender Tel', 'sender tel', 'sender phone'],
  senderAddress: ['发件人地址', '寄件人地址', '发件地址', '寄件地址', '发货地址', '发件地址', 'Sender Address', 'sender address'],
  receiverName: ['收件人姓名', '收件人', '收货人', '收货人姓名', '收件人名称', 'Receiver', 'receiver'],
  receiverPhone: ['收件人电话', '收货人电话', '收件人手机', '收货人手机', '联系电话', '收件电话', 'Receiver Tel', 'receiver tel', 'receiver phone'],
  receiverAddress: ['收件人地址', '收货人地址', '收件地址', '收货地址', '收件地址', 'Receiver Address', 'receiver address'],
  weight: ['重量', '重量(kg)', '货物重量', '包裹重量', 'KG', '千克', 'Weight(kg)', 'weight(kg)', 'Weight(KG)', 'weight(kg)', '重量(KG)'],
  pieceCount: ['件数', '数量', '包裹数量', '箱数', '件数(箱)', 'Qty', 'qty', '数量'],
  temperature: ['温层', '温度', '温区', '温层要求', '储存温度', '温控', 'Temp Zon', 'temp zon', '温层'],
  remark: ['备注', '说明', '附言', '备注说明', '特殊要求', 'Note', 'note', '备注']
};

export function generateTemplateSignature(headers: string[]): string {
  const normalized = headers
    .map(h => h?.trim().toLowerCase().replace(/[（(].*[）)]/g, ''))
    .filter(Boolean)
    .sort()
    .join('|');
  return normalized;
}

export function detectColumnMapping(
  headers: string[]
): Partial<Record<keyof Shipment, string>> {
  const mapping: Partial<Record<keyof Shipment, string>> = {};

  for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
    for (const header of headers) {
      const normalizedHeader = header?.trim().toLowerCase().replace(/\s+/g, '');
      if (aliases.some(alias => {
        const normalizedAlias = alias.toLowerCase().replace(/\s+/g, '');
        return normalizedHeader === normalizedAlias ||
               normalizedHeader.includes(normalizedAlias) ||
               normalizedAlias.includes(normalizedHeader);
      })) {
        mapping[field as keyof Shipment] = header;
        break;
      }
    }
  }

  return mapping;
}

export async function saveTemplateMapping(
  headers: string[],
  columnMapping: Record<string, string>,
  mappingName: string
): Promise<void> {
  const signature = generateTemplateSignature(headers);

  try {
    const response = await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        signature,
        mappingName,
        columnMapping
      })
    });

    if (!response.ok) {
      console.warn(`Failed to save template: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.warn('Failed to save template:', error);
  }
}

export async function getMatchingTemplate(
  headers: string[]
): Promise<Record<string, string> | null> {
  const signature = generateTemplateSignature(headers);

  try {
    const response = await fetch(`/api/templates?signature=${signature}`);
    
    if (!response.ok) {
      console.warn(`API request failed: ${response.status} ${response.statusText}`);
      return null;
    }

    const text = await response.text();
    if (!text) {
      console.warn('API returned empty response');
      return null;
    }

    const data = JSON.parse(text);
    return data.columnMapping || null;
  } catch (error) {
    console.warn('Failed to get matching template:', error);
    return null;
  }
}

export async function getAllTemplates(): Promise<{ id: string; mappingName: string; columnMapping: Record<string, string> }[]> {
  try {
    const response = await fetch('/api/templates');
    
    if (!response.ok) {
      console.warn(`API request failed: ${response.status} ${response.statusText}`);
      return [];
    }

    const text = await response.text();
    if (!text) {
      console.warn('API returned empty response');
      return [];
    }

    const data = JSON.parse(text);
    return data;
  } catch (error) {
    console.warn('Failed to get all templates:', error);
    return [];
  }
}
