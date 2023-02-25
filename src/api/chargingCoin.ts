import axios from 'axios';
// 친구 추가 요청
export const paypalReq = async () => {
  try {
    const response = await axios.get(`/api/orders`);
    if (response) {
      const { status, payload } = response.data;
      if (response.status === 200) {
        return 1;
      }
    } else {
      return 0;
    }
  } catch (error) {
    console.error(error);
  }
};

// 친구 추가 요청
export const chargingCoinReq = async (body: any) => {
  try {
    const response = await axios.post(`/chat/chargingCoin`, body);
    if (response) {
      const { status, payload } = response.data;
      if (response.status === 200) {
        return 1;
      }
    } else {
      return 0;
    }
  } catch (error) {
    console.error(error);
  }
};
