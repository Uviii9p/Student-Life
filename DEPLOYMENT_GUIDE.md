# 🚀 **DEPLOYMENT GUIDE: STUDENT DAILY LIFE APP**

This guide will walk you through deploying your full-stack application (React Frontend + Node.js Backend) to the web for free using **Render.com**.

---

## ✅ **PREREQUISITES**
1.  **GitHub Account** (to host your code).
2.  **MongoDB Atlas Account** (for the database).
3.  **Render.com Account** (for hosting the app).

---

## STEP 1: PREPARE YOUR DATABASE (MongoDB Atlas)
1.  Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  Create a **Cluster** (Free Tier).
3.  Go to **Database Access** -> Create a User (username/password).
4.  Go to **Network Access** -> Add IP Address -> Allow Access from Anywhere (`0.0.0.0/0`).
5.  Go to **Database** -> Connect -> "Connect your application".
6.  **Copy the Connection String**. It looks like:
    `mongodb+srv://<username>:<password>@cluster0.exmpl.mongodb.net/?retryWrites=true&w=majority`
    *(Save this for Step 3)*.

---

## STEP 2: PUSH CODE TO GITHUB
1.  Create a new repository on GitHub (e.g., `student-daily-life-app`).
2.  Open your terminal in the project folder and run:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/student-daily-life-app.git
    git push -u origin main
    ```

---

## STEP 3: DEPLOY ON RENDER
1.  Log in to [Render.com](https://render.com).
2.  Click **"New +"** -> **"Web Service"**.
3.  Connect your GitHub repository.
4.  **Configure the Service:**
    -   **Name:** `student-daily-life-app` (or similar)
    -   **Region:** Closest to you (e.g., Singapore, Frankfurt)
    -   **Branch:** `main`
    -   **Root Directory:** `.` (Leave empty)
    -   **Runtime:** `Node`
    -   **Build Command:** `npm install && npm run build`
        *(This installs dependencies and builds the React frontend)*
    -   **Start Command:** `npm start`
        *(This runs the backend, which now serves the frontend too)*

5.  **Environment Variables (CRITICAL):**
    Scroll down to "Environment Variables" and add these:
    -   `NODE_ENV` = `production`
    -   `MONGODB_URI` = *(Paste your connection string from Step 1)*
    -   `JWT_SECRET` = *(Enter a long random secret key, e.g., `mySuperSecretKey123!`)*

6.  Click **"Create Web Service"**.

---

## 🎉 **THAT'S IT!**
Render will verify the build and assume control.
-   It will install all packages.
-   It will build the React app into the `dist` folder.
-   It will start the server.
-   **Your app will be live at:** `https://student-daily-life-app.onrender.com` (or similar URL).

---

## 🐛 **TROUBLESHOOTING**
-   **White Screen?** Check the "Logs" tab in Render. If it says "Module not found", ensure `npm install` ran correctly.
-   **Database Error?** Ensure you whitelisted IP `0.0.0.0/0` in MongoDB Atlas so Render can connect.
-   **Login Fails?** Check `MONGODB_URI` and `JWT_SECRET` are exactly correct.
