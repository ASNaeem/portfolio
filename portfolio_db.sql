CREATE DATABASE portfolio;
USE portfolio;

CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NULL,
    message TEXT NOT NULL,
    message_type ENUM('personal', 'guestbook') NOT NULL,
    mtime TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE visit_counter (
    id INT PRIMARY KEY AUTO_INCREMENT,
    count INT DEFAULT 0
);
CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    project_link VARCHAR(255) NOT NULL
);

INSERT INTO visit_counter (count) VALUES (0);

INSERT INTO messages (name, email, message, message_type, mtime) VALUES('John Doe', 'john.doe@example.com', 'I would like to know more', 'guestbook', NOW());


INSERT INTO projects (title, description, image_url, project_link)
VALUES ('Culinary Compass', 'Simple Recipe searching app made with HTML, CSS, and JavaScript', 'images/project1.jpg', 'https://asnaeem.github.io/CulinaryCompass/'),
('Web Note', 'Simple online note taking app made with HTML, CSS, and JavaScript', 'images/project2.jpg', 'https://asnaeem.github.io/WebNote/'),
('Store Management System', 'Simple StoreMS for windows made with Python and Mysql', 'images/project3.jpg', 'https://asnaeem.github.io/StoreMS/');