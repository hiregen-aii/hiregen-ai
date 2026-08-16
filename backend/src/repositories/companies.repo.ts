import pool from "../config/db.js";

export const companiesRepo = {
  async getAllCompanies() {
    const result = await pool.query(
      "SELECT * FROM companies ORDER BY created_at DESC"
    );

    return result.rows;
  },

  async getCompanyById(id: string) {
    const result = await pool.query(
      "SELECT * FROM companies WHERE id = $1",
      [id]
    );

    return result.rows[0];
  },

  async createCompany(
    name: string,
    domain: string,
    industry: string,
    sizeRange: string,
    linkedinUrl: string
  ) {
    const result = await pool.query(
      `INSERT INTO companies
      (name, domain, industry, size_range, linkedin_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [name, domain, industry, sizeRange, linkedinUrl]
    );

    return result.rows[0];
  },

  async updateCompany(
    id: string,
    name: string,
    domain: string,
    industry: string,
    sizeRange: string,
    linkedinUrl: string
  ) {
    const result = await pool.query(
      `UPDATE companies
       SET
         name = $2,
         domain = $3,
         industry = $4,
         size_range = $5,
         linkedin_url = $6,
         updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, name, domain, industry, sizeRange, linkedinUrl]
    );

    return result.rows[0];
  },

  async deleteCompany(id: string) {
    await pool.query(
      "DELETE FROM companies WHERE id = $1",
      [id]
    );
  },
};