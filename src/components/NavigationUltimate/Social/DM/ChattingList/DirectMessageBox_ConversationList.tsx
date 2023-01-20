import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import DMboxSVG from '../../../assets/directmessage/DM.svg';
import channelTalkPNG from '../../../assets/directmessage/channeltalk.png';
import { useNavigate } from 'react-router-dom';
import { blue } from '@mui/material/colors';
import { DMSlice, setFriendId, setRoomId } from '../../../../../stores/DMboxStore';
import { useAppDispatch, useAppSelector } from '../../../../../hooks';
import {
  SetWhichModalActivated,
  ModalState,
} from '../../../../../stores/NavbarStore';
import { useQuery } from 'react-query';
import {
  ApiResponse,
  fetchRoomList,
  RoomListResponse,
  IChatRoomStatus,
  UserResponseDto,
} from 'src/api/chat';
import axios from 'axios';
import FriendRequest from 'src/components/NavigationUltimate/Social/AddFriend/FriendRequest';
import Colors from 'src/utils/Colors';


/* 채팅목록을 불러온다. 클릭시, 채팅상대(state.dm.friendId)에 친구의 userId를 넣어준다  */
export const ConversationList = () => {
  const [rooms, setRooms] = useState<RoomListResponse[]>([]);
  const [friendRequestModal, setFriendRequestModal] = useState(false);
  const [FriendRequestProps, setFriendRequestProps] = useState<UserResponseDto>(
    {} as UserResponseDto
  );
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.user.userId);
  const friendId = useAppSelector((state) => state.dm.friendId);

  useEffect(() => {
    fetchRoomList(userId).then((data) => {
      setRooms(data);
    });
  }, []);

  useEffect(() => {
    console.log('rooms', rooms);
  }, [rooms]);

  // let roomId = '';
  // let body = {
  //   userId: userId,
  //   friendId: friendId,
  //   roomId: roomId,
  // };

  const handleClick = async (room) => {

    console.log('friendId는..', room.friendInfo.userId);
    console.log('roomId는..', room.roomId);

    if (room.status == IChatRoomStatus.FRIEND_REQUEST && room.unread == 0) {
      setFriendRequestProps(room.friendInfo);
    } else if (room.status == IChatRoomStatus.FRIEND_REQUEST && room.unread == 1) {
      // 친구 요청 받음
      setFriendRequestModal(true);
      setFriendRequestProps(room.friendInfo);
    } else {
      console.log("This room's status is... ", room.status);
      try {
        dispatch(SetWhichModalActivated(ModalState.ChattingListAndRoom));
        // Response userId
        dispatch(setFriendId(room.friendInfo.userId));
        dispatch(setRoomId(room.roomId));
      } catch (error) {
        console.log('error', error);
      }
    }

  };
  return (
    <DMmessageList>
    
        <UnorderedList>
          {rooms &&
            rooms.map((room) => (
              console.log('room메세지', room.message),
              <ListTag
                key={room._id}
                onClick={() => {
                  handleClick(room);
                }}
              >
                <ProfileAvatarImage
                  src={room.friendInfo.profileImgUrl}
                  alt={room.friendInfo.username}
                  width="60"
                />
                <IDwithLastmessage>
                  <UserID>{room.friendInfo.username}</UserID>
                  <LastMessage>
                    {room.status == IChatRoomStatus.FRIEND_REQUEST && room.unread == 0
                      ? (room.message = '친구 요청을 보냈어요')
                      : room.message}
                  </LastMessage>
                </IDwithLastmessage>
              </ListTag>
            ))}
        </UnorderedList>
        {friendRequestModal ? (
          <FriendRequest
            setRooms={setRooms}
            setFriendRequestModal={setFriendRequestModal}
            friendInfo={FriendRequestProps}
          />
        ) : null}
      
    </DMmessageList>
  );
};

const ProfileAvatarImage = styled.img`
  width: 75px;
  height: 75px;
  border-radius: 100%;
`;


const UnorderedList = styled.ul`
  padding: 5px;
`;

const ListTag = styled.li`
  width: 320px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  cursor: pointer;
  padding: 5px;

`;
const IDwithLastmessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0px 0px 0px 30px;
  border-bottom: none;
  cursor: pointer;
`;
const UserID = styled.div`
  display: block;
  font-size: 1.17em;
  margin: 0px 0px 10px 0px;
  font-weight: bold;
  // color: ${Colors.skyblue[2]};
`;

const LastMessage = styled.div`
  display: block;
  font-size: 1em;
  margin: 0px 0px 10px 0px;
`;
const DMmessageList = styled.div`
  background: #ffffff;
  height: 520px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-bottom-left-radius: 25px;
  border-bottom-right-radius: 25px;
`;