import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOG_DIR = path.join(__dirname, '..', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'server_debug.log');

const log = (msg) => {
    try {
        fs.mkdirSync(LOG_DIR, { recursive: true });
        fs.appendFileSync(LOG_FILE, `[${new Date().toISOString()}] [AUTH_MIDDLEWARE] ${msg}\n`);
    } catch (e) {
        console.error('Failed to write to log file:', e);
    }
};

const userAuth = async (req, res, next) => {
    const { token } = req.cookies;
    if (!token) {
        log('No token found in cookies');
        return res.status(401).json({ success: false, message: 'Not authorized. Please log in again.' });
    }
    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
        if (tokenDecode.id) {
            req.userId = tokenDecode.id;
            log(`Authenticated user: ${tokenDecode.id}`);
        } else {
            log('Token verification succeeded but no ID found');
            return res.status(401).json({ success: false, message: 'Not authorized.' });
        }
        return next();
    } catch (error) {
        log(`Token verification failed: ${error.message}`);
        return res.status(401).json({ success: false, message: error.message });
    }
};

export default userAuth;
