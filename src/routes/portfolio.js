const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const parseResumeMarkdown = require('../utils/resumeParser');

// Simple in-memory cache for GitHub stats
let cachedGitHubStats = null;
let gitHubCacheExpiry = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

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

// @desc    Get all projects from static projects.json
// @route   GET /projects
router.get('/projects', async (req, res, next) => {
  try {
    const projectsPath = path.join(__dirname, '../../public/projects.json');
    const projectsData = await fs.readFile(projectsPath, 'utf8');
    const projects = JSON.parse(projectsData);
    res.json(projects);
  } catch (error) {
    next(error);
  }
});

// @desc    Get GitHub profile stats with in-memory caching and PAT support
// @route   GET /github-stats
router.get('/github-stats', async (req, res, next) => {
  try {
    const now = Date.now();
    
    // Serve from cache if valid
    if (cachedGitHubStats && now < gitHubCacheExpiry) {
      return res.json(cachedGitHubStats);
    }

    // Set up headers for GitHub API request
    const headers = {
      'User-Agent': 'ASNaeem-Portfolio-Server'
    };

    let data;
    let privateReposCount = 0;

    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
      console.log('Fetching authenticated GitHub profile and private repositories list...');
      
      const [userRes, reposRes] = await Promise.all([
        fetch('https://api.github.com/user', { headers }),
        fetch('https://api.github.com/user/repos?visibility=private&per_page=100', { headers })
      ]);

      if (!userRes.ok) {
        if (cachedGitHubStats) {
          console.warn('GitHub User API fetch failed. Serving expired cache fallback.');
          return res.json(cachedGitHubStats);
        }
        throw new Error(`GitHub user API returned status ${userRes.status}`);
      }
      
      data = await userRes.json();
      
      if (reposRes.ok) {
        const reposData = await reposRes.json();
        if (Array.isArray(reposData)) {
          privateReposCount = reposData.length;
        }
      } else {
        console.warn(`GitHub Repos API returned status ${reposRes.status}. Defaulting private count to 0.`);
      }
    } else {
      console.log('Fetching public GitHub profile...');
      const response = await fetch('https://api.github.com/users/ASNaeem', { headers });
      
      if (!response.ok) {
        if (cachedGitHubStats) {
          console.warn('GitHub Public API fetch failed. Serving expired cache fallback.');
          return res.json(cachedGitHubStats);
        }
        throw new Error(`GitHub public API returned status ${response.status}`);
      }
      
      data = await response.json();
    }
    
    // Store in cache
    cachedGitHubStats = {
      public_repos: data.public_repos,
      name: data.name,
      avatar_url: data.avatar_url,
      total_private_repos: privateReposCount
    };
    gitHubCacheExpiry = now + CACHE_DURATION;

    res.json(cachedGitHubStats);
  } catch (error) {
    // If everything fails and we have absolutely no cache, return static fallback values
    if (cachedGitHubStats) {
      console.warn('GitHub proxy error. Serving stale cache.', error.message);
      return res.json(cachedGitHubStats);
    }
    console.error('GitHub stats fetch failed. Serving emergency static fallback.', error.message);
    res.json({
      public_repos: 25,
      name: 'Abu Saleh Muhammad Naeem',
      avatar_url: 'https://avatars.githubusercontent.com/u/23430695?v=4',
      total_private_repos: 0
    });
  }
});

module.exports = router;
