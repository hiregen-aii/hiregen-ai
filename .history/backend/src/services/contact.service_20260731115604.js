const contactsRepository = require('../repositories/contacts.repository')
const AppError = require('../utils/AppError')
async function getAllContacts() {
  return await contactsRepository.getAllContacts()
}