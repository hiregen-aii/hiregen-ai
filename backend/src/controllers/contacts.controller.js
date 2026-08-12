// Team 2 (2.3 Contact Intelligence)
//
// Gauri's original had no email format check, no required-field check, no
// dedupe (same email could be inserted for the same company any number of
// times), and returned raw err.message from Postgres straight to the
// client on failure (leaks internal schema/constraint details). Rebuilt
// here on Team 1's existing contacts.repository.js.

const {
  getAllContacts,
  getContactById,
  getContactsByCompany,
  createContact,
} = require("../repositories/contacts.repository");
const { getCompanyById } = require("../repositories/companies.repository");
const AppError = require("../utils/AppError");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createContactHandler = async (request, reply) => {
  try {
    const { companyId, fullName, title, email, linkedinUrl, verified } = request.body || {};

    if (!companyId || !email) {
      throw new AppError("companyId and email are required.", 400);
    }
    if (!EMAIL_RE.test(email)) {
      throw new AppError("email is not a valid email address.", 400);
    }

    const company = await getCompanyById(companyId);
    if (!company) {
      throw new AppError("Company not found for the given companyId.", 404);
    }

    const existingContacts = await getContactsByCompany(companyId);
    const normalizedEmail = email.trim().toLowerCase();
    const duplicate = existingContacts.find(
      (c) => (c.email || "").trim().toLowerCase() === normalizedEmail
    );
    if (duplicate) {
      throw new AppError("A contact with this email already exists for this company.", 409);
    }

    const contact = await createContact(
      companyId,
      fullName || null,
      title || null,
      email,
      linkedinUrl || null,
      Boolean(verified)
    );
    return reply.code(201).send({ success: true, message: "Contact created", data: contact });
  } catch (err) {
    request.log.error(err);
    const statusCode = err.statusCode || 500;
    return reply.code(statusCode).send({ success: false, message: err.message });
  }
};

const getAllContactsHandler = async (request, reply) => {
  try {
    const { companyId } = request.query || {};
    const contacts = companyId
      ? await getContactsByCompany(companyId)
      : await getAllContacts();
    return reply.send({ success: true, data: contacts });
  } catch (err) {
    request.log.error(err);
    return reply.code(500).send({ success: false, message: "Failed to fetch contacts" });
  }
};

const getContactByIdHandler = async (request, reply) => {
  try {
    const { id } = request.params;
    const contact = await getContactById(id);
    if (!contact) {
      throw new AppError("Contact not found", 404);
    }
    return reply.send({ success: true, data: contact });
  } catch (err) {
    request.log.error(err);
    const statusCode = err.statusCode || 500;
    return reply.code(statusCode).send({ success: false, message: err.message });
  }
};

module.exports = {
  createContact: createContactHandler,
  getAllContacts: getAllContactsHandler,
  getContactById: getContactByIdHandler,
};