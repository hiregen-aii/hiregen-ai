import pool from "../config/db.js";

export const contactsRepo = {
  async getAllContacts() {
    const result = await pool.query(
      "SELECT * FROM contacts ORDER BY created_at DESC"
    );

    return result.rows;
  },

  async getContactById(id: string) {
    const result = await pool.query(
      "SELECT * FROM contacts WHERE id = $1",
      [id]
    );

    return result.rows[0];
  },

  async getContactsByCompany(companyId: string) {
    const result = await pool.query(
      "SELECT * FROM contacts WHERE company_id = $1 ORDER BY created_at DESC",
      [companyId]
    );

    return result.rows;
  },

  async createContact(
    companyId: string,
    fullName: string,
    title: string,
    email: string,
    linkedinUrl: string,
    verified: boolean
  ) {
    const result = await pool.query(
      `INSERT INTO contacts
      (company_id, full_name, title, email, linkedin_url, verified)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        companyId,
        fullName,
        title,
        email,
        linkedinUrl,
        verified,
      ]
    );

    return result.rows[0];
  },

  async deleteContact(id: string) {
    await pool.query(
      "DELETE FROM contacts WHERE id = $1",
      [id]
    );
  },
};