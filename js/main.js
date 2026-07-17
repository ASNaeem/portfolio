// Helper to get custom skill proficiency for the visualizer
function getSkillProficiency(skillName) {
    const name = skillName.toLowerCase().trim();
    if (name.includes('golang') || name === 'go') return 90;
    if (name.includes('gin') || name === 'rest api' || name.includes('microservices')) return 90;
    if (name.includes('php') || name.includes('laravel') || name === 'javascript' || name.includes('node') || name.includes('mysql') || name.includes('postgresql') || name.includes('redis') || name === 'git' || name === 'sql') return 85;
    if (name.includes('java') || name.includes('python') || name.includes('mongodb') || name.includes('docker') || name.includes('grpc') || name.includes('ci/cd') || name.includes('linux')) return 80;
    if (name.includes('react') || name.includes('spring') || name.includes('aws') || name.includes('elasticsearch') || name.includes('c++')) return 75;
    if (name === 'c' || name.includes('kubernetes')) return 70;
    return 75; // Default fallback
}

// Function to fetch GitHub Profile details dynamically from backend caching proxy
function loadGitHubProfile() {
    fetch('/github-stats')
        .then(response => {
            if (!response.ok) throw new Error('GitHub proxy error');
            return response.json();
        })
        .then(data => {
            if (data.public_repos !== undefined) {
                document.getElementById('github-repos').innerText = data.public_repos;
            }
            const privateReposEl = document.getElementById('github-private-repos');
            if (privateReposEl && data.total_private_repos !== undefined) {
                privateReposEl.innerText = data.total_private_repos;
            }
            if (data.name) {
                document.getElementById('github-name').innerText = data.name;
            }
            const avatar = document.getElementById('github-avatar');
            if (avatar && data.avatar_url) {
                avatar.src = data.avatar_url;
                avatar.style.display = 'block';
            }
        })
        .catch(err => {
            console.warn('Failed to load GitHub stats from proxy:', err);
            // Fallback: We do not override the DOM, leaving the pre-rendered HTML placeholder '25'
        });
}

// Function to update the GitHub Contribution Chart color theme
function updateGitHubChartTheme(theme) {
    const chart = document.getElementById('github-chart');
    if (!chart) return;
    if (theme === 'dark') {
        chart.src = 'https://ghchart.rshah.org/60a5fa/ASNaeem';
    } else {
        chart.src = 'https://ghchart.rshah.org/3b82f6/ASNaeem';
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
    // 1. About / Summary — split on double newlines to support multi-paragraph summaries
    const aboutEl = document.getElementById('about-text');
    const paragraphs = data.summary.split(/\n\n+/).filter(p => p.trim());
    aboutEl.innerHTML = paragraphs.map(p => `<p class="mb-3">${p.trim()}</p>`).join('');

    // 2. Professional Experience
    const experienceList = document.getElementById('experience-list');
    experienceList.innerHTML = '';
    data.experience.forEach(exp => {
        const cleanDates = exp.dates.replace(/\s*--\s*/g, ' \u2013 ');
        const pointsHtml = exp.points.map(pt => `<li class="mb-2"><i class="fa-solid fa-angle-right text-primary me-2"></i>${pt}</li>`).join('');
        const expCard = `
            <div class="card mb-4 shadow-sm border-start border-primary border-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start flex-wrap mb-2">
                        <div>
                            <h4 class="card-title h5 mb-1 fw-bold">${exp.company}</h4>
                            <p class="card-subtitle text-primary h6 mb-0 fw-semibold">${exp.role}</p>
                        </div>
                        <span class="badge bg-secondary p-2 mt-1 mt-md-0">${cleanDates}</span>
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
        const cleanEduDates = edu.dates.replace(/\s*--\s*/g, ' \u2013 ');
        const eduCard = `
            <div class="card mb-3 shadow-sm border-start border-success border-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start flex-wrap mb-2">
                        <div>
                            <h4 class="card-title h5 mb-1 fw-bold">${edu.school}</h4>
                            <p class="card-subtitle text-muted h6 mb-0">${edu.degree}</p>
                        </div>
                        <span class="badge bg-secondary p-2 mt-1 mt-md-0">${cleanEduDates}</span>
                    </div>
                    ${edu.location ? `<p class="card-text text-muted mb-0"><small><i class="fa-solid fa-location-dot me-1"></i> ${edu.location}</small></p>` : ''}
                </div>
            </div>`;
        educationList.innerHTML += eduCard;
    });

    // 4. Skills (Rendered as badge chip tags grouped by category)
    const skillsList = document.getElementById('skills-list');
    skillsList.innerHTML = '';
    data.skills.forEach(skill => {
        const chipsHtml = skill.items.split(',').map(item => {
            const name = item.trim();
            if (!name) return '';
            return `<span class="skill-chip">${name}</span>`;
        }).join('');
        const skillCard = `
            <div class="col-md-6 mb-4">
                <div class="card h-100 shadow-sm border-start border-primary border-3">
                    <div class="card-body">
                        <h5 class="card-title fw-bold mb-3 text-primary-gradient">${skill.category}</h5>
                        <div class="skill-chips-container">
                            ${chipsHtml}
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
            // Use explicit tech_tags from JSON; fallback to empty array
            projects.forEach(project => {
                project.tags = Array.isArray(project.tech_tags) && project.tech_tags.length > 0
                    ? project.tech_tags
                    : ['Other'];
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
                    const projectTagsHtml = project.tags.map(t =>
                        `<span class="skill-chip me-1 mb-1">${t}</span>`
                    ).join('');

                    const projectCard = `
                        <div class="col-lg-4 col-md-6 mb-4 project-item">
                            <div class="card h-100 shadow-sm border-0">
                                <img src="${project.image_url}" class="card-img-top" alt="${project.title}">
                                <div class="card-body d-flex flex-column justify-content-between">
                                    <div>
                                        <h5 class="card-title fw-bold">${project.title}</h5>
                                        <p class="card-text text-muted mb-3">${project.description}</p>
                                        <div class="mb-3 d-flex flex-wrap">${projectTagsHtml}</div>
                                    </div>
                                    <a href="${project.project_link}" class="btn btn-primary-gradient w-100 rounded-pill fw-bold" target="_blank">View Project</a>
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

    // 1. Copy Email clipboard functionality
    const copyEmailBtn = document.getElementById('copy-email-btn');
    if (copyEmailBtn) {
        copyEmailBtn.addEventListener('click', () => {
            const email = copyEmailBtn.getAttribute('data-email');
            navigator.clipboard.writeText(email).then(() => {
                const originalHTML = copyEmailBtn.innerHTML;
                copyEmailBtn.innerHTML = '<i class="fa-solid fa-check me-2"></i>Copied!';
                copyEmailBtn.classList.remove('btn-primary-gradient');
                copyEmailBtn.classList.add('btn-success');
                copyEmailBtn.style.background = 'var(--success-gradient)';
                
                setTimeout(() => {
                    copyEmailBtn.innerHTML = originalHTML;
                    copyEmailBtn.classList.remove('btn-success');
                    copyEmailBtn.classList.add('btn-primary-gradient');
                    copyEmailBtn.style.background = '';
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy email: ', err);
            });
        });
    }

    // Initialize scroll driven reveal triggers
    initScrollReveal();

    // Initialize floating back to top action triggers
    initBackToTop();

    // Initialize mobile navbar auto-collapse on link click
    initNavbarCollapse();
};

// Function to initialize auto-closing mobile navbar on click
function initNavbarCollapse() {
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    const navbarCollapse = document.getElementById('navbarNav');
    
    if (navbarCollapse && typeof bootstrap !== 'undefined') {
        const bsCollapse = new bootstrap.Collapse(navbarCollapse, { toggle: false });
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Only collapse on mobile/tablet view where the toggler button is visible
                const toggler = document.querySelector('.navbar-toggler');
                const isMobile = toggler && window.getComputedStyle(toggler).display !== 'none';
                if (isMobile && navbarCollapse.classList.contains('show')) {
                    // Do not close if clicking the theme-toggle button
                    if (e.target.closest('#theme-toggle')) return;
                    bsCollapse.hide();
                }
            });
        });
    }
}

// Function to initialize scroll driven reveal observer
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });
    
    reveals.forEach(el => observer.observe(el));
}

// Function to initialize floating back to top button
function initBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');
    if (!backToTopBtn) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

