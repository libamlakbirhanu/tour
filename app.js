const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');

const AppError = require('./utils/app-error');
const globalErrorHandler = require('./controllers/error-controller');

const app = express();

app.enable('trust proxy');

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour',
});
app.use('/api', limiter);
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(mongoSanitize());
app.use(xss());
app.use(
  hpp({
    whitelist: [
      'ratingsAverage',
      'ratingsQuantity',
      'duration',
      'difficulty',
      'maxGroupSize',
      'price',
    ],
  })
);

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json({ extended: false, limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use(cookieParser());
app.use(compression());

//routes
app.use('/', require('./routes/view-routes.js'));

app.use('/api/v1/tours', require('./routes/tour-routes.js'));
app.use('/api/v1/users', require('./routes/user-routes.js'));
app.use('/api/v1/reviews', require('./routes/review-routes.js'));

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl}`, 404));
});
app.use(globalErrorHandler);

module.exports = app;
