import { loadStripe } from '@stripe/stripe-js/pure';
import axiosInstance from './axiosInstance';
import { API_PATH } from '../utils/api-urls';
import axios from 'axios';
import { connectUserV8 } from './authorizeUser';

let stripePromise;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLICK_KEY);
  }
  return stripePromise;
};

export const createStripeSorageSub = async (priceId, quantity = 1) => {
  try {
    const { data } = await axiosInstance.post(
      `${API_PATH}/workspace/storage/create/subscription`,
      [{ price: priceId, quantity }]
    );

    return { ...data, priceId };
  } catch (error) {
    console.error(error);
  }
};

export const checkPayment = async (payId) => {
  try {
    const { data } = await axiosInstance.post(
      `${API_PATH}/workspace/storage/check/payment`,
      { payment: payId }
    );

    return data.success;
  } catch (error) {
    console.error(error);
  }
};

export const updateWsStorage = async (price, subscription) => {
  try {
    const url = `${API_PATH}/workspace/update/storage`;
    const body = { price, stripe_sub_id: subscription };
    const data = await axiosInstance.post(url, body);
    return data;
  } catch (error) {
    console.error(error);
  }
};
export const updateWsStorageTON = async (
  storage,
  workspace_id,
  duration = 1
) => {
  try {
    const url = `https://api.dev.ghostdrive.com/api/apiv2/update/storage`;
    const body = {
      storage,
      user: 'neyra_id',
      workspace: workspace_id,
      duration
    };
    const data = await axiosInstance.post(url, body);
    return data;
  } catch (error) {
    console.error(error);
  }
};

export const getTonWallet = async (dispatch, comment) => {
  const token = await dispatch(connectUserV8());
  const body = {
    symbol: 'ton',
    comment
  };
  const data = await axios
    .create({
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .post('https://api.neyra.ai/api/gateway/billing/retrieve_crypto', body)
    .then(({ data }) => data?.data?.address)
    .catch(() => null);

  return data;
};
