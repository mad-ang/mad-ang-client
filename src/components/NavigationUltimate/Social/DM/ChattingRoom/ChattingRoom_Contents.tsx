import React, { useRef, useState, useEffect } from 'react';
import { ChatFeed, Message, ChatInput } from 'react-chat-ui';
import { useAppDispatch, useAppSelector } from '../../../../../hooks';
import styled from 'styled-components';

export default function ChatBubbles(props) {
  const [messageList, setMessageList] = useState([
    new Message({
      id: 1,
      message: "I'm the recipient! (The person you're talking to)",
    }), // Gray bubble
    new Message({ id: 0, message: "I'm you -- the blue bubble!" }), // Blue bubble
    new Message({
      id: 1,
      message: "I'm the recipient! (The person you're talking to)",
    }), // Gray bubble
    new Message({
      id: 1,
      message: "I'm the recipient! (The person you're talking to)",
    }), // Gray bubble
  ]);

  const [inputValue, setInputValue] = useState('');
  const [readyToSubmit, setReadyToSubmit] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const directMessages = useAppSelector((state) => state.dm.directMessages);
  const showDM = useAppSelector((state) => state.dm.showDM);
  const dispatch = useAppDispatch();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [directMessages, showDM]);

  useEffect(() => {
    console.log('props.newMessage', props.newMessage);
    // messages.messages.push(props.newMessage);
    // messages = {
    //   messages: [...messages.messages, props.newMessage]
    // }
    setMessageList((messageList) => [...messageList, props.newMessage]);
  }, [props.newMessage]);

  return (
    <>
      <ChatFeed
        chat={{
          scrollHeight: 1000,
          clientHeight: 500,
          scrollTop: 100,
        }}
        messages={messageList} // Array: list of message objects
        // isTyping={messages.is_typing} // Boolean: is the recipient typing
        hasInputField={false} // Boolean: use our input, or use your own
        showSenderName // show the name of the user who sent the message
        bubblesCentered={false} //Boolean should the bubbles be centered in the feed?
        // JSON: Custom bubble styles
        bubbleStyles={{
          text: {
            fontSize: 20,
          },
          chatbubble: {
            borderRadius: 25,
            padding: 15,
            maxWidth: 250,
            width: '75%',
            marginTop: 1,
            marginRight: 'auto',
            marginBottom: 1,
            marginLeft: 'auto',
          },
          userBubble: {},
        }}
      />
    </>
  );
}
