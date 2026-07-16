const fs = require('fs');
const path = require('path');

const parseResumeMarkdown = () => {
  const filePath = path.join(__dirname, '../../resume.md');
  const markdown = fs.readFileSync(filePath, 'utf-8');
  
  const resume = {
    name: 'Abu Saleh Muhammad Naeem',
    title: 'Software Engineer (Backend)',
    contact: '',
    summary: '',
    experience: [],
    education: [],
    skills: [],
    research: [],
    achievements: [],
  };

  const lines = markdown.split('\n');
  let currentSection = null;
  let currentItem = null;

  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;

    // Detect section headers
    if (trimmedLine.startsWith('## ')) {
      currentSection = trimmedLine.substring(3).toLowerCase();
      currentItem = null;
      return;
    }

    // Parse according to current active section
    switch (currentSection) {
      case 'summary':
        if (!trimmedLine.startsWith('#')) {
          resume.summary = (resume.summary + ' ' + trimmedLine).trim();
        }
        break;

      case 'experience':
        if (trimmedLine.startsWith('### ')) {
          const parts = trimmedLine.substring(4).split('|').map(p => p.trim());
          currentItem = {
            company: parts[0] || '',
            role: parts[1] || '',
            dates: parts[2] || '',
            points: [],
          };
          resume.experience.push(currentItem);
        } else if (trimmedLine.startsWith('- ') && currentItem) {
          currentItem.points.push(trimmedLine.substring(2).trim());
        }
        break;

      case 'education':
        if (trimmedLine.startsWith('### ')) {
          const parts = trimmedLine.substring(4).split('|').map(p => p.trim());
          currentItem = {
            school: parts[0] || '',
            location: parts[1] || '',
            degree: '',
            dates: '',
          };
          resume.education.push(currentItem);
        } else if (trimmedLine.startsWith('- ') && currentItem) {
          const parts = trimmedLine.substring(2).split('|').map(p => p.trim());
          currentItem.degree = parts[0] || '';
          currentItem.dates = parts[1] || '';
        }
        break;

      case 'skills':
        if (trimmedLine.startsWith('- ')) {
          const match = trimmedLine.match(/^-\s*\*\*(.*?)\*\*:\s*(.*)$/);
          if (match) {
            resume.skills.push({
              category: match[1].trim(),
              items: match[2].trim(),
            });
          }
        }
        break;

      case 'research':
        if (trimmedLine.startsWith('- ')) {
          resume.research.push(trimmedLine.substring(2).trim());
        }
        break;

      case 'achievements':
        if (trimmedLine.startsWith('- ')) {
          resume.achievements.push(trimmedLine.substring(2).trim());
        }
        break;

      default:
        // Skip any content outside sections
        break;
    }
  });

  return resume;
};

module.exports = parseResumeMarkdown;
