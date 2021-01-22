const mongoose = require('mongoose');
const Tour = require('./tour-model');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ user: 1, tour: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this
    //   .populate({
    //     path: 'tour',
    //     select: 'name',
    //   })
    .populate({
      path: 'user',
      select: 'name photo',
    });

  next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length)
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating,
    });
  else
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 0,
      ratingsQuantity: 4.5,
    });
};

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.tempReview = await this.findOne();

  next();
});

reviewSchema.post(/^findOneAnd/, function () {
  this.tempReview.constructor.calcAverageRatings(this.tempReview.tour);
});

reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.tour);
});

module.exports = mongoose.model('Review', reviewSchema);
