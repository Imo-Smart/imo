import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    comment: { type: String, required: true },
    rating: { type: Number, required: true },
  },
  {
    timestamps: true,
  },
)

const spotSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    bedrooms: { type: String, required: true, unique: true },
    image: { type: String, required: true },
    bathrooms: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    countInStock: { type: Number, required: true },
    rating: { type: Number, required: true },
    numReviews: { type: Number, required: true },
    parking: { type: String, required: true },
    furnished: { type: String, required: true },
    address: { type: String, required: true, unique: true },
    offer: { type: String, required: false },
    regularPrice: { type: Number, required: true },
    discountedPrice: { type: Number, required: true },

    reviews: [reviewSchema],
  },
  {
    timestamps: true,
  },
)

const Spot = mongoose.model('Spot', spotSchema)
export default Spot
