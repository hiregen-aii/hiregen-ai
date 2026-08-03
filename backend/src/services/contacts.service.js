const contactsRepository = require('../repositories/contacts.repository')
const AppError = require('../utils/AppError')

// Get all contacts
async function getAllContacts() {
  return await contactsRepository.getAllContacts()
}

// Get contact by id
async function getContactById(id) {
  const contact = await contactsRepository.getContactById(id)

  if (!contact) {
    throw new AppError('Contact not found', 404)
  }

  return contact
}

// Create contact
async function createContact(
  companyId,
  fullName,
  title,
  email,
  linkedinUrl,
  verified
) {
  return await contactsRepository.createContact(
    companyId,
    fullName,
    title,
    email,
    linkedinUrl,
    verified
  )
}

// Update contact
async function updateContact(
  id,
  fullName,
  title,
  email,
  linkedinUrl,
  verified
) {
  const contact = await contactsRepository.getContactById(id)

  if (!contact) {
    throw new AppError('Contact not found', 404)
  }

  return await contactsRepository.updateContact(
    id,
    fullName,
    title,
    email,
    linkedinUrl,
    verified
  )
}

// Delete contact
async function deleteContact(id) {
  const contact = await contactsRepository.getContactById(id)

  if (!contact) {
    throw new AppError('Contact not found', 404)
  }

  await contactsRepository.deleteContact(id)

  return {
    message: 'Contact deleted successfully'
  }
}

module.exports = {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact
}