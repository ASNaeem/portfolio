const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      trim: true,
    },
    image_url: {
      type: String,
      required: [true, 'Project image URL is required'],
      trim: true,
    },
    project_link: {
      type: String,
      required: [true, 'Project link is required'],
      trim: true,
    },
  }
);

ProjectSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model('Project', ProjectSchema);
