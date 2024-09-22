window.onload = function() {
    fetchGuestbookEntries();
    // Fetch visit count
    fetch('/visit')
        .then(response => response.json())
        .then(data => {
            document.getElementById('visit-count').innerText = data.visitCount;
        }).catch(err => console.error('Error fetching visit count:', err));

    //fetching projects
    fetch('/projects')
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
        }).catch(err => console.error('Error fetching projects:', err));

    //setting up form elements
    const form = document.getElementById('contact-guestbook-form');
    const emailInput = document.getElementById('email');
    const messageTypeRadios = document.querySelectorAll('input[name="message_type"]');

    //Updating attributes based on selected message type
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

    //initial state for email field based on radio button
    const personalRadio = document.getElementById('personal');
    personalRadio.checked = true; 
    personalRadio.dispatchEvent(new Event('change'));

    //Contact & Guestbook form submission
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(form);
        if(!formData.get('email')){
            formData.set('email','');
        }
        //debugging
        console.log('Form Data:', Object.fromEntries(formData.entries()));
        var del = "yo";
        console.log('${del}');
        for(const[key, value] of formData.entries()){
            console.log('${key}: ${value}');
        }
        //Submit form via fetch API
        fetch('/guestbook', {
            method: 'POST',
            body: formData,
        }).then(response => {
            form.reset();
            if (response.ok) {
                form.reset();
                alert('Thank you! Your message has been sent.');
                fetchGuestbookEntries();
            }
            else{
                response.json().then(data=>
                    alert(data.error || 'Submission failed'));
            } 
        }).catch(error => console.error('Error:', error));
    });
};
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
}

function fetchGuestbookEntries() {
    fetch('/guestbook')
        .then(response => response.json())
        .then(entries => {
            const guestbookList = document.getElementById('guestbook-entries');
            guestbookList.innerHTML = ''; //clearing current entries

            entries.forEach(entry => {
                const formattedDate = formatTimestamp(entry.mtime); //formatting timestamp
                const entryCard = `
                    <div class="entry">
                        <h5><strong>${entry.name}</strong> (${entry.email || 'No email provided'}) at ${formattedDate}: </h5>
                        <p>${entry.message}</p>
                    </div>`;
                guestbookList.innerHTML += entryCard;
            });
        }).catch(err => console.error('Error fetching guestbook entries:', err));
}
