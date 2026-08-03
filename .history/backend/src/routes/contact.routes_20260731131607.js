const {
  getAllContactsHandler,
  getContactByIdHandler,
  createContactHandler,
  updateContactHandler,
  deleteContactHandler
} = require('../controllers/contacts.controller')

module.exports = async function contactsRoutes(fastify) {
  fastify.get('/api/contacts', getAllContactsHandler)

  fastify.get('/api/contacts/:id', getContactByIdHandler)

  fastify.post('/api/contacts', createContactHandler)

  fastify.put('/api/contacts/:id', updateContactHandler)

  fastify.delete('/api/contacts/:id', deleteContactHandler)
}