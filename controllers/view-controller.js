const Tour = require('../models/tour-model');
const catchAsyncErrors = require('../utils/catch-async-errors');
const AppError = require('../utils/app-error');

exports.getOverview = catchAsyncErrors(async (req, res, next) => {
  const tours = await Tour.find();

  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsyncErrors(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) return next(new AppError('Tour not found', 404));

  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'login',
  });
};

exports.getSignupForm = (req, res) => {
  res.status(200).render('signup', {
    title: 'signup',
  });
};

exports.getMe = (req, res, next) => {
  res.status(200).render('account', {
    title: 'account',
  });
};
