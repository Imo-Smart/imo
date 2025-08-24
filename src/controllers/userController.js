import crypto from 'crypto'

import User from '../models/User.js'
import sendEmail from '../utils/sendEmail.js'
import { welcomeTemplate } from '../utils/emailTemplates.js'
import generateToken from '../utils/generateToken.js'

// Registrar novo usuário
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, isAdmin } = req.body

    // Verifica se usuário já existe
    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({ message: 'Usuário já cadastrado' })
    }

    // Cria usuário
    const user = await User.create({ name, email, password, isAdmin })

    // Tenta enviar e-mail de boas-vindas
    ;(async () => {
      try {
        await sendEmail({
          email: user.email,
          subject: 'Bem-vindo(a) ao nosso App!',
          message: welcomeTemplate(user.name),
        })
      } catch (emailError) {
        console.error('Erro ao enviar e-mail de boas-vindas:', emailError)
      }
    })()

    // Retorna dados do usuário + token
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id, user.isAdmin),
    })
  } catch (error) {
    res.status(500).json({ message: 'Erro ao registrar usuário', error })
  }
}

// Login de usuário
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id, user.isAdmin),
      })
    } else {
      res.status(401).json({ message: 'Credenciais inválidas' })
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro no login', error })
  }
}

// Perfil do usuário logado
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    if (user) {
      res.json(user)
    } else {
      res.status(404).json({ message: 'Usuário não encontrado' })
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar perfil', error })
  }
}

// Solicitar reset de senha
export const forgotPassword = async (req, res) => {
  const { email } = req.body

  const user = await User.findOne({ email })
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' })

  // Gerar token
  const resetToken = crypto.randomBytes(20).toString('hex')

  // Hash do token antes de salvar
  user.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')
  user.resetPasswordExpire = Date.now() + 30 * 60 * 1000 // 30 minutos

  await user.save()

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`

  const message = `
    <h1>Recuperação de senha</h1>
    <p>Clique no link para resetar sua senha:</p>
    <a href="${resetUrl}" target="_blank">${resetUrl}</a>
  `

  try {
    await sendEmail({
      email: user.email,
      subject: 'Recuperação de senha',
      message,
    })
    res.json({ message: 'Email de recuperação enviado!' })
  } catch (error) {
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save()
    res.status(500).json({ message: 'Erro ao enviar e-mail', error })
  }
}

// Resetar senha
export const resetPassword = async (req, res) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex')

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  })

  if (!user)
    return res.status(400).json({ message: 'Token inválido ou expirado' })

  user.password = req.body.password
  user.resetPasswordToken = undefined
  user.resetPasswordExpire = undefined

  await user.save()

  res.json({ message: 'Senha resetada com sucesso!' })
}

// 📌 Listar todos os usuários
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password') // 🔒 não retorna senha
    res.json(users)
  } catch (error) {
    console.error('❌ Erro ao listar usuários:', error)
    res
      .status(500)
      .json({ message: 'Erro ao listar usuários', error: error.message })
  }
}
