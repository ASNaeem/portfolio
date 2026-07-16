# Personal Portfolio Website

A responsive personal website and developer portfolio built with Node.js, Express.js, and MongoDB, featuring a dynamic visitor counter, project lists, and a guestbook/contact message manager.

---

## Features

- **Guestbook & Contact Form**: Dynamic message collection categorized into public guestbook posts and private personal contact requests.
- **Visitor Counter**: Real-time counter tracks and increments total page visits.
- **Projects Grid**: Dynamically loads project listings and details from the MongoDB database.
- **Automated Database Seeding**: Instantly populates the database with initial developer projects and counter states upon server startup if no data is present.
- **In-Memory MongoDB Support**: Automatically spins up an in-memory database server (`mongodb-memory-server`) for fast, local development if no connection URI is configured.
- **Isolated Testing Suite**: Robust integration tests covering all routes and validations without side effects.

---

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Frontend**: HTML5, CSS3, JavaScript (ES6), Bootstrap
- **Testing**: Jest, Supertest, MongoDB Memory Server

---

## REST API Endpoints

The Express server exposes the following routes:

| Method | Endpoint | Request Body | Description |
|:---|:---|:---|:---|
| **GET** | `/visit` | *None* | Increments and returns the total visit count |
| **GET** | `/projects` | *None* | Retrieves all project listings |
| **POST** | `/guestbook` | `{ "name": "...", "email": "...", "message": "...", "message_type": "guestbook/personal" }` | Saves a new guestbook or personal message |
| **GET** | `/guestbook` | *None* | Retrieves all public guestbook messages (sorted newest first) |

---

## Getting Started

### Prerequisites
- **Node.js** (v16 or higher recommended)

### Installation
1. Clone the repository and navigate to the project directory:
   ```bash
   cd portfolio
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```

### Configuration
The application reads environment configuration from a `.env` file at the root.

To connect to your own local or remote MongoDB instance:
1. Create a `.env` file from the example template.
2. Enter your connection string:
   ```env
   PORT=3300
   HOST=localhost
   MONGODB_URI=mongodb://your-mongodb-uri/portfolio
   ```

*Note: If MONGODB_URI is left undefined or commented out, the server defaults to an isolated in-memory database instance automatically.*

### Running the Application
- **Start production server**:
  ```bash
  npm start
  ```
- **Start development server (with nodemon auto-restart)**:
  ```bash
  npm run dev
  ```

Once the server is running, open [http://localhost:3300](http://localhost:3300) in your web browser.

### Running Tests
Execute integration tests:
```bash
npm run test
```
