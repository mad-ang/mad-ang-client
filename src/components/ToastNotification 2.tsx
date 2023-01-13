import React, { useState, useEffect } from "react";
import styled, {keyframes} from "styled-components";

const boxFade = keyframes`
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
    `

const Wrapper = styled.div`
    position: fixed;
    top: 85%;
    left: 50%;
    transform: translate(-50%, -50%);
`

const ToastBox = styled.div`
    gap: 10px;
    bottom: 60px;
    height: 200px;
    width: 500px;   
    animation: ${boxFade} 2s 1s;
  `
    
const WelcomeMsg = styled.div`
    background : #CAB8FF; 
    border-radius : 16px;
    padding: 15px 35px 15px 15px;
    font-size: 28px;
    display: flex;
    align-items: center;
    text-align: center;
    font-weight: bold;
    justify-content: center;
    text-align: center;
    `

export default function WelcomeToast() {
    
    let [toastState, setToastState] = useState(true);
    let [toastAnimation, setToastAnimation] = useState("toast-alert");
    
    useEffect( () => {
        let timer = setTimeout(() => {
            setToastAnimation("toast-alert");
            setToastState(false);
        }, 2000);

        return () => {
            clearTimeout(timer);
        }
    },[]);

    return (
        toastState === true? (
        <div className={toastAnimation}>
        <Wrapper>
            <ToastBox>
                <WelcomeMsg>
                    <p>맘스타운에 오신 것을 환영합니다</p>
                </WelcomeMsg>
            </ToastBox>
        </Wrapper>
        </div>
    ) : null
    );
}