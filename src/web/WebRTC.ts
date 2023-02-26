import Peer from 'peerjs';
import Network from '../services/Network';
import store from '../stores';
import { setVideoConnected, setwebcamAudioStatus, setwebcamVideoStatus } from '../stores/UserStore';

export default class WebRTC {
  private myPeer: Peer;
  private peers = new Map<string, { call: Peer.MediaConnection; video: HTMLVideoElement }>();
  private onCalledPeers = new Map<
    string,
    { call: Peer.MediaConnection; video: HTMLVideoElement }
  >();
  private videoGrid = document.querySelector('.video-grid');
  // private buttonGrid = document.querySelector('.myNavbar');
  private myVideo = document.createElement('video');
  private myStream?: MediaStream;
  private network: Network;

  constructor(userId: string, network: Network) {
    const sanitizedId = this.replaceInvalidId(userId);
    this.myPeer = new Peer(sanitizedId);
    this.network = network;
    this.myPeer.on('error', (err) => {
      console.error(err);
    });
    // mute your own video stream (you don't want to hear yourself)
    this.myVideo.muted = true;

    // config peerJS
    this.initialize();
  }

  // PeerJS throws invalid_id error if it contains some characters such as that colyseus generates.
  // https://peerjs.com/docs.html#peer-id
  private replaceInvalidId(userId: string) {
    return userId.replace(/[^0-9a-z]/gi, 'G');
  }

  initialize() {
    this.myPeer.on('call', (call) => {
      if (!this.onCalledPeers.has(call.peer)) {
        call.answer(this.myStream);
        const video = document.createElement('video');
        this.onCalledPeers.set(call.peer, { call, video });

        call.on('stream', (userVideoStream) => {
          this.addVideoStream(video, userVideoStream);
        });
      }
      // on close is triggered manually with deleteOnCalledVideoStream()
    });
  }

  // check if permission has been granted before
  checkPreviousPermission() {
    const permissionName = 'microphone' as PermissionName;
    navigator.permissions?.query({ name: permissionName }).then((result) => {
      if (result.state === 'granted') this.getUserMedia(false);
    });
  }

  getUserMedia(alertOnError = true) {
    // ask the browser to get user media
    navigator.mediaDevices
      ?.getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        this.myStream = stream;
        this.addVideoStream(this.myVideo, this.myStream);
        // this.setUpButtons();
        store.dispatch(setVideoConnected(true));
        store.dispatch(setwebcamAudioStatus(true));
        store.dispatch(setwebcamVideoStatus(true));
        this.network.videoConnected();
      })
      .catch(() => {
        if (alertOnError) window.alert('No webcam or microphone found, or permission is blocked');
      });
  }

  // method to call a peer
  connectToNewUser(userId: string) {
    if (this.myStream) {
      const sanitizedId = this.replaceInvalidId(userId);
      if (!this.peers.has(sanitizedId)) {
        const call = this.myPeer.call(sanitizedId, this.myStream);
        const video = document.createElement('video');
        this.peers.set(sanitizedId, { call, video });

        call.on('stream', (userVideoStream) => {
          this.addVideoStream(video, userVideoStream);
        });

        // on close is triggered manually with deleteVideoStream()
      }
    }
  }

  // method to add new video stream to videoGrid div
  addVideoStream(video: HTMLVideoElement, stream: MediaStream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
      video.play();
    });
    video.addEventListener('volumechange', () => {
      if (video.volume === 0) {
        video.muted = true;
      } else {
        video.muted = false;
      }
      video.style.border = '5px solid red';
    });
    if (this.videoGrid) this.videoGrid.append(video);
  }

  // method to remove video stream (when we are the host of the call)
  deleteVideoStream(userId: string) {
    const sanitizedId = this.replaceInvalidId(userId);
    if (this.peers.has(sanitizedId)) {
      const peer = this.peers.get(sanitizedId);
      peer?.call.close();
      peer?.video.remove();
      this.peers.delete(sanitizedId);
    }
  }

  // method to remove video stream (when we are the guest of the call)
  deleteOnCalledVideoStream(userId: string) {
    const sanitizedId = this.replaceInvalidId(userId);
    if (this.onCalledPeers.has(sanitizedId)) {
      const onCalledPeer = this.onCalledPeers.get(sanitizedId);
      onCalledPeer?.call.close();
      onCalledPeer?.video.remove();
      this.onCalledPeers.delete(sanitizedId);
    }
  }

  // method to set up mute/unmute and video on/off buttons
  // setUpButtons() {
  //   const audioButton = document.createElement('button');
  //   audioButton.innerText = '쉿!';
  //   audioButton.addEventListener('click', () => {
  //     if (this.myStream) {
  //       const audioTrack = this.myStream.getAudioTracks()[0];
  //       if (audioTrack.enabled) {
  //         audioTrack.enabled = false;
  //         audioButton.innerText = '얘기할래요';
  //       } else {
  //         audioTrack.enabled = true;
  //         audioButton.innerText = '쉿!';
  //       }
  //     }
  //   });
  //   const videoButton = document.createElement('button');
  //   videoButton.innerText = '얼굴 안보기';
  //   videoButton.addEventListener('click', () => {
  //     if (this.myStream) {
  //       const videoTrack = this.myStream.getVideoTracks()[0];
  //       if (videoTrack.enabled) {
  //         videoTrack.enabled = false;
  //         videoButton.innerText = '얼굴 보기';
  //       } else {
  //         videoTrack.enabled = true;
  //         videoButton.innerText = '얼굴 안보기';
  //       }
  //     }
  //   });
  //   this.buttonGrid?.append(audioButton);
  //   this.buttonGrid?.append(videoButton);
  // }

  toggleVideo() {
    if (this.myStream) {
      const videoTrack = this.myStream.getVideoTracks()[0];
      if (videoTrack.enabled) {
        videoTrack.enabled = false;
        store.dispatch(setwebcamVideoStatus(false));
      } else {
        videoTrack.enabled = true;
        store.dispatch(setwebcamVideoStatus(true));
      }
    }
  }
  toggleAudio() {
    if (this.myStream) {
      const audioTrack = this.myStream.getAudioTracks()[0];
      if (audioTrack.enabled) {
        audioTrack.enabled = false;
        store.dispatch(setwebcamAudioStatus(false));
      } else {
        audioTrack.enabled = true;
        store.dispatch(setwebcamAudioStatus(true));
      }
    }
  }
}
