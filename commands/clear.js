import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import os from 'os';
import chalk from 'chalk';
import fs from 'fs';

const DB_PATH = path.join(os.homedir(), '.coderoller.db');

export async function clearCommand() {
    if (!fs.existsSync(DB_PATH)) {
        console.log(chalk.yellow('Database file not found. Nothing to clear.'));
        return;
    }

    console.log(chalk.red.bold('WARNING: This will delete all your tracked activity!'));

    // In a real CLI, we might want to ask for confirmation, 
    // but for now let's just do it if they run this specific command.

    try {
        fs.unlinkSync(DB_PATH);
        console.log(chalk.green('Database cleared successfully.'));
    } catch (error) {
        console.error(chalk.red('Failed to clear database:'), error.message);
    }
}
