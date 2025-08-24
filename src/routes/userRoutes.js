import express from 'express'
import {
  registerUser,
  loginUser,
  getUserProfile,
  forgotPassword,
  resetPassword,
  getUsers,
} from '../controllers/userController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

// Cadastro
router.post('/register', registerUser)

// Login
router.post('/login', loginUser)

// Perfil (apenas usuário logado)
router.get('/profile', protect, getUserProfile)

// Exemplo de rota apenas para admin
router.get('/admin-only', protect, admin, (req, res) => {
  res.json({ message: 'Bem-vindo Admin!' })
})

// Solicitar reset
router.post('/forgot-password', forgotPassword)

// Resetar senha
router.put('/reset-password/:token', resetPassword)

// 📌 Somente admin pode ver todos os usuários
router.get('/user', protect, admin, getUsers)

export default router
