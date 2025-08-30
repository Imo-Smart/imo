import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cors from 'cors'
import http from 'http'
import { Server } from 'socket.io'

// Models
import Conversation from './models/Conversation.js'

// Rotas
import userRoutes from './routes/userRoutes.js'
import propertyRoutes from './routes/propertyRoutes.js'

// Configurações
dotenv.config()

// App Express
const app = express()

// Lista de origens permitidas
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:5173', 'https://imosmart.netlify.app']

// Middlewares
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

// Criando servidor HTTP único
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
    process.exit(1)
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

// ===== Socket.IO Chat =====
let users = []

io.on('connection', (socket) => {
  console.log('🟢 Novo cliente conectado:', socket.id)

  // Login do usuário
  socket.on('onLogin', async (user) => {
    console.log(`✅ Usuário logado: ${user.name}`)
    // Remove duplicado
    users = users.filter((u) => u.name !== user.name)
    const updatedUser = { ...user, online: true, socketId: socket.id, messages: [] }
    users.push(updatedUser)

    const admin = users.find((x) => x.name === 'Admin' && x.online)

    try {
      if (updatedUser.name === 'Admin') {
        const allConversations = await Conversation.find()
        io.to(updatedUser.socketId).emit('listUsers', users)
        io.to(updatedUser.socketId).emit('loadHistoryAll', allConversations)
      } else {
        const conversation = await Conversation.findOne({ userName: updatedUser.name })
        if (conversation && admin) {
          io.to(admin.socketId).emit('loadHistory', conversation.messages)
        }
      }
    } catch (err) {
      console.error('❌ Erro ao buscar conversas:', err.message)
    }
  })

  // Enviar mensagem
  socket.on('onMessage', async (message) => {
    try {
      const admin = users.find((x) => x.name === 'Admin' && x.online)

      if (message.from === 'Admin') {
        const user = users.find((x) => x.name === message.to && x.online)
        if (user) io.to(user.socketId).emit('message', message)

        let conversation = await Conversation.findOne({ userName: message.to })
        if (!conversation) conversation = new Conversation({ userName: message.to, messages: [] })
        conversation.messages.push(message)
        await conversation.save()
      } else {
        if (admin) io.to(admin.socketId).emit('message', message)

        let conversation = await Conversation.findOne({ userName: message.from })
        if (!conversation) conversation = new Conversation({ userName: message.from, messages: [] })
        conversation.messages.push(message)
        await conversation.save()

        if (!admin) {
          io.to(socket.id).emit('message', {
            from: 'System',
            to: message.from,
            body: 'Responderemos em breve.',
          })
        }
      }
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error.message)
    }
  })

  // Desconexão
  socket.on('disconnect', () => {
    const user = users.find((x) => x.socketId === socket.id)
    if (user) {
      console.log(`🔴 Cliente desconectado: ${user.name}`)
      user.online = false
      const admin = users.find((x) => x.name === 'Admin' && x.online)
      if (admin) io.to(admin.socketId).emit('updateUser', user)
    }
  })
})
// ===== Fim Socket.IO Chat =====

// Iniciando servidor
const PORT = process.env.PORT || 3333
httpServer.listen(PORT, () => {
  console.log(`💻 Server running on port ${PORT}`)
  console.log('🌍 Allowed origins:', allowedOrigins)
})
