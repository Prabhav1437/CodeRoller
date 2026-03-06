import fs from 'fs';
import os from 'os';
import path from 'path';
import chalk from 'chalk';

const PID_FILE = path.join(os.homedir(), '.coderoller.pid');

export async function statusCommand() {
    if (!fs.existsSync(PID_FILE)) {
        console.log(chalk.gray('coderoller is ') + chalk.red('not running'));
        return;
    }

    const pid = fs.readFileSync(PID_FILE, 'utf8');
    try {
        process.kill(pid, 0);
        console.log(chalk.gray('coderoller is ') + chalk.green('running') + chalk.gray(` (PID: ${pid})`));

        const logPath = path.join(os.homedir(), '.coderoller.log');
        if (fs.existsSync(logPath)) {
            const logs = fs.readFileSync(logPath, 'utf8').split('\n').filter(Boolean);
            const lastLine = logs[logs.length - 1];
            if (lastLine) {
                console.log(chalk.dim(`Status: ${lastLine}`));
            }
        }
    } catch (e) {
        console.log(chalk.gray('coderoller is ') + chalk.yellow('stale') + chalk.gray(' (process not found)'));
        fs.unlinkSync(PID_FILE);
    }
}
