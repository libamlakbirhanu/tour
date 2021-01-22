const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');

const User = require('../models/user-model');
const catchAsyncErrors = require('../utils/catch-async-errors');
const AppError = require('../utils/app-error');
const Email = require('../utils/email');

const createToken = (id) => {
  const payload = {
    user: { id },
  };
  return jwt.sign(payload, process.env.JWTSECRET, {
    expiresIn: 90 * 24 * 60 * 60,
  });
};

const sendToken = (user, statusCode, req, res) => {
  const token = createToken(user.id);
  const cookieOptions = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  };

  res.cookie('authToken', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data:
      statusCode === 201
        ? {
            user,
          }
        : null,
  });
};

exports.signUp = catchAsyncErrors(async (req, res, next) => {
  const newUser = await User.create(req.body);
  const url = `${req.protocol}://${req.hostname}:3000/_me`;
  await new Email(newUser, url).sendWelcome();
  sendToken(newUser, 201, req, res);
});

exports.login = catchAsyncErrors(async (req, res, next) => {
  const errs = validationResult(req);

  if (!errs.isEmpty()) {
    errs.code = 9044;
    throw errs;
  }

  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.isPasswordCorrect(password, user.password)))
    return next(new AppError('incorrect credentials', 401));

  sendToken(user, 200, req, res);
});

exports.logout = (req, res, next) => {
  const cookieOptions = {
    expires: new Date(Date.now()),
    httpOnly: true,
  };

  res.cookie('authToken', '', cookieOptions);

  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsyncErrors(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  )
    token = req.headers.authorization.split(' ')[1];
  else if (req.cookies.authToken) token = req.cookies.authToken;

  if (!token)
    return next(
      new AppError('You are not logged in. Please log in to get access.', 300)
    );

  const decoded = await promisify(jwt.verify)(token, process.env.JWTSECRET);
  const currentUser = await User.findById(decoded.user.id);
  if (!currentUser)
    return next(new AppError('The user does not exist anymore', 401));

  if (currentUser.changedPasswordAfter(decoded.iat))
    return next(new AppError('You Have Recently Changed Your Password', 401));

  req.user = currentUser;
  res.locals.user = currentUser;

  next();
});

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.authToken) {
    try {
      const decoded = await promisify(jwt.verify)(
        req.cookies.authToken,
        process.env.JWTSECRET
      );
      const currentUser = await User.findById(decoded.user.id);
      if (!currentUser) return next();

      if (currentUser.changedPasswordAfter(decoded.iat)) return next();

      res.locals.user = currentUser;
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    next(new AppError("You don't have permission to perform this action", 403));
  }

  next();
};

exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) return next(new AppError('User does not exist', 404));

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    const url = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/reset-password/${resetToken}`;
    await new Email(user, url).sendPasswordReset();
    res.status(200).json({ status: 'success', message: 'token sent to email' });
  } catch (err) {
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending email. Please try again later.',
        500
      )
    );
  }
});

exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) return next(new AppError('Token is invalid or has expired', 404));

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined; //
  user.passwordResetExpires = undefined;
  await user.save();

  sendToken(user, 200, req, res);
});

exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (!(await user.isPasswordCorrect(oldPassword, user.password)))
    return next(new AppError('incorrect password', '403'));

  user.password = newPassword;
  user.confirmPassword = confirmPassword;
  await user.save();

  sendToken(user, 200, req, res);
});
