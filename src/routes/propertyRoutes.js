// routes/propertyRoutes.js
import express from 'express'
import {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  addReview,
} from '../controllers/propertyController.js'
import upload from '../middleware/upload.js'
import { isAuth, isAdmin } from '../utils/utils.js'

const router = express.Router()

// CRUD
router.post('/', upload.array('images', 5), isAdmin, createProperty) // Criar
router.get('/', isAuth, isAdmin, getProperties) // Listar todos
router.get('/:id', isAuth, isAdmin, getPropertyById) // Buscar por ID
router.put('/:id', upload.array('images', 5), isAdmin, updateProperty) // Atualizar
router.delete('/:id', isAdmin, deleteProperty) // Deletar
router.post('/:id/reviews', isAuth, isAdmin, addReview)

export default router
