import react, { useEffect } from 'react';
import styled from 'styled-components';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';

import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import store from 'src/stores';
import { setVideoConnected } from 'src/stores/UserStore';
import { useAppSelector } from 'src/hooks';
import { Audiotrack } from '@mui/icons-material';
import WebRTC from 'src/web/WebRTC';
import Game from 'src/scenes/Game';
import phaserGame from 'src/PhaserGame';
import Bootstrap from 'src/scenes/Bootstrap';
import Colors from 'src/utils/Colors';

// styled.div with Shadow
const StyledAudioBox = styled.button`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 30%;
  background-color: ${Colors.indigo};
  font-size: 1rem;
  font-weight: 900;
  &:hover {
    background-color: ${Colors.skyblue[1]};
  }
`;

const StyledVideoBox = styled.button`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 30%;
  background-color: ${Colors.indigo};
  font-size: 1rem;
  font-weight: 900;

  &:hover {
    background-color: ${Colors.skyblue[1]};
  }
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  padding-left: 6px;
`;

//recording status that small red circle on the right bottom of the mic icon
const RecordingStatus = styled.div`
  position: absolute;
  bottom: 4px;
  right: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #DD0000;
`;


export default function ConnectionStatus() {
  const audioStatus = useAppSelector((state) => state.user.webcamAudioStatus);
  const videoStatus = useAppSelector((state) => state.user.webcamVideoStatus);
  const bootstrap = phaserGame.scene.keys.bootstrap as Bootstrap;

  return (
    <Wrapper>
      <StyledAudioBox onClick={() => bootstrap.network.webRTC?.toggleAudio()}>
        {audioStatus ? (
          <MicIcon fontSize="large" sx={{ color: Colors.white }}/>
        ) : (
          <MicOffIcon fontSize="large" sx={{ color: '#DD0000' }} />
        )}
        {audioStatus ? (<RecordingStatus/>):null}
      </StyledAudioBox>
      <StyledVideoBox onClick={() => bootstrap.network.webRTC?.toggleVideo()}>
        {videoStatus ? (
          <VideocamIcon fontSize="large" sx={{ color: Colors.white }} />
        ) : (
          <VideocamOffIcon fontSize="large" sx={{ color: '#DD0000' }} />
        )}
        {videoStatus ? (<RecordingStatus/>):null}
      </StyledVideoBox>
      
    </Wrapper>
  );
}
