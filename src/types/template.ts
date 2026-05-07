export interface TemplateMapping {
  id: string;
  templateSignature: string;
  mappingName: string;
  columnMapping: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
  useCount: number;
}
