import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Health check
app.get('/health', (req, res) => res.send('OK'));

// Serve Static Assets from the 'dist' folder
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback to index.html for React Router (SPA support)
app.use((req, res, next) => {
    // If request is for an API route that no longer exists, return 404
    if (req.url.startsWith('/api')) {
        return res.status(404).json({ error: 'API routes are disabled. Transitioned to local storage.' });
    }

    // Otherwise, serve the frontend
    const indexPath = path.join(distPath, 'index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            res.status(200).send('Server is running. Please run "npm run build" to generate the frontend.');
        }
    });
});

const PORT = process.env.PORT || 5050;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`--------------------------------------------------`);
    console.log(`🚀 StudentLife Server Running`);
    console.log(`🔗 URL: http://localhost:${PORT}`);
    console.log(`📦 Mode: Local Storage (No Database Required)`);
    console.log(`--------------------------------------------------`);
});
