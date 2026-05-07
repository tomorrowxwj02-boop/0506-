export interface Shipment {
  id?: string;
  externalCode: string | null;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  weight: number;
  pieceCount: number;
  temperature: '常温' | '冷藏' | '冷冻';
  remark: string | null;
  batchId?: string;
  rowIndex?: number;
  status?: 'pending' | 'submitted' | 'failed';
  createdAt?: string;
  submittedAt?: string;
}

export const SHIPMENT_FIELDS = {
  externalCode: { label: '外部编码', required: false },
  senderName: { label: '发件人姓名', required: true },
  senderPhone: { label: '发件人电话', required: true },
  senderAddress: { label: '发件人地址', required: true },
  receiverName: { label: '收件人姓名', required: true },
  receiverPhone: { label: '收件人电话', required: true },
  receiverAddress: { label: '收件人地址', required: true },
  weight: { label: '重量(kg)', required: true },
  pieceCount: { label: '件数', required: true },
  temperature: { label: '温层', required: true },
  remark: { label: '备注', required: false },
} as const;

export interface ValidationError {
  row: number;
  field: keyof Shipment;
  errorType: 'required' | 'phone' | 'positive' | 'temperature' | 'duplicate';
  message: string;
}
