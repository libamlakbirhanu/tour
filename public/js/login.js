/* eslint-disable */

import axios from 'axios';
import catchAsyncErrors from '../../utils/catch-async-errors';
import { showAlert } from './alerts';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    showAlert('success', 'logged in successfully');
    window.setTimeout(() => location.assign('/'), 1000);
  } catch (e) {
    showAlert('error', e.response.data.message);
  }
};

export const logout = catchAsyncErrors(async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://localhost:3000/api/v1/users/logout',
    });

    location.assign('/');
  } catch (err) {
    showAlert('error', 'Error logging out, please try again');
  }
});
