// success
function success(data, reqId = null) {
  return {
    success: true,
    data,
    error: null,
    meta: { requestId: reqId }
  }
}

// error
function error(msg, reqId = null) {
  return {
    success: false,
    data: null,
    error: { message: msg },
    meta: { requestId: reqId }
  }
}

module.exports = { success, error }
