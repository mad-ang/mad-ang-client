import react, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import EditIcon from '@mui/icons-material/Edit';
import ClearIcon from '@mui/icons-material/Clear';
import { SetWhichModalActivated, ModalState } from '../../../../stores/NavbarStore';
import { setFocused } from 'src/stores/ChatStore';
import { useAppSelector, useAppDispatch } from '../../../../hooks';
import DefaultAvatar from 'src/assets/profiles/DefaultAvatar.png';
import Colors from 'src/utils/Colors';
import InputBase from '@mui/material/InputBase';
import Select from 'react-select';
import { infoItemList, Option, genderOptions, ageOptions, heightOptions } from './data';
import { authenticateUser, getUserInfo, updateUserInfo } from 'src/api/auth';
import Cookies from 'universal-cookie';
const cookies = new Cookies();
import Game from 'src/scenes/Game';
import phaserGame from 'src/PhaserGame';

import {
  setUserProfile as setStoreUserProfile,
  setUsername as setStoreUsername,
  setUserProfile,
} from 'src/stores/UserStore';
import { addImage } from 'src/api/s3';

function ProfileEditModal(props) {
  const originalUsername = useAppSelector((state) => state.user.username);
  const originalUserProfile = useAppSelector((state) => state.user.userProfile);
  const [userProfileImg, setUserProfileImg] = useState<any>(
    originalUserProfile?.profileImgUrl || DefaultAvatar
  );
  const [editable, setEditable] = useState(false);
  const [username, setUsername] = useState(cookies.get('playerName') || '');
  const [gender, setGender] = useState<string>(originalUserProfile.gender);
  const [age, setAge] = useState<string>(originalUserProfile.age);
  const [height, setHeight] = useState<string>(originalUserProfile.heigth);
  const dispatch = useAppDispatch();
  let refIndex = 0;
  const focused = useAppSelector((state) => state.chat.focused);

  const inputRefs = useRef<any>([]);
  const imgRef = useRef<any>(null);
  function handleClick() {
    dispatch(SetWhichModalActivated(ModalState.None));
  }

  const handleChangeUserProfile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event?.target?.files;
    if (!files) return;
    const imgUrl = await addImage('profile', files);
    setUserProfileImg(imgUrl);
  };

  const handleChangeUsername = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!editable) return;
    setUsername(event.target.value); //colyseus에서의 유저이름 변경
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      // move focus back to the game
      setEditable(false);
    }
    if (event.key === 'Enter') {
      try {
        event.preventDefault();
        inputRefs.current[++refIndex].focus();
      } catch (error) {
        // setEditable(false);
        // if (editable) save();
      }
    }
  };

  const edit = () => {
    setEditable(true);
    if (inputRefs?.current) {
      inputRefs.current[0].focus();
    }
  };

  const save = () => {
    let authFlag = 0;
    setEditable(false);
    // if (inputRefs?.current) {
    //   inputRefs.current.blur();
    // }

    const isAuth = authenticateUser();
    if (!isAuth) {
      alert('사용자 정보 인증 오류');
      return;
    }
    authFlag = 1;

    const game = phaserGame.scene.keys.game as Game;
    if (originalUsername !== username) {
      game.myPlayer.setPlayerName(username, authFlag);
      dispatch(setStoreUsername(username));
    }

    let newUserInfo = {
      profileImgUrl: userProfileImg === DefaultAvatar ? '' : userProfileImg,
      gender: gender,
      age: age,
      height: height,
    };

    game.myPlayer.setPlayerInfo(newUserInfo, authFlag);
    dispatch(setUserProfile(newUserInfo));
  };

  const updateAtOnce = (username, additionalInfo) => {
    setUsername(username);
    setUserProfileImg(additionalInfo.profileImgUrl || DefaultAvatar);
    setGender(additionalInfo.gender);
    setAge(additionalInfo.age);
    setHeight(additionalInfo.height);
  };

  useEffect(() => {
    (async () => {
      getUserInfo()
        .then((response) => {
          if (!response) return;
          const { userId, username, userProfile, ...otherInfo } = response;
          updateAtOnce(username, userProfile);
        })
        .catch((error) => {
          console.error(error);
        });
    })();
  }, []);

  return (
    <ProfileSettingEditor>
      <ProfileHeader>

        <DirtyTalk>
          <TitleImage src={'src/assets/directmessage/parasol.png'} width="30" />

          <TitleText>프로필 수정</TitleText>
        </DirtyTalk>
        <ButtonWrapper onClick={handleClick}>
          <ClearIcon fontSize="large" sx={{ color: Colors.skyblue[2] }} />
        </ButtonWrapper>

      </ProfileHeader>
      <ProfileBody>
        <ImageWrapper editable={editable}>
          {editable ? (
            <div className="personal-image">
              <label className="label">
                <input type="file" onChange={handleChangeUserProfile} />
                <figure className="personal-figure">
                  <ProfileAvatarImage
                    ref={imgRef}
                    src={userProfileImg}
                    className="personal-avatar"
                    alt="avatar"
                    style={{ marginTop: -32, marginLeft: -81 }}
                    onError={() => {
                      if (imgRef.current) return (imgRef.current.src = DefaultAvatar);
                    }}
                  />
                  <figcaption
                    style={{ marginTop: -2, marginLeft: -82 }}
                    className="personal-figcaption"
                  >
                    <CameraImage src="https://raw.githubusercontent.com/ThiagoLuizNunes/angular-boilerplate/master/src/assets/imgs/camera-white.png" />
                  </figcaption>
                </figure>
              </label>
            </div>
          ) : (
            <div className="personal-image">
              <ProfileAvatarImage
                ref={imgRef}
                src={userProfileImg}
                className="personal-avatar"
                alt="avatar"
                onError={() => {
                  if (imgRef.current) return (imgRef.current.src! = DefaultAvatar);
                }}
              />
            </div>
          )}
        </ImageWrapper>
        <ProfileUserName editable={editable}>
          <InputWrapper>
            <InputTextField
              inputRef={(el) => (inputRefs.current[0] = el)}
              readOnly={!editable}
              value={username}
              placeholder={'사용자 이름'}
              autoFocus={editable}
              onKeyDown={handleKeyDown}
              onChange={handleChangeUsername}
              onFocus={() => {
                if (!focused) {
                  dispatch(setFocused(true));
                }
              }}
              onBlur={() => {
                dispatch(setFocused(false));
              }}
              inputProps={{ maxLength: 10 }}
            />
          </InputWrapper>
        </ProfileUserName>
        <InfoContainer editable={editable}>
          {infoItemList?.map((item, index) => (
            <InfoItem key={item.id}>
              <InfoLabelArea>{item.label}</InfoLabelArea>
              <InfoSelectionArea>
                <InfoSelection
                  ref={(el) => (inputRefs.current[index + 1] = el)}
                  onKeyDown={handleKeyDown}
                  components={{ DropdownIndicator: () => null, IndicatorSeparator: () => null }}
                  menuPlacement={'top'}
                  isSearchable={editable}
                  menuIsOpen={!editable ? false : undefined}
                  value={
                    item.id === 1
                      ? { value: gender, label: gender || '-' }
                      : item.id === 2
                      ? { value: age, label: age || '-' }
                      : item.id === 3
                      ? { value: height, label: height || '-' }
                      : item.id === 4
                      ? '요소4'
                      : '요소5'
                  }
                  placeholder={item.label}
                  onChange={(choice: any) => {
                    item.id === 1
                      ? setGender(choice.value)
                      : item.id === 2
                      ? setAge(choice.value)
                      : item.id === 3
                      ? setHeight(choice.value)
                      : () => {};
                  }}
                  options={item.options}
                  styles={{
                    menuPortal: (base) => ({
                      ...base,
                      zIndex: 9999,
                    }),
                    control: (base, state) => ({
                      ...base,
                      '&:hover': { borderColor: 'lightgray' },
                      border: '1px solid lightgray',
                      boxShadow: 'none',
                    }),
                  }}
                  menuPortalTarget={document.body}
                />
              </InfoSelectionArea>
            </InfoItem>
          ))}
        </InfoContainer>
      </ProfileBody>
      <ProfileBottom>
        <ProfileEditButton onClick={editable ? save : edit}>
          {editable ? '저장' : '프로필 편집'}
        </ProfileEditButton>
      </ProfileBottom>
    </ProfileSettingEditor>
  );
}

export default function ConnectionStatus() {
  const ActivatedNav = useAppSelector((state) => state.nav.currentState);
  const username = useAppSelector((state) => state.user.username);
  const userprofileImgUrl = useAppSelector((state) => state.user.userProfile.profileImgUrl);
  const dispatch = useAppDispatch();

  function openProfile() {
    if (ActivatedNav == ModalState.Profile) {
      dispatch(SetWhichModalActivated(ModalState.None));
    } else {
      dispatch(SetWhichModalActivated(ModalState.Profile));
    }
  }

  return (
    <div>
      <StyledRedBox onClick={openProfile} pressed={ActivatedNav}>
        <BottomProfileImg
          // src="https://user-images.githubusercontent.com/63194662/211139459-96aa37f8-fcd9-4126-9a6b-52296fc3236c.png"
          src={userprofileImgUrl || DefaultAvatar}
        />
        <ConnectionStatusWithSmallLight /> {/* 유저의 접속상태에 따라 green/gray로 변경 */}
        <UsernameDiv> {username} </UsernameDiv>
        <EditIcon sx={{ fontSize: 30, color: '#fff' }}></EditIcon>
      </StyledRedBox>
      {ActivatedNav == ModalState.Profile ? <ProfileEditModal /> : null}
    </div>
  );
}

const BottomProfileImg = styled.img`
  width: 35px;
  height: 35px;
  border-radius: 100%;
`;

interface EditableProps {
  editable: boolean;
}

const StyledRedBox = styled.button<{ pressed: ModalState }>`
  display: flex;
  justify-content: center;
  align-items: center;

  height: 44px;
  border: none;
  border-radius: 12px;
  background-color: ${(props) =>
    props.pressed == ModalState.Profile ? Colors.skyblue[1] : Colors.indigo};
  font-size: 1rem;
  font-weight: 900;
  padding: 4x;

  &:hover {
    background-color: ${Colors.skyblue[1]};
  }
`;

const UsernameDiv = styled.div`
  padding: 8px 2px;
  font-size: 1rem;
  color: ${Colors.white};
  margin-right: 5px;
`;
const ProfileSettingEditor = styled.div`
  position: fixed;
  left: 0px;
  background-color: #ffffff;
  gap: 10px;
  bottom: 60px;
  height: 400px;
  width: 370px;
  border-radius: 25px;
  box-shadow: 20px 0px 10px 0px rgba(0, 0, 0, 0.75);
  -webkit-box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.75);
  -moz-box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.75);
  font-style: normal;
  font-weight: 400;
`;

const TitleText = styled.div`
  font-weight: 600;
  font-size: 24px;
`;

const DirtyTalk = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

const TitleImage = styled.img`
  margin-left: 3px;
  margin-right: 13px;
  width: 28px;
`;

// const CloseButton = styled.button`
//   width: 30px;
//   height: 30px;
//   border: none;
//   background-color: transparent;
//   border-radius: 50%;
// `;

const ProfileHeader = styled.div`
  padding: 10px;
  width: 100%;
  position: relative;
  display: grid;
  grid-template-columns: 90% 10%;
  border-top-left-radius: 25px;
  border-top-right-radius: 25px;
  background-color: ${Colors.skyblue[1]};

`;

const ProfileBody = styled.div`
  padding: 0 10px 15px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
  height: 75%;
`;

const ImageWrapper = styled.div<EditableProps>`
  margin-top: 20px;
  width: 98px;
  height: 98px;
  border-radius: 100%;
  border: ${(props) =>
    props.editable ? `1px solid ${Colors.skyblue[2]}` : '1px solid transparent'};
  cursor: ${(props) => (props.editable ? 'pointer' : 'default')};
  display: flex;
  justify-content: center;
  align-items: center;

  .personal-image {
    position: relative;
    width: 98px;
    height: 98px;
  }

  .personal-image input[type='file'] {
    display: none;
  }

  .personal-figure {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 98px;
    height: 98px;
  }

  .personal-avatar {
    box-sizing: border-box;
    border-radius: 100%;
    border: 2px solid transparent;
    box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.2);
    transition: all ease-in-out 0.3s;
  }
  .personal-avatar:hover {
    box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.5);
  }
  .personal-figcaption {
    cursor: pointer;
    position: absolute;
    top: 0px;
    width: 98px;
    height: 98px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 100%;
    opacity: 0;
    background-color: rgba(0, 0, 0, 0);
    transition: all ease-in-out 0.3s;
  }
  .personal-figcaption:hover {
    opacity: 1;
    background-color: rgba(0, 0, 0, 0.5);
  }
  .personal-figcaption > img {
    width: 50px;
    height: 50px;
  }
`;
const ButtonWrapper = styled.button`
  background: none;
  border: none;
  padding: 0px 10px 0px 0px;
`;
const ProfileAvatarImage = styled.img`
  width: 100%;
  height: 100%;
`;

const CameraImage = styled.img`
  width: 98px;
  height: 98px;
  opacity: 0.33;
`;

const ProfileUserName = styled.div<EditableProps>`
  margin-top: 14px;
  font-size: 20px;
  font-weight: 600;
  border-radius: 6px;
  border: ${(props) =>
    props.editable ? `1px solid ${Colors.skyblue[2]}` : '1px solid transparent'};
  cursor: ${(props) => (props.editable ? 'pointer' : 'default')};
`;

const InfoContainer = styled.div<EditableProps>`
  padding: 5px;
  margin-top: 14px;
  width: 100%;
  border-radius: 6px;
  border: ${(props) =>
    props.editable ? `1px solid ${Colors.skyblue[2]}` : '1px solid transparent'};
  cursor: ${(props) => (props.editable ? 'pointer' : 'default')};
`;

const InfoItem = styled.div`
  display: grid;
  grid-template-columns: 20% 80%;
  align-items: center;
  margin-top: 8px;
  font-size: 18px;
`;

const InfoLabelArea = styled.div``;

const InfoSelectionArea = styled.div`
  width: 150px;
  outline: none;
`;

const InfoSelection = styled(Select)`
  outline: none;
`;

const ProfileBottom = styled.div`
  position: absolute;
  width: 100%;
  height: 60px;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${Colors.skyblue[1]};
  &:hover {
    background-color: ${Colors.skyblue[2]};
  }
`;

const ProfileEditButton = styled.button`
  border: none;
  width: 100%;
  height: 100%;
  font-weight: 600;
  font-size: 20px;
  background: none;

  outline: none;
  &:focus {
    outline: none;
  }
`;

const InputWrapper = styled.form`
  display: flex;
  flex-direction: row;
`;
const InputTextField = styled(InputBase)`
  border-radius: 0px 0px 10px 10px;
  input {
    padding: 5px;
    color: #000;
  }
`;

const ConnectionStatusWithSmallLight = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${Colors.greenlight};
  margin-right: 5px;
  margin-left: 5px;
`;
