const Project = require('../models/Project');
const VisitCounter = require('../models/VisitCounter');

const defaultProjects = [
  {
    title: 'Culinary Compass',
    description: 'Simple Recipe searching app made with HTML, CSS, and JavaScript',
    image_url: 'images/project1.jpg',
    project_link: 'https://asnaeem.github.io/CulinaryCompass/',
  },
  {
    title: 'Web Note',
    description: 'Simple online note taking app made with HTML, CSS, and JavaScript',
    image_url: 'images/project2.jpg',
    project_link: 'https://asnaeem.github.io/WebNote/',
  },
  {
    title: 'Store Management System',
    description: 'Simple StoreMS for windows made with Python and Mysql',
    image_url: 'images/project3.jpg',
    project_link: 'https://asnaeem.github.io/StoreMS/',
  },
];

const seedDatabase = async () => {
  try {
    // Seed Projects
    const projectCount = await Project.countDocuments();
    if (projectCount === 0) {
      await Project.create(defaultProjects);
      console.log('Database Seeding: Default projects seeded.');
    }

    // Seed VisitCounter
    const counterDoc = await VisitCounter.findOne();
    if (!counterDoc) {
      await VisitCounter.create({ count: 0 });
      console.log('Database Seeding: Initial visit counter seeded.');
    }
  } catch (error) {
    console.error(`Database seeding error: ${error.message}`);
  }
};

module.exports = seedDatabase;
