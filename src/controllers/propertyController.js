// controllers/propertyController.js
import Property from '../models/propertyModel.js'

// Criar novo imóvel
// Criar imóvel com upload de imagens
export const createProperty = async (req, res) => {
  try {
    const images = req.files.map((file) => file.path) // pegar URLs do Cloudinary

    const property = new Property({
      ...req.body,
      images,
    })

    const savedProperty = await property.save()
    res.status(201).json(savedProperty)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Listar todos os imóveis
export const getProperties = async (req, res) => {
  try {
    const properties = await Property.find({})
    res.json(properties)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Buscar imóvel por ID
export const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
    if (property) {
      res.json(property)
    } else {
      res.status(404).json({ message: 'Imóvel não encontrado' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Atualizar imóvel e imagens
export const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
    if (!property)
      return res.status(404).json({ message: 'Imóvel não encontrado' })

    if (req.files && req.files.length > 0) {
      const images = req.files.map((file) => file.path)
      property.images = images
    }

    Object.assign(property, req.body)

    const updatedProperty = await property.save()
    res.json(updatedProperty)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Deletar imóvel
export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id)
    if (property) {
      res.json({ message: 'Imóvel removido com sucesso' })
    } else {
      res.status(404).json({ message: 'Imóvel não encontrado' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Adicionar review a um imóvel
export const addReview = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
    if (!property)
      return res.status(404).json({ message: 'Imóvel não encontrado' })

    const { name, comment, rating } = req.body

    // Criar review
    const review = {
      name,
      comment,
      rating: Number(rating),
    }

    property.reviews.push(review)
    property.numReviews = property.reviews.length
    property.rating =
      property.reviews.reduce((acc, item) => item.rating + acc, 0) /
      property.reviews.length

    await property.save()

    res.status(201).json({ message: 'Review adicionada com sucesso', review })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}
