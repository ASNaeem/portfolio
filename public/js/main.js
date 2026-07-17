// Function to fetch GitHub Profile details dynamically from official API
function loadGitHubProfile() {
    fetch('https://api.github.com/users/ASNaeem')
        .then(response => {
            if (!response.ok) throw new Error('GitHub API rate limit or error');
            return response.json();
        })
        .then(data => {
            document.getElementById('github-repos').innerText = data.public_repos !== undefined ? data.public_repos : '14';
            if (data.name) {
                document.getElementById('github-name').innerText = data.name;
            }
            const avatar = document.getElementById('github-avatar');
            if (avatar) {
                avatar.src = data.avatar_url;
                avatar.style.display = 'block';
            }
        })
        .catch(err => {
            console.warn('GitHub API failed to load stats, using fallback:', err);
            document.getElementById('github-repos').innerText = '14';
        });
}

// Function to update the GitHub Contribution Chart color theme
function updateGitHubChartTheme(theme) {
    const chart = document.getElementById('github-chart');
    if (!chart) return;
    if (theme === 'dark') {
        chart.src = 'https://ghchart.rshah.org/8b5cf6/ASNaeem';
    } else {
        chart.src = 'https://ghchart.rshah.org/4f46e5/ASNaeem';
    }
}

// Client-side parser for resume.md (allows running statically on GitHub Pages)
function parseResumeMarkdown(markdown) {
    const resume = {
        name: 'Abu Saleh Muhammad Naeem',
        title: 'Software Engineer (Backend)',
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

        if (trimmedLine.startsWith('## ')) {
            currentSection = trimmedLine.substring(3).toLowerCase();
            currentItem = null;
            return;
        }

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
        }
    });

    return resume;
}

// Function to fetch, parse, and render resume details
function loadResumeDetails() {
    fetch('resume.md')
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch resume.md');
            return response.text();
        })
        .then(markdown => {
            const data = parseResumeMarkdown(markdown);
            renderResumeDOM(data);
        })
        .catch(err => console.error('Error loading resume details:', err));
}

function renderResumeDOM(data) {
    // 1. About / Summary
    document.getElementById('about-text').textContent = data.summary;

    // 2. Professional Experience
    const experienceList = document.getElementById('experience-list');
    experienceList.innerHTML = '';
    data.experience.forEach(exp => {
        const pointsHtml = exp.points.map(pt => `<li class="mb-2"><i class="fa-solid fa-angle-right text-primary me-2"></i>${pt}</li>`).join('');
        const expCard = `
            <div class="card mb-4 shadow-sm border-start border-primary border-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start flex-wrap mb-2">
                        <div>
                            <h4 class="card-title h5 mb-1 fw-bold">${exp.company}</h4>
                            <p class="card-subtitle text-primary h6 mb-0 fw-semibold">${exp.role}</p>
                        </div>
                        <span class="badge bg-secondary p-2 mt-1 mt-md-0">${exp.dates}</span>
                    </div>
                    <ul class="card-text text-muted mb-0 ps-0" style="list-style: none;">
                        ${pointsHtml}
                    </ul>
                </div>
            </div>`;
        experienceList.innerHTML += expCard;
    });

    // 3. Education
    const educationList = document.getElementById('education-list');
    educationList.innerHTML = '';
    data.education.forEach(edu => {
        const eduCard = `
            <div class="card mb-3 shadow-sm border-start border-success border-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start flex-wrap mb-2">
                        <div>
                            <h4 class="card-title h5 mb-1 fw-bold">${edu.school}</h4>
                            <p class="card-subtitle text-muted h6 mb-0">${edu.degree}</p>
                        </div>
                        <span class="badge bg-secondary p-2 mt-1 mt-md-0">${edu.dates}</span>
                    </div>
                    ${edu.location ? `<p class="card-text text-muted mb-0"><small><i class="fa-solid fa-location-dot me-1"></i> ${edu.location}</small></p>` : ''}
                </div>
            </div>`;
        educationList.innerHTML += eduCard;
    });

    // 4. Skills (Rendered as tags pills for rich aesthetics)
    const skillsList = document.getElementById('skills-list');
    skillsList.innerHTML = '';
    data.skills.forEach(skill => {
        const tagsHtml = skill.items.split(',').map(item => `
            <span class="badge bg-soft-primary text-primary-gradient m-1 px-3 py-2 rounded-pill fw-medium">${item.trim()}</span>
        `).join('');
        const skillCard = `
            <div class="col-md-6 mb-4">
                <div class="card h-100 shadow-sm border-start border-primary border-3">
                    <div class="card-body">
                        <h5 class="card-title fw-bold mb-3 text-primary-gradient">${skill.category}</h5>
                        <div class="d-flex flex-wrap">
                            ${tagsHtml}
                        </div>
                    </div>
                </div>
            </div>`;
        skillsList.innerHTML += skillCard;
    });

    // 5. Research & Publications
    const researchList = document.getElementById('research-list');
    researchList.innerHTML = '';
    data.research.forEach(res => {
        const resItem = `
            <div class="col-12">
                <div class="card shadow-sm border-start border-primary border-3">
                    <div class="card-body d-flex align-items-start gap-3">
                        <i class="fa-regular fa-file-lines text-primary mt-1" style="font-size: 1.25rem;"></i>
                        <p class="card-text text-muted mb-0 fw-medium">${res}</p>
                    </div>
                </div>
            </div>`;
        researchList.innerHTML += resItem;
    });

    // 6. Achievements
    const achievementsList = document.getElementById('achievements-list');
    achievementsList.innerHTML = '';
    data.achievements.forEach(ach => {
        const achItem = `
            <div class="col-12">
                <div class="card shadow-sm border-start border-warning border-3">
                    <div class="card-body d-flex align-items-start gap-3">
                        <i class="fa-solid fa-trophy text-warning mt-1" style="font-size: 1.25rem;"></i>
                        <p class="card-text text-muted mb-0 fw-medium">${ach}</p>
                    </div>
                </div>
            </div>`;
        achievementsList.innerHTML += achItem;
    });
}

// Window onload event handler
window.onload = function() {
    // Theme Toggle Initialization
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeToggleIcon = document.getElementById('theme-toggle-icon');
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    updateGitHubChartTheme(savedTheme);

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
        updateGitHubChartTheme(newTheme);
    });

    function updateThemeIcon(theme) {
        if (theme === 'dark') {
            themeToggleIcon.className = 'fa-solid fa-sun';
            themeToggleBtn.style.color = '#fbbf24';
        } else {
            themeToggleIcon.className = 'fa-solid fa-moon';
            themeToggleBtn.style.color = 'rgba(255,255,255,0.75)';
        }
    }

    // Load resume sections dynamically from local markdown file
    loadResumeDetails();

    // Load GitHub Profile Stats from official API
    loadGitHubProfile();

    // Fetch visit count (fails gracefully on static hosting)
    fetch('/visit')
        .then(response => {
            if (!response.ok) throw new Error('Visitor API not supported on this host.');
            return response.json();
        })
        .then(data => {
            document.getElementById('visit-count').innerText = data.visitCount;
        })
        .catch(err => {
            console.warn(err.message);
            document.getElementById('visit-count').innerText = "Static Dev Mode";
        });

    // Fetch and display projects (falls back to projects.json for static hosting compatibility)
    fetch('/projects')
        .then(response => {
            if (!response.ok) throw new Error('API server down, loading local fallback projects.json');
            return response.json();
        })
        .catch(() => {
            // Load local backup projects.json
            return fetch('projects.json').then(res => res.json());
        })
        .then(projects => {
            // Dynamically inject tag arrays based on description contents for visual taxonomy
            projects.forEach(project => {
                project.tags = [];
                const descLower = project.description.toLowerCase();
                const titleLower = project.title.toLowerCase();
                if (descLower.includes('javascript') || titleLower.includes('javascript') || descLower.includes('js') || descLower.includes('compass') || descLower.includes('recipe')) {
                    project.tags.push('JavaScript');
                }
                if (descLower.includes('python') || titleLower.includes('python') || descLower.includes('storems')) {
                    project.tags.push('Python');
                }
                if (descLower.includes('mysql') || descLower.includes('database')) {
                    project.tags.push('MySQL');
                }
                if (descLower.includes('html') || descLower.includes('css')) {
                    project.tags.push('Frontend');
                }
                // Fallback tag if empty
                if (project.tags.length === 0) {
                    project.tags.push('System');
                }
            });

            // Gather list of unique tags
            const uniqueTags = new Set();
            projects.forEach(p => p.tags.forEach(t => uniqueTags.add(t)));

            // Render filter buttons
            const filtersContainer = document.getElementById('project-filters');
            filtersContainer.innerHTML = `<button class="btn btn-sm btn-outline-primary px-3 rounded-pill active" data-filter="all">All</button>`;
            uniqueTags.forEach(tag => {
                filtersContainer.innerHTML += `<button class="btn btn-sm btn-outline-primary px-3 rounded-pill" data-filter="${tag}">${tag}</button>`;
            });

            // Function to render projects list filtered by active tag
            function renderProjectsList(filterTag) {
                const projectsList = document.getElementById('projects-list');
                projectsList.innerHTML = '';

                const filteredProjects = filterTag === 'all' 
                    ? projects 
                    : projects.filter(p => p.tags.includes(filterTag));

                filteredProjects.forEach(project => {
                    const projectTagsHtml = project.tags.map(t => `
                        <span class="badge bg-soft-primary text-primary-gradient me-1">${t}</span>
                    `).join('');

                    const projectCard = `
                        <div class="col-lg-4 col-md-6 mb-4 project-item">
                            <div class="card h-100 shadow-sm border-0">
                                <img src="${project.image_url}" class="card-img-top" alt="${project.title}">
                                <div class="card-body d-flex flex-column justify-content-between">
                                    <div>
                                        <h5 class="card-title fw-bold">${project.title}</h5>
                                        <p class="card-text text-muted mb-3">${project.description}</p>
                                    </div>
                                    <div>
                                        <div class="mb-3 d-flex flex-wrap">${projectTagsHtml}</div>
                                        <a href="${project.project_link}" class="btn btn-primary-gradient w-100 rounded-pill fw-bold" target="_blank">View Project</a>
                                    </div>
                                </div>
                            </div>
                        </div>`;
                    projectsList.innerHTML += projectCard;
                });
            }

            // Initial render
            renderProjectsList('all');

            // Attach event listener for filter button clicks
            filtersContainer.addEventListener('click', (e) => {
                const button = e.target.closest('button');
                if (!button) return;

                // Toggle active styles on buttons
                filtersContainer.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                // Filter projects
                const filterValue = button.getAttribute('data-filter');
                renderProjectsList(filterValue);
            });
        })
        .catch(err => console.error('Error fetching projects:', err));

    // 1. Contact Form Handler (Private Messages)
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const formData = new FormData(contactForm);
            const formObject = {};
            formData.forEach((value, key) => {
                formObject[key] = value;
            });

            // Post to backend database first
            fetch(contactForm.action, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formObject),
            })
            .then(response => {
                if (!response.ok) throw new Error('Backend DB unavailable, forwarding to email inbox directly.');
                return fetch('https://formspree.io/f/xzzpbyad', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formObject),
                });
            })
            .then(response => {
                if (response && response.ok) {
                    alert('Thank you! Your message has been sent successfully.');
                } else {
                    alert('Message sent successfully!');
                }
                contactForm.reset();
            })
            .catch(err => {
                console.warn(err.message);
                // Fallback for purely static hosting (submit direct to Formspree)
                fetch('https://formspree.io/f/xzzpbyad', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formObject),
                })
                .then(res => {
                    if (res.ok) {
                        alert('Thank you! Your message has been sent to my inbox.');
                        contactForm.reset();
                    } else {
                        alert('Failed to submit message.');
                    }
                })
                .catch(() => alert('Failed to submit message.'));
            });
        });
    }
};
