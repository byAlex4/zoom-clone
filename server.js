const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server, {
  transports: ['websocket', 'polling']
});
const { v4: uuidV4 } = require('uuid');

const { exec } = require('child_process');

app.set('view engine', 'ejs');
app.use(express.static('public'));

const PORT = 3000;

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room, port: PORT });
});

// Ejecutar build.js con roomId y port
exec(`node build.js ${roomId} ${PORT}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error ejecutando build.js: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
});

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('join-room', (roomId, userId) => {
    console.log('join-room event received:', roomId, userId);
    if (roomId && userId) {
      socket.join(roomId);
      const room = socket.to(roomId);
      if (room && room.broadcast) {
        try {
          room.broadcast.emit('user-connected', userId);
          console.log('user-connected event emitted:', userId);
        } catch (error) {
          console.error('Error emitting user-connected:', error);
        }
      } else {
        console.error('room or room.broadcast is undefined');
      }
    } else {
      console.error('roomId or userId is undefined');
    }

    socket.on('disconnect', () => {
      console.log('user disconnected:', userId);
      const room = socket.to(roomId);
      if (room && room.broadcast) {
        try {
          room.broadcast.emit('user-disconnected', userId);
          console.log('user-disconnected event emitted:', userId);
        } catch (error) {
          console.error('Error emitting user-disconnected:', error);
        }
      } else {
        console.error('room or room.broadcast is undefined on disconnect');
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
