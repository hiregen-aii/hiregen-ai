// Team 2 (2.2 Company Intelligence)
//
// Gauri's original submission had this same CRUD surface, but: no auth on
// any route, name/domain dedupe only caught at the DB unique-constraint
// level (raw Postgres error code checked, no pre-check for a clean 409),
// and PUT required every field to be resent (no partial update). Rebuilt
// here on Team 1's existing companies.repository.js.

const {
  getAllCompanies,
  getCompanyById,
  getCompanyByDomain,
  createCompany,
  updateCompany,
} = require("../repositories/companies.repository");
const AppError = require("../utils/AppError");

const createCompanyHandler = async (request, reply) => {
  try {
    const { name, domain, industry, sizeRange, linkedinUrl } = request.body || {};

    if (!name || !domain) {
      throw new AppError("Company name and domain are required.", 400);
    }

    const existing = await getCompanyByDomain(domain);
    if (existing) {
      throw new AppError("A company with this domain already exists.", 409);
    }

    const company = await createCompany(name, domain, industry, sizeRange, linkedinUrl);
    return reply.code(201).send({ success: true, message: "Company created", data: company });
  } catch (err) {
    request.log.error(err);
    const statusCode = err.statusCode || 500;
    return reply.code(statusCode).send({ success: false, message: err.message });
  }
};

const getAllCompaniesHandler = async (request, reply) => {
  try {
    const companies = await getAllCompanies();
    return reply.send({ success: true, data: companies });
  } catch (err) {
    request.log.error(err);
    return reply.code(500).send({ success: false, message: "Failed to fetch companies" });
  }
};

const getCompanyByIdHandler = async (request, reply) => {
  try {
    const { id } = request.params;
    const company = await getCompanyById(id);
    if (!company) {
      throw new AppError("Company not found", 404);
    }
    return reply.send({ success: true, data: company });
  } catch (err) {
    request.log.error(err);
    const statusCode = err.statusCode || 500;
    return reply.code(statusCode).send({ success: false, message: err.message });
  }
};

// Partial update — only overwrites fields actually supplied, unlike the
// original PUT which required every field every time.
const updateCompanyHandler = async (request, reply) => {
  try {
    const { id } = request.params;
    const existing = await getCompanyById(id);
    if (!existing) {
      throw new AppError("Company not found", 404);
    }

    const {
      name = existing.name,
      domain = existing.domain,
      industry = existing.industry,
      sizeRange = existing.size_range,
      linkedinUrl = existing.linkedin_url,
    } = request.body || {};

    if (domain !== existing.domain) {
      const conflict = await getCompanyByDomain(domain);
      if (conflict && conflict.id !== id) {
        throw new AppError("A company with this domain already exists.", 409);
      }
    }

    const updated = await updateCompany(id, name, domain, industry, sizeRange, linkedinUrl);
    return reply.send({ success: true, message: "Company updated", data: updated });
  } catch (err) {
    request.log.error(err);
    const statusCode = err.statusCode || 500;
    return reply.code(statusCode).send({ success: false, message: err.message });
  }
};

module.exports = {
  createCompany: createCompanyHandler,
  getAllCompanies: getAllCompaniesHandler,
  getCompanyById: getCompanyByIdHandler,
  updateCompany: updateCompanyHandler,
};