// eslint-disable-next-line arrow-body-style
module.exports = (asyncFunc) => {
  return (req, res, next) => asyncFunc(req, res, next).catch(next);
};
