const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [
        40,
        'A tour name must have characters less than or equal to 40',
      ],
      minlength: [
        10,
        'A tour name must have characters more than or equal to 10',
      ],
    },
    slug: {
      type: String,
      unique: true,
      required: true,
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty can only be set to [easy, midium, difficult]',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1.0, 'Ratings must be at least 1.0'],
      max: [5.0, 'Ratings must be at most 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (value) {
          return value < this.price;
        },
        message:
          'price discount ({VALUE}) can not be higher than the actual price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have an image cover'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      type: {
        type: String,
        default: 'point',
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'point',
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeek').get(function () {
  return this.duration / 7;
});

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

////////// MONGOOSE MIDDLEWARES //////////////

// Document middleware
tourSchema.pre('validate', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// eslint-disable-next-line prefer-arrow-callback
// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// Query middleware
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();

  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });

  next();
});

// eslint-disable-next-line prefer-arrow-callback
tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  next();
});

// Aggregation middleware
// tourSchema.pre('aggregate', function (next) {
//   // this.match({ secretTour: { $ne: true } });
//   this._pipeline.unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });

module.exports = mongoose.model('Tour', tourSchema);
