const socket = io('/')
const videoGrid = document.getElementById('video-grid')

const myPeer = new Peer(undefined, {
  host: location.hostname,
  port: location.port,
  secure: location.protocol === 'https:'
})

const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  console.log("getUserMedia")
  addVideoStream(myVideo, stream)

  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      console.log("addVideoStream")
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('user-connected', userId => {
    console.log('user-connected');
    connectToNewUser(userId, stream)
  })
})

socket.on('user-disconnected', userId => {
  console.log('user-disconnected');
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
  console.log('socket.emit.join-room');
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  console.log("connectToNewUser")
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    console.log("connectToNewUser.addVideoStream")
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}