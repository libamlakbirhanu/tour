/* eslint-disable */

export const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};

export const showAlert = (type, msg) => {
  hideAlert();

  const markUp = `<div class="alert alert--${type}">${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markUp);

  window.setTimeout(hideAlert, 3000);
};
