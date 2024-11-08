const socket = io('/');
const videoGrid = document.getElementById('video-grid');

const port = 3001;
console.log("peerjs port", port);

const myPeer = new Peer(undefined, {
  host: '/',
  port: port
});

const myVideo = document.createElement('video');
myVideo.muted = true;
const peers = {};

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  addVideoStream(myVideo, stream);

  myPeer.on('call', call => {
    console.log('Receiving call');
    call.answer(stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
      console.log('Receiving user video stream');
      addVideoStream(video, userVideoStream);
    });
    call.on('error', error => {
      console.error('Error during call:', error);
    });
  });

  socket.on('user-connected', userId => {
    console.log('User connected:', userId);
    connectToNewUser(userId, stream);
  });
}).catch(error => {
  console.error('Error accessing media devices:', error);
});

socket.on('user-disconnected', userId => {
  console.log('User disconnected:', userId);
  if (peers[userId]) peers[userId].close();
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});

myPeer.on('open', id => {
  console.log('Peer connection open, ID:', id);
  socket.emit('join-room', ROOM_ID, id);
});

function connectToNewUser(userId, stream) {
  console.log('Connecting to new user:', userId);
  const call = myPeer.call(userId, stream);
  const video = document.createElement('video');
  call.on('stream', userVideoStream => {
    console.log('Receiving stream from new user');
    addVideoStream(video, userVideoStream);
  });
  call.on('close', () => {
    console.log('Call closed with user:', userId);
    video.remove();
  });
  call.on('error', error => {
    console.error('Error during call with user:', userId, error);
  });

  peers[userId] = call;
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoGrid.append(video);
}
