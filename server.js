const express = require('express');
const cors = require('cors');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());


const { v4: uuidV4 } = require('uuid');
const { spawn } = require('child_process');

app.set('view engine', 'ejs');
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

app.get('/:room', (req, res) => {
  if (req.params.room === 'favicon.ico') {
    res.status(204).end();
    return;
  }

  const roomId = req.params.room;
  res.render('room', { roomId, port: PORT });

  console.log("Ejecutar build.js con roomId y port")
  const buildProcess = spawn('node', ['build.js', roomId, PORT]);

  buildProcess.stdout.on('data', (data) => {
    console.log("buildProcess")
    console.log(`stdout: ${data}`);
  });

  buildProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  buildProcess.on('close', (code) => {
    console.log(`build.js process exited with code ${code}`);
  });
});

server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});



