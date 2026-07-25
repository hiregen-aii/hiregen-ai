function requireRole(allowedRoles) {
  return function (request, reply, done) {
    const role = request.user?.role

    if (Array.isArray(allowedRoles) && allowedRoles.includes(role)) {
      done()
      return
    }

    reply.code(403).send({
      success: false,
      data: null,
      error: { message: 'Access denied: insufficient role' },
      meta: { requestId: request.id }
    })
  }
}

module.exports = { requireRole }
