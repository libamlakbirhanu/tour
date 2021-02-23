const mongoose = require('mongoose');

const createConnectionLocal = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_LOCAL, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useCreateIndex: true,
      useUnifiedTopology: true,
    });
    console.log('mongodb connected...');
  } catch (error) {
    console.error(`error: ${error.message}`);
  }
};

// const createConnectionAtlas = async () => {
//   const DB = process.env.DATABASE_ATLAS.replace(
//     '<PASSWORD>',
//     process.env.DATABASE_PASSWORD
//   );

//   try {
//     await mongoose.connect(DB, {
//       useNewUrlParser: true,
//       useFindAndModify: false,
//       useCreateIndex: true,
//       useUnifiedTopology: true,
//     });
//     console.log('mongodb connected...');
//   } catch (error) {
//     console.error(`error: ${error.message}`);
//   }
// };

// module.exports = createConnectionAtlas;
module.exports = createConnectionLocal;
