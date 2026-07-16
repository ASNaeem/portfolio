const mongoose = require('mongoose');

const VisitCounterSchema = new mongoose.Schema(
  {
    count: {
      type: Number,
      default: 0,
    },
  }
);

VisitCounterSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model('VisitCounter', VisitCounterSchema);
