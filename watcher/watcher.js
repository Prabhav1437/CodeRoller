import chokidar from 'chokidar';
import path from 'path';
import fs from 'fs';
import { logActivity, saveSession } from '../storage/db.js';

const IDLE_THRESHOLD = 5 * 60 * 1000;

let currentSession = null;
let lastActivityTime = Date.now();

function findProjectRoot(filePath) {
    try {
        let currentDir = fs.statSync(filePath).isDirectory() ? filePath : path.dirname(filePath);
        while (currentDir !== path.parse(currentDir).root) {
            if (fs.existsSync(path.join(currentDir, '.git'))) {
                return path.basename(currentDir);
            }
            const parent = path.dirname(currentDir);
            if (parent === currentDir) break;
            currentDir = parent;
        }
    } catch (e) { }
    return 'idk';
}

function findGitBranch(filePath) {
    try {
        let currentDir = fs.statSync(filePath).isDirectory() ? filePath : path.dirname(filePath);
        while (currentDir !== path.parse(currentDir).root) {
            const headPath = path.join(currentDir, '.git', 'HEAD');
            if (fs.existsSync(headPath)) {
                const head = fs.readFileSync(headPath, 'utf8');
                if (head.startsWith('ref: ')) {
                    return head.replace('ref: refs/heads/', '').trim();
                }
                return head.substring(0, 7);
            }
            const parent = path.dirname(currentDir);
            if (parent === currentDir) break;
            currentDir = parent;
        }
    } catch (e) { }
    return 'main';
}

async function handleActivity(filePath) {
    if (!fs.existsSync(filePath)) return;

    const now = Date.now();
    const projectName = findProjectRoot(filePath);
    const branch = findGitBranch(filePath);

    await logActivity({ projectName, filePath, language: path.extname(filePath), branch });

    const isNewSessionNeeded = !currentSession ||
        currentSession.projectName !== projectName ||
        (now - lastActivityTime) > IDLE_THRESHOLD;

    if (isNewSessionNeeded) {
        if (currentSession) await finalizeSession();

        currentSession = {
            projectName,
            startTime: new Date().toISOString(),
            lastHeartbeat: now
        };
        console.log(`[${new Date().toLocaleTimeString()}] Starting session: ${projectName}`);
    } else {
        currentSession.lastHeartbeat = now;
    }

    lastActivityTime = now;
}

async function finalizeSession() {
    if (!currentSession) return;

    const endTime = new Date(currentSession.lastHeartbeat).toISOString();
    const durationInSeconds = Math.floor((currentSession.lastHeartbeat - new Date(currentSession.startTime).getTime()) / 1000);

    if (durationInSeconds > 10) {
        await saveSession({
            projectName: currentSession.projectName,
            startTime: currentSession.startTime,
            endTime: endTime,
            duration: durationInSeconds
        });
        console.log(`[${new Date().toLocaleTimeString()}] Saved session: ${durationInSeconds}s`);
    }
    currentSession = null;
}

const watcher = chokidar.watch(process.cwd(), {
    ignored: [/(^|[\/\\])\../, '**/node_modules/**'],
    persistent: true,
    ignoreInitial: true
});

watcher.on('all', async (event, path) => {
    if (['add', 'change', 'unlink'].includes(event)) {
        await handleActivity(path);
    }
});

process.on('SIGTERM', async () => {
    await finalizeSession();
    process.exit();
});

console.log(`Watcher started in: ${process.cwd()}`);
