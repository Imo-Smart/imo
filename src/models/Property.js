import mongoose from 'mongoose'

// Schema de review
const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String },
  },
  { timestamps: true },
)

// Schema de imóvel
// Schema de imóvel
const propertySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    bedrooms: { type: String, required: true },
    bathrooms: { type: String, required: true },
    images: [{ type: String, required: true }],
    category: {
      type: String,
      enum: ['casa', 'apartamento', 'terreno', 'chacara', 'sitio'],
      required: true,
    },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    countInStock: { type: Number, required: true },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    parking: { type: String, required: true },
    furnished: { type: String, required: true },
    address: { type: String, required: true, unique: true },
    offer: { type: String },
    regularPrice: { type: Number, required: true },
    discountedPrice: { type: Number, required: true },
    type: { type: String, enum: ['sale', 'rental'], required: true },
    rentalDetails: {
      duration: { type: String, enum: ['short-term', 'long-term'] },
      deposit: { type: Number },
      monthlyRent: { type: Number },
    },
    reviews: [reviewSchema],

    // ➕ Localização geográfica
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  { timestamps: true },
)


export default mongoose.model('Property', propertySchema)
