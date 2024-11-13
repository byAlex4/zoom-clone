const express = require('express')
const { ExpressPeerServer } = require('peer')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server, {
  cors: {
    origin: '*',  // Usa la URL específica de tu aplicación React Native/Expo
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const { v4: uuidV4 } = require('uuid')

app.set('view engine', 'ejs')
app.use(express.static('public'))

// Configuración de rutas de Express
app.get('/', (req, res) => {
  console.log('Redirigiendo a una nueva sala')
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
  console.log(`Renderizando sala con ID: ${req.params.room}`)
  res.render('room', { roomId: req.params.room })
})

// Configuración de Socket.IO
io.on('connection', socket => {
  console.log('Nuevo cliente conectado')

  socket.on('join-room', (roomId, userId) => {
    console.log(`Usuario ${userId} se unió a la sala ${roomId}`)
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId)

    socket.on('disconnect', () => {
      console.log(`Usuario ${userId} se desconectó de la sala ${roomId}`)
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })
})

// Integración de PeerJS en el mismo servidor
const peerServer = ExpressPeerServer(server, {
  debug: true,
  path: '/'
})
app.use('/peerjs', peerServer)

// Usar el puerto asignado por Heroku
const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`)
})
