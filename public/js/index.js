/* eslint-disable */

import '@babel/polyfill';
import { updateSettings } from './updateSettings';
import { login, logout } from './login';
import { displayMap } from './mapbox';

const mapBox = document.getElementById('map');
const loginForm = document.querySelector('#login-form');
const logoutLink = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userDataSettings = document.querySelector('.form-user-settings');

if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm)
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;

    login(email, password);
  });

if (logoutLink) logoutLink.addEventListener('click', logout);

if (userDataForm) {
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.querySelector('#name').value);
    form.append('email', document.querySelector('#email').value);
    form.append(
      'photo',
      document.querySelector('#input__photo-upload').files[0]
    );

    updateSettings(form, 'data');
  });
}

if (userDataSettings) {
  userDataSettings.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').innerHTML = 'Updating...';

    const oldPassword = document.querySelector('#password-current').value;
    const newPassword = document.querySelector('#password.form__input').value;
    const confirmPassword = document.querySelector(
      '#password-confirm.form__input'
    ).value;

    await updateSettings(
      { oldPassword, newPassword, confirmPassword },
      'password'
    );
    document.querySelector('.btn--save-password').innerHTML = 'save password';
  });
}
