const router = require('express').Router({ mergeParams: true });
const reviewController = require('../controllers/review-controller');
const authController = require('../controllers/auth-controller');

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getReviews)
  .post(
    reviewController.setTourUserIds,
    authController.restrictTo('user'),
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  );

module.exports = router;
