// routes/propertyRoutes.js
import express from 'express'
import upload from '../middleware/upload.js'
import {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  addReview,
} from '../controllers/propertyController.js'

import { isAuth, isAdmin } from '../utils/utils.js'

const router = express.Router()

// CRUD
/* router.post('/test-upload', upload.array('images', 5), (req, res) => {
  console.log('BODY:', req.body)
  console.log('FILES:', req.files)
  res.json({ body: req.body, files: req.files })
}) */
router.post(
  '/add-properties',
  upload.array('images', 5),
  isAdmin,
  createProperty,
) // Criar
router.get('/', isAdmin, getProperties) // Listar todos
router.get('/:id', isAuth, isAdmin, getPropertyById) // Buscar por ID
router.put('/:id', upload.array('images', 5), isAdmin, updateProperty) // Atualizar
router.delete('/:id', isAdmin, deleteProperty) // Deletar
router.post('/:id/reviews', isAuth, isAdmin, addReview)

export default router
