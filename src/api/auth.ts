import axios from 'axios';
import { AxiosResponse } from 'axios';
import phaserGame from '../PhaserGame';
import Bootstrap from '../scenes/Bootstrap';
import Cookies from 'universal-cookie';
const cookies = new Cookies();

// 사용자 정보 요청
export const getUserInfo = (next?: any) => {
  return axios
    .get('/auth/me')
    .then((response) => {
      const { payload } = response.data;
    })
    .catch((error) => {
      console.log(error);
    });
};

// 로그인
export const login = (body, next): boolean | void => {
  axios
    .post('/auth/login', body, {
      withCredentials: true,
      headers: {
        'Content-type': 'application/json',
      },
    })
    .then(function (response) {
      // response

      const { data } = response;

      if (data.status == 200) {
        const accessToken = response.data.payload.accessToken;
        if (accessToken) {
          next(data.payload.accessToken);
        }

        // TODO accessToken을 계속 갱신해야 함. refreshToken 발급로직 없으므로 임식 처리
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

        cookies.set('accessToken', accessToken, { path: '/' });

        // dispatch(setSignIn(false));

        const bootstrap = phaserGame.scene.keys.bootstrap as Bootstrap;
        bootstrap.network
          .joinOrCreatePublic()
          .then(() => bootstrap.launchGame())
          .catch((error) => console.error(error));

        console.log('200 로그인 성공인딩');
        return true;
      } else {
        console.log('data.status가 200이 아닐 때', data.status);
      }
    })
    .catch(function (error) {
      // 오류발생시 실행

      console.log('error.response.data.message', error.response.data.message);

      return false;
    });
  // .then(function () {
  //   // 항상 실행
  //   console.log('then 로그인 실행');
  //   return true;
  // });
};
