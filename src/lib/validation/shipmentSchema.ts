import { z } from 'zod';
import type { Shipment, ValidationError } from '@/types/shipment';

const phoneRegex = /^1[3-9]\d{9}$|^0\d{2,3}-?\d{7,8}$/;

export const shipmentSchema = z.object({
  externalCode: z.string().nullable().optional(),
  senderName: z.string().min(1, '发件人姓名不能为空'),
  senderPhone: z.string().regex(phoneRegex, '电话格式错误'),
  senderAddress: z.string().min(1, '发件人地址不能为空'),
  receiverName: z.string().min(1, '收件人姓名不能为空'),
  receiverPhone: z.string().regex(phoneRegex, '电话格式错误'),
  receiverAddress: z.string().min(1, '收件人地址不能为空'),
  weight: z.number().positive('重量必须为正数'),
  pieceCount: z.number().int().positive('件数必须为正整数'),
  temperature: z.enum(['常温', '冷藏', '冷冻'], {
    errorMap: () => ({ message: '温层必须是：常温/冷藏/冷冻' })
  }),
  remark: z.string().nullable().optional(),
});

export type ShipmentInput = z.infer<typeof shipmentSchema>;

function findRowByCode(shipments: Shipment[], code: string): number {
  const idx = shipments.findIndex(s => s.externalCode === code);
  return idx >= 0 ? (shipments[idx].rowIndex || idx + 1) : idx + 1;
}

export function validateShipments(
  shipments: Shipment[],
  existingExternalCodes: Set<string> = new Set()
): Map<number, ValidationError[]> {
  const errors = new Map<number, ValidationError[]>();
  const batchExternalCodes = new Set<string>();

  shipments.forEach((shipment, idx) => {
    const rowErrors: ValidationError[] = [];
    const rowNum = shipment.rowIndex || idx + 1;

    if (shipment.externalCode) {
      if (batchExternalCodes.has(shipment.externalCode)) {
        rowErrors.push({
          row: rowNum,
          field: 'externalCode',
          errorType: 'duplicate',
          message: `外部编码"${shipment.externalCode}"与本批次第${findRowByCode(shipments, shipment.externalCode)}行重复`
        });
      } else if (existingExternalCodes.has(shipment.externalCode)) {
        rowErrors.push({
          row: rowNum,
          field: 'externalCode',
          errorType: 'duplicate',
          message: `外部编码"${shipment.externalCode}"与历史数据重复`
        });
      }
      batchExternalCodes.add(shipment.externalCode);
    }

    const result = shipmentSchema.safeParse(shipment);
    if (!result.success) {
      result.error.errors.forEach(err => {
        const field = err.path[0] as keyof Shipment;
        rowErrors.push({
          row: rowNum,
          field,
          errorType: 'required',
          message: err.message
        });
      });
    }

    if (rowErrors.length > 0) {
      errors.set(rowNum, rowErrors);
    }
  });

  return errors;
}
