import express from 'express'
import expressAsyncHandler from 'express-async-handler'
import Spot from '../models/spotModel.js'
import { isAuth, isAdmin } from '../utils.js'

const spotRouter = express.Router()

// 📌 GET: Buscar todos os Spots
spotRouter.get(
  '/',
  expressAsyncHandler(async (req, res) => {
    const spots = await Spot.find()
    res.send(spots)
  }),
)

// 📌 POST: Criar um novo Spot (somente Admin autenticado)
spotRouter.post(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const newSpot = new Spot({
      name: 'Exemplo Spot ' + Date.now(),
      bedrooms: '2',
      image: '/images/default.jpg',
      bathrooms: '1',
      category: 'Aluguel',
      description: 'Descrição do exemplo',
      price: 100,
      countInStock: 5,
      rating: 4.0,
      numReviews: 0,
      parking: 'Sim',
      furnished: 'Sim',
      address: 'Endereço de Exemplo',
      offer: 'Desconto especial',
      regularPrice: 120,
      discountedPrice: 100,
      reviews: [],
    })

    const createdSpot = await newSpot.save()
    res.send({ message: 'Spot Criado', spot: createdSpot })
  }),
)

// 📌 PUT: Atualizar um Spot
spotRouter.put(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const spot = await Spot.findById(req.params.id)
    if (spot) {
      spot.name = req.body.name || spot.name
      spot.bedrooms = req.body.bedrooms || spot.bedrooms
      spot.image = req.body.image || spot.image
      spot.bathrooms = req.body.bathrooms || spot.bathrooms
      spot.category = req.body.category || spot.category
      spot.description = req.body.description || spot.description
      spot.price = req.body.price || spot.price
      spot.countInStock = req.body.countInStock || spot.countInStock
      spot.rating = req.body.rating || spot.rating
      spot.numReviews = req.body.numReviews || spot.numReviews
      spot.parking = req.body.parking || spot.parking
      spot.furnished = req.body.furnished || spot.furnished
      spot.address = req.body.address || spot.address
      spot.offer = req.body.offer || spot.offer
      spot.regularPrice = req.body.regularPrice || spot.regularPrice
      spot.discountedPrice = req.body.discountedPrice || spot.discountedPrice

      await spot.save()
      res.send({ message: 'Spot Atualizado' })
    } else {
      res.status(404).send({ message: 'Spot Não Encontrado' })
    }
  }),
)

// 📌 DELETE: Deletar um Spot
spotRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const spot = await Spot.findById(req.params.id)
    if (!spot) {
      return res.status(404).send({ message: 'Spot Não Encontrado' })
    }

    await spot.deleteOne()
    return res.send({ message: 'Spot Deletado' })
  }),
)

// 📌 GET: Buscar um Spot por ID
spotRouter.get(
  '/:id',
  expressAsyncHandler(async (req, res) => {
    const spot = await Spot.findById(req.params.id)
    if (spot) {
      res.send(spot)
    } else {
      res.status(404).send({ message: 'Spot Não Encontrado' })
    }
  }),
)

export default spotRouter
