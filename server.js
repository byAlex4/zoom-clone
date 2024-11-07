const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server, {
  transports: ['websocket', 'polling']
});
const { v4: uuidV4 } = require('uuid');

app.set('view engine', 'ejs');
app.use(express.static('public'));

const PORT = process.env.PORT || 3000; // Define PORT aquí

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

app.get('/:room', (req, res) => {
  const port = process.env.PORT || 3000;
  console.log(`Rendering room with port: ${port}`);
  res.render('room', { roomId: req.params.room, port: port });
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
