module.exports = class {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    let queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Advanced Filtering
    const queryStr = JSON.stringify(queryObj);
    queryObj = JSON.parse(
      queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)
    );
    this.query.find(queryObj);
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      this.query = this.query.sort(this.queryString.sort.split(',').join(' '));
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  fieldLimit() {
    if (this.queryString.fields) {
      this.query = this.query.select(
        this.queryString.fields.split(',').join(' ')
      );
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = +this.queryString.page || 1;
    const limit = +this.queryString.limit || 50;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
};
