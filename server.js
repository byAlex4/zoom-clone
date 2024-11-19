const express = require('express');
const { ExpressPeerServer } = require('peer');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server, {
  cors: {
    origin: '*', // O define un dominio específico si no quieres usar '*'
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'], // Asegúrate de soportar ambos transportes
});
app.use(cors());



const { v4: uuidV4 } = require('uuid');
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Configuración de rutas de Express
app.get('/', (req, res) => {
  console.log('Redirigiendo a una nueva sala');
  res.redirect(`/${uuidV4()}`);
});

app.get('/favicon.ico', (req, res) => {
  res.status(204).end(); // Responde con No Content (204) para ignorar la solicitud
});

app.get('/:room', (req, res) => {
  const roomId = req.params.room;
  if (!roomId || roomId === 'favicon.ico') {
    console.error('Solicitud inválida para roomId:', roomId);
    return res.status(400).send('Invalid room ID');
  }
  console.log(`Renderizando sala con ID: ${roomId}`);
  res.render('room', { roomId });
});

// Configuración de Socket.IO para manejar la oferta y respuesta
io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado:', socket.id);

  socket.on('join-room', (roomId, userId) => {
    if (!roomId || !userId) {
      console.error('Error: roomId o userId faltantes');
      return;
    }

    console.log(`Usuario ${userId} se unió a la sala ${roomId}`);
    socket.join(roomId);

    // Validar si hay más usuarios en la sala
    const room = io.sockets.adapter.rooms.get(roomId);
    if (room && room.size > 1) {
      socket.to(roomId).emit('user-connected', userId);
      console.log('user-connected', userId)
    } else {
      console.log(`No hay otros usuarios en la sala ${roomId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Integración de PeerJS en el mismo servidor
const peerServer = ExpressPeerServer(server, {
  debug: true,
  path: '/',
});
app.use('/peerjs', peerServer);

// Usar el puerto asignado por Heroku
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
