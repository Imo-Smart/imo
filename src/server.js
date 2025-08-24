import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cors from 'cors'

import userRoutes from './routes/userRoutes.js'
import propertyRoutes from './routes/propertyRoutes.js'
import './socket/chatSocket.js'

dotenv.config()

console.log('Cloudinary API Key:', process.env.CLOUDINARY_API_KEY)

const app = express()

app.use(cors())
app.use(express.json())

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('📊 Connected to db'))
  .catch((err) => console.error('Error connected db:', err.message))

app.get('/test-server', (req, res) => {
  res.send('Imosmart server running! ✅')
})

app.use('/api/users', userRoutes)
app.use('/api/properties', propertyRoutes)

const PORT = process.env.PORT || 3333
app.listen(PORT, () => {
  console.log(`💻 Server running ${PORT}`)
})
