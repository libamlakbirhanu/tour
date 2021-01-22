const catchAsyncErrors = require('../utils/catch-async-errors');
const AppError = require('../utils/app-error');
const APIfeatures = require('../utils/api-features.js');

exports.deleteOne = (Model) =>
  catchAsyncErrors(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('no document available with the given id', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsyncErrors(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError('no document available with the given id', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsyncErrors(async (req, res, next) => {
    const newDoc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: newDoc,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id ? req.params.id : req.user.id;

    let query = Model.findById(id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('no document available with the given id', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsyncErrors(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIfeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .fieldLimit()
      .paginate();
    // Executing the query
    const docs = await features.query;

    res.status(200).json({
      status: 'success',
      result: docs.length,
      data: { docs },
    });
  });
