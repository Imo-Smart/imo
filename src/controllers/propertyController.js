import Property from '../models/Property.js'
import { getCoordinatesFromAddress } from '../utils/geocode.js'

// Criar imóvel (apenas admin)
export const createProperty = async (req, res) => {
  try {
    const { ...data } = req.body

    // Pegar URLs das imagens enviadas
    if (req.files) {
      data.images = req.files.map((file) => file.path) // Cloudinary retorna a URL em file.path
    }

    // ➕ Buscar coordenadas pelo endereço
    const coords = await getCoordinatesFromAddress(data.address)
    if (coords) {
      data.location = coords
    }

    const property = new Property(data)
    const createdProperty = await property.save()
    res.status(201).json(createdProperty)
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar imóvel', error })
  }
}

// Listar todos imóveis
export const getProperties = async (req, res) => {
  try {
    const properties = await Property.find()
    res.json(properties)
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar imóveis', error })
  }
}

// Listar imóvel por ID
export const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
    if (!property)
      return res.status(404).json({ message: 'Imóvel não encontrado' })
    res.json(property)
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar imóvel', error })
  }
}

// Atualizar imóvel (apenas admin)
export const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
    if (!property)
      return res.status(404).json({ message: 'Imóvel não encontrado' })

    // Atualiza campos
    Object.assign(property, req.body)

    // Atualiza imagens se enviadas
    if (req.files) {
      property.images = req.files.map((file) => file.path)
    }

    const updatedProperty = await property.save()
    res.json(updatedProperty)
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar imóvel', error })
  }
}

// Deletar imóvel (apenas admin)
export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id)

    if (!property) {
      return res.status(404).json({ message: 'Imóvel não encontrado' })
    }

    res.json({ message: 'Imóvel deletado com sucesso!' })
  } catch (error) {
    console.error('❌ Erro ao deletar:', error)
    res
      .status(500)
      .json({ message: 'Erro ao deletar imóvel', error: error.message })
  }
}

export const getRandomImages = async (req, res) => {
  try {
    // Retorna 5 imagens aleatórias (ajuste o número se quiser mais)
    const properties = await Property.aggregate([
      { $sample: { size: 5 } }, // pega aleatoriamente
      { $project: { images: 1, name: 1 } }, // pega apenas images e nome
    ])

    // Pega a primeira imagem de cada imóvel
    const images = properties.map((p) => ({
      title: p.name,
      img: p.images[0],
      id: p._id,
    }))

    res.json(images)
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar imagens', error })
  }
}
