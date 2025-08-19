import express from 'express'
import {
  registerUser,
  loginUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  forgotPassword,
  resetPassword,
} from '../controllers/userController.js'

import { isAdmin } from '../utils/utils.js'

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)

router.get('/', isAdmin, getUsers)
router.get('/:id', isAdmin, getUserById)
router.put('/:id', isAdmin, updateUser)
router.delete('/:id', isAdmin, deleteUser)

// Recuperação de senha
router.post('/forgot-password', forgotPassword)
router.post('/reset-password/:token', resetPassword)

export default router
