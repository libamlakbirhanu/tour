const express = require('express');
const tourController = require('../controllers/tour-controller');
const authController = require('../controllers/auth-controller');
const reviewRouter = require('./review-routes');

const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);

router.route('/top-5-cheap').get(tourController.alias, tourController.getTours);
router
  .route('/')
  .get(tourController.getTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );
router.route('/stats').get(tourController.getTourStats);
router
  .route('/monthly-stats/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'guide', 'lead-guide'),
    tourController.getMonthlyStats
  );

router
  .route('/get-tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
