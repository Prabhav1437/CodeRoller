import fs from 'fs';
import os from 'os';
import path from 'path';
import chalk from 'chalk';

const PID_FILE = path.join(os.homedir(), '.coderoller.pid');

export async function stopCommand() {

    console.log(chalk.cyan(`
____ _____  ___   ____ ____  ____          _____ ____
|    |   |  |  \\ |___ |__/  |  | |    |    |___ |__/
|___ |___|  |__/ |___ |  \\ |__| |___ |___ |___ |  \\
    `.trim()));
    if (!fs.existsSync(PID_FILE)) {
        console.log(chalk.yellow('coderoller is not running.'));
        return;
    }

    const pid = fs.readFileSync(PID_FILE, 'utf8');
    try {
        process.kill(pid, 0);
        process.kill(pid, 'SIGTERM');
        fs.unlinkSync(PID_FILE);
        console.log(chalk.red('coderoller tracking stopped.'));
    } catch (e) {
        console.log(chalk.red('Failed to stop coderoller:'), e.message);
    }
}
