const socket = io('http://your-server-url:3000', { transports: ['websocket'] });
const videoGrid = document.getElementById('video-grid');

const myPeer = new Peer(undefined, {
  host: 'your-server-url',
  port: 3000,
  path: '/peerjs',
  secure: false,
});

const myVideo = document.createElement('video');
myVideo.muted = true;
const peers = {};

navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(stream => {
    console.log("Stream obtenido");
    addVideoStream(myVideo, stream);

    myPeer.on('call', call => {
      console.log("Recibiendo llamada");
      call.answer(stream);
      const video = document.createElement('video');
      call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on('user-connected', userId => {
      connectToNewUser(userId, stream);
    });
  })
  .catch(error => console.error("Error al obtener stream:", error));

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close();
});

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id);
});

myPeer.on('error', error => {
  console.error("Error en PeerJS:", error);
});

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement('video');
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream);
  });
  call.on('close', () => video.remove());
  peers[userId] = call;
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => video.play());
  videoGrid.append(video);
}
