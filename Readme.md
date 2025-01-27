# Project Setup

Follow these steps to set up the project:

## Prerequisites

- Node.js (v20 or higher)
- MongoDB (v8.0.4 or higher)

## Installation

1. **Install dependencies:**

    ```bash
    npm install
    ```

## MongoDB Setup

1. **Start MongoDB:**

    Ensure MongoDB is running on your local machine. On a Linux machine with systemctl, you start the mongo service like this:

    ```bash
    systemctl start mongod
    ```

## Running the Server

1. **Start the server:**

    ```bash
    npm index.js
    ```

2. **Access the application:**

    Open your browser and navigate to `http://localhost:8000`.

Your API endpoint should now be up and running!