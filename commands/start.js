import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PID_FILE = path.join(os.homedir(), '.coderoller.pid');

export async function startCommand() {
    if (fs.existsSync(PID_FILE)) {
        const pid = fs.readFileSync(PID_FILE, 'utf8');
        try {
            process.kill(pid, 0);
            console.log(chalk.yellow('coderoller is already running.'));
            return;
        } catch (e) {
            fs.unlinkSync(PID_FILE);
        }
    }

    const watcherPath = path.join(__dirname, '../watcher/watcher.js');
    const logPath = path.join(os.homedir(), '.coderoller.log');

    const logFile = fs.openSync(logPath, 'a');

    const child = spawn('node', [watcherPath], {
        detached: true,
        stdio: ['ignore', logFile, logFile]
    });

    fs.writeFileSync(PID_FILE, child.pid.toString());
    child.unref();

    console.log(chalk.green('coderoller tracking started in background.'));
    console.log(chalk.dim(`Tracking directory: ${process.cwd()}`));
    console.log(chalk.dim(`Logs: ${logPath}`));
}
