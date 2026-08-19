import { TemplateCreate, TemplateRow, HiringType } from "../../modules/3.4-personalization/schemas/template.schema";
import { TemplateRepository } from "../../modules/3.4-personalization/repositories/template.repository";

export class InMemoryTemplateRepository extends TemplateRepository {
  private readonly rows = new Map<string, TemplateRow>();

  constructor() { super({ query: async () => ({ rows: [] }) }); }

  override async create(input: TemplateCreate): Promise<TemplateRow> {
    const parsed = TemplateCreate.parse(input);
    const now = new Date();
    const row = TemplateRow.parse({
      id: crypto.randomUUID(),
      ...parsed,
      created_at: now,
      updated_at: now,
      created_by: parsed.created_by ?? null,
    });
    this.rows.set(row.id, row);
    return row;
  }

  async seed(row: TemplateRow): Promise<void> { this.rows.set(row.id, row); }

  override async findById(id: string): Promise<TemplateRow | null> { return this.rows.get(id) ?? null; }

  override async findActive(hiringType: HiringType, stepNumber = 1): Promise<TemplateRow | null> {
    return [...this.rows.values()].find((r) => r.hiring_type === hiringType && r.step_number === stepNumber && r.active) ?? null;
  }

  override async listByHiringType(hiringType: HiringType): Promise<TemplateRow[]> {
    return [...this.rows.values()].filter((r) => r.hiring_type === hiringType);
  }

  override async deactivate(id: string): Promise<void> {
    const row = this.rows.get(id);
    if (row) this.rows.set(id, { ...row, active: false, updated_at: new Date() });
  }
}
