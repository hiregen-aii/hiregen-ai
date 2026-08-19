// config
const authLimit = {
  max: 10,
  timeWindow: '1 minute',
  errorResponseBuilder: (req) => ({
    success: false,
    data: null,
    error: { message: 'Too many requests. Try again later.' },
    meta: { requestId: req.id }
  })
}

// general
const generalLimit = {
  max: 100,
  timeWindow: '1 minute',
  errorResponseBuilder: (req) => ({
    success: false,
    data: null,
    error: { message: 'Too many requests. Slow down.' },
    meta: { requestId: req.id }
  })
}

module.exports = { authLimit, generalLimit }
