import mongoose from 'mongoose'

// Sub-schema para reviews
const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    comment: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
  },
  {
    timestamps: true,
  },
)

// Schema principal
const propertySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    bedrooms: { type: String, required: true },
    image: { type: String, required: true },
    bathrooms: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    countInStock: { type: Number, required: true },
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    parking: { type: String, required: true },
    furnished: { type: String, required: true },
    address: { type: String, required: true, unique: true },
    offer: { type: String }, // opcional
    regularPrice: { type: Number, required: true },
    discountedPrice: { type: Number, required: true },

    type: {
      type: String,
      enum: ['sale', 'rental'], // 🔑 compra (venda) ou aluguel
      required: true,
    },

    rentalDetails: {
      duration: { type: String, enum: ['short-term', 'long-term'] },
      deposit: { type: Number },
      monthlyRent: { type: Number },
    },

    reviews: [reviewSchema],
  },
  {
    timestamps: true,
  },
)

const Property = mongoose.model('Property', propertySchema)
export default Property
