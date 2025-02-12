# CodeStreams - Real-Time Collaborative Code Editor (Backend)

## Overview

This backend service for CodeStreams is built with Node.js and Express.js, providing real-time collaboration features using Socket.io and integrating with the Piston API for code execution. TypeScript is used throughout the project for added reliability and maintainability.

## Features

- **Real-Time Communication:** Leverages Socket.io for live updates.
- **RESTful API:** Developed with Express.js to handle HTTP requests.
- **Code Execution:** Integrates with the Piston API to execute code.
- **Type Safety:** Uses TypeScript to enforce reliable code structure.

## Tech Stack

- **Node.js** – Runtime environment
- **Express.js** – Web framework
- **Socket.io** – Real-time communication
- **TypeScript** – Static type checking
- **Piston API** – Code execution engine

## Getting Started

### Prerequisites

- Node.js installed
- npm or yarn package manager

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/kishan-kareliya/Code-Stream-Server
   cd codestreams-backend
   ```

2. **Install dependencies:**

   ```bash
   npm install && tsc -b
   ```

3. **Set Up Environment Variables:**

   Create a `.env` file in the root directory with the following content:

   ```
   JWT_SECRET=your-secret-key
   FRONTEND_URL=http://localhost:5173.

   ```

4. **Start the Server:**
   ```bash
   node dist/index.js
   ```

The backend service will run at [http://localhost:3000](http://localhost:3000).
