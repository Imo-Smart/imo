import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cors from 'cors'
import path from 'path'
import http from 'http'
import { Server } from 'socket.io'

import userRouter from './routes/userRoutes.js'
import propertyRoutes from './routes/propertyRoutes.js'

dotenv.config()

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('`💻 server running')
  })
  .catch((err) => {
    console.log(err.message)
  })

const app = express()
app.use(cors())

const httpServer = http.Server(app)

const io = new Server(httpServer, { cors: { origin: '*' } })
const users = []

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/api/keys/paypal', (req, res) => {
  res.send(process.env.PAYPAL_CLIENT_ID || 'sb')
})
app.get('/api/keys/google', (req, res) => {
  res.send({ key: process.env.GOOGLE_API_KEY || '' })
})

app.use('/api/users', userRouter)
app.use('/api/properties', propertyRoutes)

const __dirname = path.resolve()
app.use(express.static(path.join(__dirname, '/frontend/build')))
app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, '/frontend/build/index.html')),
)

app.use((err, req, res) => {
  res.status(500).send({ message: err.message })
})

io.on('connection', (socket) => {
  socket.on('onLogin', (user) => {
    const updatedUser = {
      ...user,
      online: true,
      socketId: socket.id,
      messages: [],
    }

    const existUser = users.find((x) => x.name === updatedUser.name)
    if (existUser) {
      existUser.socketId = socket.id
      existUser.online = true
    } else {
      users.push(updatedUser)
    }
    const admin = users.find((x) => x.name === 'Admin' && x.online)
    if (admin) {
      io.to(admin.socketId).emit('updateUser', updatedUser)
    }
    if (updatedUser.name === 'Admin') {
      io.to(updatedUser.socketId).emit('listUsers', users)
    }
  })

  socket.on('disconnect', () => {
    const user = users.find((x) => x.socketId === socket.id)
    if (user) {
      user.online = false
      const admin = users.find((x) => x.name === 'Admin' && x.online)
      if (admin) {
        io.to(admin.socketId).emit('updateUser', user)
      }
    }
  })
  socket.on('onUserSelected', (user) => {
    const admin = users.find((x) => x.name === 'Admin' && x.online)
    if (admin) {
      const existUser = users.find((x) => x.name === user.name)
      io.to(admin.socketId).emit('selectUser', existUser)
    }
  })
  socket.on('onMessage', (message) => {
    if (message.from === 'Admin') {
      const user = users.find((x) => x.name === message.to && x.online)
      if (user) {
        io.to(user.socketId).emit('message', message)
        user.messages.push(message)
      } else {
        io.to(socket.id).emit('message', {
          from: 'System',
          to: 'Admin',
          body: 'Usuário offline',
        })
      }
    } else {
      const admin = users.find((x) => x.name === 'Admin' && x.online)
      if (admin) {
        io.to(admin.socketId).emit('message', message)
        const user = users.find((x) => x.name === message.from && x.online)
        if (user) {
          user.messages.push(message)
        }
      } else {
        io.to(socket.id).emit('message', {
          from: 'System',
          to: message.from,
          body: 'Responderemos, em breve',
        })
      }
    }
  })
})

const port = process.env.PORT || 3333
httpServer.listen(port, () => {
  console.log(`serve at http://localhost:${port}`)
})
