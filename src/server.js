import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cors from 'cors'
import http from 'http'
import { Server } from 'socket.io'

// Rotas
import userRoutes from './routes/userRoutes.js'
import propertyRoutes from './routes/propertyRoutes.js'

// Configurações
dotenv.config()

// App Express
const app = express()

// Lista de origens permitidas (pode vir do .env)
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:5173', 'https://imosmart.netlify.app']

// Middlewares globais
app.use(express.json())
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
  })
)

// Criando um único servidor HTTP (API + WebSocket)
const httpServer = http.createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
})

// Conexão com o MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('📊 Connected to MongoDB')
  } catch (err) {
    console.error('❌ Error connecting to MongoDB:', err.message)
    process.exit(1) // encerra se não conectar
  }
}
connectDB()

// Rotas de teste
app.get('/test-server', (req, res) => {
  res.send('🚀 Imosmart server running! ✅')
})

// Rotas da aplicação
app.use('/api/users', userRoutes)
app.use('/api/properties', propertyRoutes)

// Eventos de WebSocket
io.on('connection', (socket) => {
  console.log('🟢 Novo cliente conectado:', socket.id)

  socket.on('disconnect', () => {
    console.log('🔴 Cliente desconectado:', socket.id)
  })
})

// Iniciando servidor
const PORT = process.env.PORT || 3333
httpServer.listen(PORT, () => {
  console.log(`💻 Server running on port ${PORT}`)
  console.log('🌍 Allowed origins:', allowedOrigins)
})
