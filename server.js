const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')
const { PeerServer } = require('peer') // Importa PeerServer directamente

app.set('view engine', 'ejs')
app.use(express.static('public'))

// Configuración de rutas de Express
app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

// Configuración de Socket.IO
io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId)

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })
})

// Inicializa PeerJS en el mismo servidor
const peerServer = PeerServer({ port: process.env.PORT || 3000, path: '/peerjs' })
app.use(peerServer)  // Usamos peerServer en el mismo puerto

const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`)
})
