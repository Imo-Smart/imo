// backend/src/controllers/userController.js
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import User from '../models/userModel.js'
import { generateToken } from '../utils/utils.js'
import { sendEmail } from '../config/email.js' // função segura para enviar email

// @desc    Criar novo usuário
// @route   POST /api/users
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body

    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({ message: 'Usuário já cadastrado' })
    }

    const hashedPassword = bcrypt.hashSync(password, 10)

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
    })

    // Email de boas-vindas em HTML
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #4CAF50;">Bem-vindo ao ImoSmart, ${user.name}!</h2>
        <p>Olá ${user.name},</p>
        <p>
          Estamos muito felizes em ter você na nossa plataforma. Agora você pode explorar os melhores imóveis para
          <strong>compra</strong> ou <strong>aluguel</strong> de forma rápida e segura.
        </p>
        <p>
          Caso precise de ajuda ou tenha alguma dúvida, nossa equipe está à disposição.
        </p>
        <p style="margin-top: 30px;">Atenciosamente,<br/><strong>Equipe ImoSmart 🏡</strong></p>
      </div>
    `

    // Envia o email, mas não trava se falhar
    try {
      await sendEmail({
        to: user.email,
        subject: 'Bem-vindo ao ImoSmart 🏡',
        text: `Olá ${user.name}, seja bem-vindo ao ImoSmart!`,
        html: emailHtml,
      })
    } catch (err) {
      console.log('Erro ao enviar email de boas-vindas:', err.message)
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      token: generateToken(user),
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Login usuário
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email })
  if (user && bcrypt.compareSync(password, user.password)) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isAdmin: user.isAdmin,
      token: generateToken(user),
    })
  } else {
    res.status(401).json({ message: 'Email ou senha inválidos' })
  }
}

// @desc    Buscar todos usuários
// @route   GET /api/users
// @access  Admin
export const getUsers = async (req, res) => {
  const users = await User.find({}).select('-password')
  res.json(users)
}

// @desc    Buscar usuário por ID
// @route   GET /api/users/:id
// @access  Admin/User
export const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select('-password')
  if (user) {
    res.json(user)
  } else {
    res.status(404).json({ message: 'Usuário não encontrado' })
  }
}

// @desc    Atualizar usuário
// @route   PUT /api/users/:id
// @access  Admin/User
export const updateUser = async (req, res) => {
  const user = await User.findById(req.params.id)

  if (user) {
    user.name = req.body.name || user.name
    user.phone = req.body.phone || user.phone
    user.email = req.body.email || user.email

    if (req.body.password) {
      user.password = bcrypt.hashSync(req.body.password, 10)
    }

    const updatedUser = await user.save()
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      isAdmin: updatedUser.isAdmin,
    })
  } else {
    res.status(404).json({ message: 'Usuário não encontrado' })
  }
}

// @desc    Deletar usuário
// @route   DELETE /api/users/:id
// @access  Admin
export const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id)
  if (user) {
    await user.remove()
    res.json({ message: 'Usuário removido' })
  } else {
    res.status(404).json({ message: 'Usuário não encontrado' })
  }
}

// @desc    Esqueci a senha (gera token e manda por email)
// @route   POST /api/users/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  const { email } = req.body
  const user = await User.findOne({ email })

  if (!user) {
    return res.status(404).json({ message: 'Usuário não encontrado' })
  }

  const resetToken = crypto.randomBytes(32).toString('hex')
  user.passwordResetToken = resetToken
  user.passwordResetExpires = Date.now() + 3600000 // 1 hora
  await user.save()

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`

  try {
    await sendEmail({
      to: user.email,
      subject: '🔐 Recuperação de Senha - ImoSmart',
      text: `Você solicitou a recuperação de senha. Para redefinir, acesse o link: ${resetUrl}`,
      html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #4CAF50;">Recuperação de Senha</h2>
      <p>Olá ${user.name},</p>
      <p>Recebemos uma solicitação para redefinir sua senha no <strong>ImoSmart</strong>.</p>
      <p>Para continuar, clique no botão abaixo:</p>
      <a href="${resetUrl}"
         style="display: inline-block; margin: 20px 0; padding: 12px 20px; background-color: #4CAF50; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">
         🔑 Redefinir Senha
      </a>
      <p>Ou, se preferir, copie e cole o link abaixo no seu navegador:</p>
      <p style="word-break: break-word; color: #555;">${resetUrl}</p>
      <p style="margin-top: 30px; font-size: 14px; color: #888;">
        Se você não solicitou a recuperação de senha, ignore este e-mail.
        Sua conta permanecerá segura.
      </p>
      <p style="margin-top: 20px;">Atenciosamente,<br/><strong>Equipe ImoSmart 🏡</strong></p>
    </div>
  `,
    })
  } catch (err) {
    console.log('Erro ao enviar email de recuperação:', err.message)
  }

  res.json({ message: 'Email de recuperação enviado' })
}

// @desc    Resetar senha com token
// @route   POST /api/users/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
  const { token } = req.params
  const { password } = req.body

  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() },
  })

  if (!user) {
    return res.status(400).json({ message: 'Token inválido ou expirado' })
  }

  user.password = bcrypt.hashSync(password, 10)
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined

  await user.save()

  res.json({ message: 'Senha redefinida com sucesso' })
}
