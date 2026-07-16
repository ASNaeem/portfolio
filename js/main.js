// Utility function to format timestamps
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
}

// Function to fetch and display guestbook entries
function fetchGuestbookEntries() {
    fetch('/guestbook')
        .then(response => response.json())
        .then(entries => {
            const guestbookList = document.getElementById('guestbook-entries');
            guestbookList.innerHTML = ''; // Clear current entries

            entries.forEach(entry => {
                const formattedDate = formatTimestamp(entry.mtime); // Formatting timestamp
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
        .catch(err => console.error('Error fetching guestbook entries:', err));
}

// Function to fetch and render the dynamic resume markdown details
function loadResumeDetails() {
    fetch('/resume')
        .then(response => response.json())
        .then(data => {
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
        })
        .catch(err => console.error('Error loading resume details:', err));
}

// Window onload event handler
window.onload = function() {
    // Load resume sections dynamically from markdown endpoint
    loadResumeDetails();

    // Fetch and render guestbook entries
    fetchGuestbookEntries();

    // Fetch visit count
    fetch('/visit')
        .then(response => response.json())
        .then(data => {
            document.getElementById('visit-count').innerText = data.visitCount;
        })
        .catch(err => console.error('Error fetching visit count:', err));

    // Fetching and displaying projects on page load
    fetch('/projects')
        .then(response => response.json())
        .then(projects => {
            const projectsList = document.getElementById('projects-list');
            projectsList.innerHTML = ''; // Clear static indicators
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

        // Convert FormData to a plain object
        const formData = new FormData(form);
        const formObject = {};
        formData.forEach((value, key) => {
            formObject[key] = value;
        });

        // Check message type if it's personal
        const isPersonalMessage = formObject.message_type === 'personal';

        // Send data to your server
        fetch(form.action, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formObject),  // Send as JSON string
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to save message to the database.');
            }
            // If the message is successfully saved to the DB, proceed to Formspree if it's a personal message
            if (isPersonalMessage) {
                return fetch('https://formspree.io/f/xzzpbyad', { // Replace with your Formspree endpoint
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formObject),  // Send as JSON string
                });
            } else {
                // If it's a guestbook entry, return a resolved promise to continue the chain
                return Promise.resolve(); // Ensure the chain continues
            }
        })
        .then(response => {
            // Handle Formspree response if it was a personal message
            if (isPersonalMessage && response) {
                if (response.ok) {
                    alert('Thank you! Your message has been sent.');
                } else {
                    return response.json().then(data => {
                        alert(data.error || 'Submission to Formspree failed');
                    });
                }
            } else {
                // If it was a guestbook entry, just show a success message
                alert('Your message has been saved to the guestbook.');
            }

            // Reset the form and refresh the guestbook entries
            form.reset();
            // Re-trigger the change event to update the email placeholder after reset
            personalRadio.checked = true; 
            personalRadio.dispatchEvent(new Event('change'));
            fetchGuestbookEntries(); // Refresh the guestbook entries
        })
        .catch(error => {
            console.error('Error:', error);
            alert('There was an error submitting your message.');
        });
    });
};
