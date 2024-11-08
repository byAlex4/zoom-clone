const express = require('express')
const { ExpressPeerServer } = require('peer')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')

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

// Integración de PeerJS en el mismo servidor
const peerServer = ExpressPeerServer(server, {
  debug: true,
  path: '/peerjs'
})
app.use('/peerjs', peerServer)

// Usar el puerto asignado por Heroku
const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`)
})
