/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'data'
        ? '/api/v1/users/update-me'
        : '/api/v1/users/update-password';

    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });

    showAlert('success', `${type.toUpperCase()} successfully updated`);
    window.setTimeout(() => location.reload(), 1000);
  } catch (e) {
    showAlert('error', e.response.data.message);
  }
};
