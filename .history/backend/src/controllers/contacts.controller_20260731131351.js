const { success, error } = require('../utils/response')
const contactsService = require('../services/contacts.service')
async function getAllContactsHandler(request, reply) {
  try {
    const contacts = await contactsService.getAllContacts()

    return reply.code(200).send(success(contacts, request.id))
  } catch (err) {
    const statusCode = err.statusCode || 500
    const message = err.message || 'Failed to get contacts'

    return reply.code(statusCode).send(error(message, request.id))
  }
}
async function getContactByIdHandler(request, reply) {
  try {
    const { id } = request.params
    const contact = await contactsService.getContactById(id)

    return reply.code(200).send(success(contact, request.id))
  } catch (err) {
    const statusCode = err.statusCode || 500
    const message = err.message || 'Failed to get contact'

    return reply.code(statusCode).send(error(message, request.id))
  }
}
async function createContactHandler(request, reply) {
  try {
    const {
      companyId,
      fullName,
      title,
      email,
      linkedinUrl,
      verified
    } = request.body

    const contact = await contactsService.createContact(
      companyId,
      fullName,
      title,
      email,
      linkedinUrl,
      verified
    )

    return reply.code(201).send(success(contact, request.id))
  } catch (err) {
    const statusCode = err.statusCode || 500
    const message = err.message || 'Failed to create contact'

    return reply.code(statusCode).send(error(message, request.id))
  }
}
async function updateContactHandler(request, reply) {
  try {
    const { id } = request.params

    const {
      fullName,
      title,
      email,
      linkedinUrl,
      verified
    } = request.body

    const contact = await contactsService.updateContact(
      id,
      fullName,
      title,
      email,
      linkedinUrl,
      verified
    )

    return reply.code(200).send(success(contact, request.id))
  } catch (err) {
    const statusCode = err.statusCode || 500
    const message = err.message || 'Failed to update contact'

    return reply.code(statusCode).send(error(message, request.id))
  }
}
