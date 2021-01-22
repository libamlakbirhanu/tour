const express = require('express');
const { check } = require('express-validator');

const userController = require('../controllers/user-controller');
const authController = require('../controllers/auth-controller');

const router = express.Router();

router.post('/signup', authController.signUp);
router.post(
  '/login',
  [
    check('email', 'Email is required').not().isEmpty(),
    check('password', 'Password is required').exists(),
  ],
  authController.login
);
router.get('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);

router.use(authController.protect);

router.patch('/update-password', authController.updatePassword);
router.get('/_me', userController.getMe);
router.patch(
  '/update-me',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);
router.delete('/delete-me', userController.deleteMe);

router.use(authController.restrictTo('admin'));

router.route('/').get(userController.getUsers).post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
