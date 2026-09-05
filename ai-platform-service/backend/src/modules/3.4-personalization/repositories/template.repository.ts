/**
 * Template repository — Module 3.4 Personalization
 * SRS §10 rule: ALL parameterized SQL for the templates table lives here,
 * and ONLY here. No business logic in this file.
 *
 * `db` is injected (pg.Pool-compatible) so unit tests can mock it and
 * integration tests can pass a Testcontainers pool (SRS §20).
 */
import {
  HiringType,
  TemplateCreate,
  TemplateRow,
} from "../schemas/template.schema.js";

export interface Queryable {
  query(sql: string, params?: unknown[]): Promise<{ rows: unknown[] }>;
}

export class TemplateRepository {
  constructor(private readonly db: Queryable) {}

  async create(input: TemplateCreate): Promise<TemplateRow> {
    const tpl = TemplateCreate.parse(input); // typed, Zod-validated input (SRS §10)
    const { rows } = await this.db.query(
      `INSERT INTO templates
         (name, hiring_type, step_number, subject_template, body_template,
          variables, tone, active, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        tpl.name,
        tpl.hiring_type,
        tpl.step_number,
        tpl.subject_template,
        tpl.body_template,
        JSON.stringify(tpl.variables),
        tpl.tone,
        tpl.active,
        tpl.created_by ?? null,
      ]
    );
    return TemplateRow.parse(rows[0]);
  }

  async findById(id: string): Promise<TemplateRow | null> {
    const { rows } = await this.db.query(
      `SELECT * FROM templates WHERE id = $1`,
      [id]
    );
    return rows[0] ? TemplateRow.parse(rows[0]) : null;
  }

  /**
   * The Personalization Agent's lookup path (SRS §8):
   * active template for a hiring_type at a given sequence step.
   */
  async findActive(
    hiringType: HiringType,
    stepNumber = 1
  ): Promise<TemplateRow | null> {
    const { rows } = await this.db.query(
      `SELECT * FROM templates
        WHERE hiring_type = $1 AND step_number = $2 AND active = TRUE
        ORDER BY updated_at DESC
        LIMIT 1`,
      [hiringType, stepNumber]
    );
    return rows[0] ? TemplateRow.parse(rows[0]) : null;
  }

  async listByHiringType(hiringType: HiringType): Promise<TemplateRow[]> {
    const { rows } = await this.db.query(
      `SELECT * FROM templates
        WHERE hiring_type = $1
        ORDER BY step_number ASC, updated_at DESC`,
      [hiringType]
    );
    return rows.map((r) => TemplateRow.parse(r));
  }

  async deactivate(id: string): Promise<void> {
    await this.db.query(
      `UPDATE templates SET active = FALSE, updated_at = now() WHERE id = $1`,
      [id]
    );
  }
}
