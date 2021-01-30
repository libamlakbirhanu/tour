/* eslint-disable */

import axios from 'axios';
import catchAsyncErrors from '../../utils/catch-async-errors';
import { showAlert } from './alerts';

export const signup = async (name, email, password, confirmPassword) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data: {
        name,
        email,
        password,
        confirmPassword,
      },
    });

    showAlert('success', 'successfully registered');
    window.setTimeout(() => location.assign('/'), 1000);
  } catch (e) {
    showAlert('error', e.response.data.message);
  }
};
