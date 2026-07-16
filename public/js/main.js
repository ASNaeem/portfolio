// Utility function to format timestamps
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
}

// Function to fetch and display guestbook entries (fails gracefully on static hosting)
function fetchGuestbookEntries() {
    fetch('/guestbook')
        .then(response => {
            if (!response.ok) throw new Error('Guestbook API not supported on this host.');
            return response.json();
        })
        .then(entries => {
            const guestbookList = document.getElementById('guestbook-entries');
            guestbookList.innerHTML = ''; // Clear entries

            entries.forEach(entry => {
                const formattedDate = formatTimestamp(entry.mtime);
                const entryCard = `
                    <div class="card mb-3 shadow-sm border-start border-primary border-3">
                        <div class="card-body py-3">
                            <div class="d-flex justify-content-between align-items-center mb-1">
                                <h6 class="card-subtitle fw-bold mb-0 text-dark">${entry.name}</h6>
                                <small class="text-muted">${formattedDate}</small>
                            </div>
                            ${entry.email ? `<p class="mb-2"><small class="text-muted"><i class="fa-regular fa-envelope"></i> ${entry.email}</small></p>` : ''}
                            <p class="card-text text-muted mb-0">${entry.message}</p>
                        </div>
                    </div>`;
                guestbookList.innerHTML += entryCard;
            });
        })
        .catch(err => {
            console.warn(err.message);
            const guestbookList = document.getElementById('guestbook-entries');
            guestbookList.innerHTML = '<p class="text-muted"><small>Guestbook list is only available with a running backend server.</small></p>';
        });
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
        const pointsHtml = exp.points.map(pt => `<li class="mb-1">${pt}</li>`).join('');
        const expCard = `
            <div class="card mb-4 shadow-sm border-0 bg-light">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start flex-wrap mb-2">
                        <div>
                            <h4 class="card-title h5 mb-1 fw-bold text-dark">${exp.company}</h4>
                            <p class="card-subtitle text-primary h6 mb-0">${exp.role}</p>
                        </div>
                        <span class="badge bg-secondary p-2 mt-1 mt-md-0">${exp.dates}</span>
                    </div>
                    <ul class="card-text text-muted mb-0 ps-3">
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
            <div class="card mb-3 shadow-sm border-0 bg-light">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start flex-wrap mb-2">
                        <div>
                            <h4 class="card-title h5 mb-1 fw-bold text-dark">${edu.school}</h4>
                            <p class="card-subtitle text-muted h6 mb-0">${edu.degree}</p>
                        </div>
                        <span class="badge bg-secondary p-2 mt-1 mt-md-0">${edu.dates}</span>
                    </div>
                    ${edu.location ? `<p class="card-text text-muted mb-0"><small><i class="fa-solid fa-location-dot"></i> ${edu.location}</small></p>` : ''}
                </div>
            </div>`;
        educationList.innerHTML += eduCard;
    });

    // 4. Skills
    const skillsList = document.getElementById('skills-list');
    skillsList.innerHTML = '';
    data.skills.forEach(skill => {
        const skillCard = `
            <div class="col-md-6 mb-3">
                <div class="card h-100 shadow-sm border-0 bg-light">
                    <div class="card-body">
                        <h5 class="card-title fw-bold text-primary mb-2">${skill.category}</h5>
                        <p class="card-text text-muted">${skill.items}</p>
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
                <div class="card shadow-sm border-0 bg-light">
                    <div class="card-body d-flex align-items-start gap-3">
                        <i class="fa-regular fa-file-lines text-primary mt-1" style="font-size: 1.25rem;"></i>
                        <p class="card-text text-muted mb-0">${res}</p>
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
                <div class="card shadow-sm border-0 bg-light">
                    <div class="card-body d-flex align-items-start gap-3">
                        <i class="fa-solid fa-trophy text-warning mt-1" style="font-size: 1.25rem;"></i>
                        <p class="card-text text-muted mb-0">${ach}</p>
                    </div>
                </div>
            </div>`;
        achievementsList.innerHTML += achItem;
    });
}

// Window onload event handler
window.onload = function() {
    // Load resume sections dynamically from local markdown file
    loadResumeDetails();

    // Fetch and render guestbook entries
    fetchGuestbookEntries();

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
            const projectsList = document.getElementById('projects-list');
            projectsList.innerHTML = '';
            projects.forEach(project => {
                const projectCard = `
                    <div class="col-lg-4 col-md-6 mb-4">
                        <div class="card h-100 shadow-sm border-0">
                            <img src="${project.image_url}" class="card-img-top" alt="${project.title}">
                            <div class="card-body d-flex flex-column justify-content-between">
                                <div>
                                    <h5 class="card-title fw-bold text-dark">${project.title}</h5>
                                    <p class="card-text text-muted mb-3">${project.description}</p>
                                </div>
                                <a href="${project.project_link}" class="btn btn-primary w-100" target="_blank">View Project</a>
                            </div>
                        </div>
                    </div>`;
                projectsList.innerHTML += projectCard;
            });
        })
        .catch(err => console.error('Error fetching projects:', err));

    // Setting up form elements and event listeners after DOM is fully loaded
    const form = document.getElementById('guestbook-form');
    const emailInput = document.getElementById('email');
    const messageTypeRadios = document.querySelectorAll('input[name="message_type"]');

    // Updating attributes based on the selected message type
    messageTypeRadios.forEach((radio) => {
        radio.addEventListener('change', function() {
            if (this.value === 'personal') {
                emailInput.required = true; // Require email for personal messages
                emailInput.placeholder = "Your email (required)";
            } else {
                emailInput.required = false; // Do not require email for guestbook entries
                emailInput.placeholder = "Your email (optional)";
            }
        });
    });

    // Initial state for the email field based on radio button
    const personalRadio = document.getElementById('personal');
    if (personalRadio) {
        personalRadio.checked = true; 
        personalRadio.dispatchEvent(new Event('change'));
    }

    // Form submission handler for contact & guestbook form
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const formData = new FormData(form);
        const formObject = {};
        formData.forEach((value, key) => {
            formObject[key] = value;
        });

        const isPersonalMessage = formObject.message_type === 'personal';

        fetch(form.action, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formObject),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to save message to the database.');
            }
            if (isPersonalMessage) {
                return fetch('https://formspree.io/f/xzzpbyad', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formObject),
                });
            } else {
                return Promise.resolve();
            }
        })
        .then(response => {
            if (isPersonalMessage && response) {
                if (response.ok) {
                    alert('Thank you! Your message has been sent.');
                } else {
                    return response.json().then(data => {
                        alert(data.error || 'Submission failed');
                    });
                }
            } else {
                alert('Your message has been saved to the guestbook.');
            }

            form.reset();
            personalRadio.checked = true; 
            personalRadio.dispatchEvent(new Event('change'));
            fetchGuestbookEntries();
        })
        .catch(error => {
            console.error('Error:', error);
            // Fallback for purely static hosting (e.g. submit contact requests directly via Formspree without server)
            if (isPersonalMessage) {
                fetch('https://formspree.io/f/xzzpbyad', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formObject),
                })
                .then(res => {
                    if (res.ok) {
                        alert('Thank you! Your message has been sent directly to form inbox.');
                        form.reset();
                    } else {
                        alert('Failed to submit message.');
                    }
                })
                .catch(() => alert('Failed to submit message.'));
            } else {
                alert('Guestbook postings are only supported with a running database.');
            }
        });
    });
};
