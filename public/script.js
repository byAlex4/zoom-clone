const socket = io('mighty-oasis-96312-f0778e903b79.herokuapp.com', { // Cambia la URL al servidor correcto
  transports: ['websocket'], // Forzar WebSocket para evitar polling
});

const videoGrid = document.getElementById('video-grid')

const myPeer = new Peer(undefined, {
  host: 'mighty-oasis-96312-f0778e903b79.herokuapp.com',  // Usa el host actual
  port: location.port || (location.protocol === 'https:' ? 443 : 80), // Heroku maneja HTTP y HTTPS
  path: '/peerjs',
  secure: location.protocol === 'https:' // Asegúrate de que sea seguro si estás en HTTPS
})


const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true,
}).then(stream => {
  console.log("getUserMedia: Stream obtenido");
  addVideoStream(myVideo, stream);

  myPeer.on('call', call => {
    console.log("Recibiendo llamada");
    call.answer(stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
      console.log("Stream recibido de otro usuario");
      addVideoStream(video, userVideoStream);
    });
  });

  socket.on('user-connected', userId => {
    console.log(`Usuario conectado: ${userId}`);
    connectToNewUser(userId, stream);
  });
}).catch(error => {
  console.error("Error al obtener el stream:", error);
});

socket.on('user-disconnected', userId => {
  console.log(`Usuario desconectado: ${userId}`);
  if (peers[userId]) peers[userId].close();
});

myPeer.on('open', id => {
  console.log(`ID del cliente PeerJS abierto: ${id}`);
  socket.emit('join-room', ROOM_ID, id);
});

myPeer.on('error', error => {
  console.error("Error en PeerJS:", error);
});


function connectToNewUser(userId, stream) {
  console.log(`Conectando con nuevo usuario: ${userId}`);
  const call = myPeer.call(userId, stream);

  const video = document.createElement('video');
  call.on('stream', userVideoStream => {
    console.log("Stream recibido al conectar con nuevo usuario");
    addVideoStream(video, userVideoStream);
  });

  call.on('close', () => {
    console.log("Cerrando conexión con usuario");
    video.remove();
  });

  peers[userId] = call;
}


function addVideoStream(video, stream) {
  console.log("Agregando stream de video al DOM");
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoGrid.append(video);
}
