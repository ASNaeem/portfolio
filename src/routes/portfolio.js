const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Message = require('../models/Message');
const VisitCounter = require('../models/VisitCounter');
const parseResumeMarkdown = require('../utils/resumeParser');

// @desc    Get parsed resume details from Markdown
// @route   GET /resume
router.get('/resume', (req, res, next) => {
  try {
    const resumeData = parseResumeMarkdown();
    res.json(resumeData);
  } catch (error) {
    next(error);
  }
});

// @desc    Increment and get visitor counter
// @route   GET /visit
router.get('/visit', async (req, res, next) => {
  try {
    let counterDoc = await VisitCounter.findOne();
    if (!counterDoc) {
      counterDoc = new VisitCounter({ count: 0 });
    }
    counterDoc.count += 1;
    await counterDoc.save();
    res.json({ status: 'success', visitCount: counterDoc.count });
  } catch (error) {
    next(error);
  }
});

// @desc    Get all projects
// @route   GET /projects
router.get('/projects', async (req, res, next) => {
  try {
    const projects = await Project.find();
    // Map output to match the original MySQL API fields (image_url, project_link)
    const formattedProjects = projects.map(project => ({
      title: project.title,
      description: project.description,
      image_url: project.image_url,
      project_link: project.project_link,
    }));
    res.json(formattedProjects);
  } catch (error) {
    next(error);
  }
});

// @desc    Create a new guestbook/personal message
// @route   POST /guestbook
router.post('/guestbook', async (req, res, next) => {
  try {
    const { name, email, message, message_type } = req.body;

    if (!name || !message || !message_type) {
      return res.status(400).json({ error: 'Name, message, and message type are required.' });
    }

    if (!['personal', 'guestbook'].includes(message_type)) {
      return res.status(400).json({ error: 'Invalid message type.' });
    }

    const newMessage = await Message.create({
      name,
      email: email || null,
      message,
      message_type,
    });

    res.status(201).json({ message: 'Entry added successfully!', entry: newMessage });
  } catch (error) {
    next(error);
  }
});

// @desc    Retrieve guestbook entries
// @route   GET /guestbook
router.get('/guestbook', async (req, res, next) => {
  try {
    const entries = await Message.find({ message_type: 'guestbook' }).sort({ mtime: -1 });
    res.json(entries);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
