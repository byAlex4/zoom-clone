const express = require('express');
const { ExpressPeerServer } = require('peer');
const app = express();
const server = require('http').createServer(app);
const cors = require('cors');

const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:8081', // O define un dominio específico si no quieres usar '*'
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'], // Asegúrate de soportar ambos transportes
});

app.use(cors({
  origin: 'http://localhost:8081',
  methods: ["GET", "POST"],
}));




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
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", (roomId, userId) => {
    console.log(`User ${userId} joined room ${roomId}`);
    socket.join(roomId);
    socket.to(roomId).emit("user-connected", userId);
  });

  socket.on("offer", (offer) => {
    console.log("Received offer:", offer);
    const room = Array.from(socket.rooms).find((r) => r !== socket.id);
    if (room) {
      socket.to(room).emit("offer", offer);
    }
  });

  socket.on("answer", (answer) => {
    console.log("Received answer:", answer);
    const room = Array.from(socket.rooms).find((r) => r !== socket.id);
    if (room) {
      socket.to(room).emit("answer", answer);
    }
  });

  socket.on("ice-candidate", (candidate) => {
    console.log("Received ICE candidate:", candidate);
    const room = Array.from(socket.rooms).find((r) => r !== socket.id);
    if (room) {
      socket.to(room).emit("ice-candidate", candidate);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    // Informar a otros usuarios en la sala si es necesario
  });

  socket.on("connection_error", (err) => {
    console.log(err.req);      // the request object
    console.log(err.code);     // the error code, for example 1
    console.log(err.message);  // the error message, for example "Session ID unknown"
    console.log(err.context);  // some additional error context
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
