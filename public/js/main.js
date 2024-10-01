// Utility function to format timestamps
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
}

// Function to fetch and display guestbook entries
function fetchGuestbookEntries() {
    fetch('https://asn-portfolio.up.railway.app/guestbook')
        .then(response => response.json())
        .then(entries => {
            const guestbookList = document.getElementById('guestbook-entries');
            guestbookList.innerHTML = ''; // Clear current entries

            entries.forEach(entry => {
                const formattedDate = formatTimestamp(entry.mtime); // Formatting timestamp
                const entryCard = `
                    <div class="entry">
                        <h5><strong>${entry.name}</strong> (${entry.email || 'No email provided'}) at ${formattedDate}: </h5>
                        <p>${entry.message}</p>
                    </div>`;
                guestbookList.innerHTML += entryCard;
            });
        })
        .catch(err => console.error('Error fetching guestbook entries:', err));
}

// Window onload event handler
window.onload = function() {
    //Fetching guestbook entries and visit counts
    fetchGuestbookEntries();

    // Fetch visit count
    fetch('https://asn-portfolio.up.railway.app/visit')
        .then(response => response.json())
        .then(data => {
            document.getElementById('visit-count').innerText = data.visitCount;
        })
        .catch(err => console.error('Error fetching visit count:', err));

    //Fetching and displaying projects on page load
    fetch('https://asn-portfolio.up.railway.app/projects')
        .then(response => response.json())
        .then(projects => {
            const projectsList = document.getElementById('projects-list');
            projects.forEach(project => {
                const projectCard = `
                    <div class="col-lg-4 col-md-6 mb-4">
                        <div class="card h-100">
                            <img src="${project.image_url}" class="card-img-top" alt="${project.title}">
                            <div class="card-body">
                                <h5 class="card-title">${project.title}</h5>
                                <p class="card-text">${project.description}</p>
                            </div>
                            <div class="card-footer">
                                <a href="${project.project_link}" class="btn btn-primary">View Project</a>
                            </div>
                        </div>
                    </div>`;
                projectsList.innerHTML += projectCard;
            });
        })
        .catch(err => console.error('Error fetching projects:', err));

    //Setting up form elements and event listeners after DOM is fully loaded
    const form = document.getElementById('guestbook-form');
    const emailInput = document.getElementById('email');
    const messageTypeRadios = document.querySelectorAll('input[name="message_type"]');

    //Updating attributes based on the selected message type
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

    //Initial state for the email field based on radio button
    const personalRadio = document.getElementById('personal');
    personalRadio.checked = true; 
    personalRadio.dispatchEvent(new Event('change'));

    //Form submission handler for contact & guestbook form
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
