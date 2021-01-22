const router = require('express').Router();
const viewController = require('../controllers/view-controller.js');
const authController = require('../controllers/auth-controller');

router.get('/', authController.isLoggedIn, viewController.getOverview);
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);
router.get('/login', authController.isLoggedIn, viewController.getLoginForm);
router.get('/signup', authController.isLoggedIn, viewController.getSignupForm);
router.get('/_me', authController.protect, viewController.getMe);

module.exports = router;
