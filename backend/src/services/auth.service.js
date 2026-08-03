const crypto = require('node:crypto')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const env = require('../config/env')
const AppError = require('../utils/AppError')
const { findByEmail, findById } = require('../repositories/user.repository')
const { saveRefreshToken, getRefreshToken, revokeRefreshToken } = require('../repositories/auth.repository')

async function login(email, password) {
  const normalizedEmail = String(email || '').trim().toLowerCase()

  if (!normalizedEmail || !password) {
    throw new AppError('Email and password are required', 400)
  }

  const user = await findByEmail(normalizedEmail)

  if (!user) {
    throw new AppError('Invalid credentials', 401)
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash)

  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401)
  }

  if (!user.is_active) {
    throw new AppError('Account is inactive', 401)
  }

  const accessToken = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role
    },
    env.JWT_SECRET,
    { expiresIn: '15m' }
  )

  const refreshToken = jwt.sign(
    {
      sub: user.id,
      type: 'refresh'
    },
    env.REFRESH_SECRET,
    { expiresIn: '7d' }
  )

  const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  await saveRefreshToken(user.id, refreshTokenHash, expiresAt)

  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role
    },
    accessToken,
    refreshToken
  }
}

async function refresh(refreshToken) {
  if (!refreshToken) {
    throw new AppError('Refresh token is required', 400)
  }

  let decoded

  try {
    decoded = jwt.verify(refreshToken, env.REFRESH_SECRET)
  } catch (err) {
    throw new AppError('Invalid or expired token', 401)
  }

  if (decoded.type !== 'refresh') {
    throw new AppError('Invalid refresh token', 401)
  }

  const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')
  const storedToken = await getRefreshToken(refreshTokenHash)

  if (!storedToken) {
    throw new AppError('Invalid or expired token', 401)
  }

  const user = await findById(decoded.sub)

  if (!user || !user.is_active) {
    throw new AppError('Invalid or expired token', 401)
  }

  await revokeRefreshToken(refreshTokenHash)

  const newAccessToken = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role
    },
    env.JWT_SECRET,
    { expiresIn: '15m' }
  )

  const newRefreshToken = jwt.sign(
    {
      sub: user.id,
      type: 'refresh'
    },
    env.REFRESH_SECRET,
    { expiresIn: '7d' }
  )

  const newRefreshTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex')

  await saveRefreshToken(user.id, newRefreshTokenHash, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))

  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role
    },
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
  }
}

async function logout(refreshToken) {
  if (!refreshToken) {
    throw new AppError('Refresh token is required', 400)
  }

  const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')
  await revokeRefreshToken(refreshTokenHash)

  return {
    revoked: true
  }
}

module.exports = { login, refresh, logout }
