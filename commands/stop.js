import fs from 'fs';
import os from 'os';
import path from 'path';
import chalk from 'chalk';

const PID_FILE = path.join(os.homedir(), '.coderoller.pid');

export async function stopCommand() {
    if (!fs.existsSync(PID_FILE)) {
        console.log(chalk.yellow('coderoller is not running.'));
        return;
    }

    const pid = fs.readFileSync(PID_FILE, 'utf8');
    try {
        process.kill(pid, 0); // Check if process exists
        process.kill(pid, 'SIGTERM');
        fs.unlinkSync(PID_FILE);
        console.log(chalk.green('✔') + chalk.red(' coderoller tracking stopped.'));
    } catch (e) {
        if (e.code === 'ESRCH') {
            console.log(chalk.yellow('Stale PID file found. Cleaning up...'));
            fs.unlinkSync(PID_FILE);
            console.log(chalk.gray('coderoller was not actually running.'));
        } else {
            console.log(chalk.red('Failed to stop coderoller:'), e.message);
        }
    }
}
