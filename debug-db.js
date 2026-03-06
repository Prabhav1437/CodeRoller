import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import os from 'os';

const DB_PATH = path.join(os.homedir(), '.devtime.db');

async function debug() {
    const db = await open({
        filename: DB_PATH,
        driver: sqlite3.Database
    });

    const rows = await db.all('SELECT * FROM sessions');
    console.log(JSON.stringify(rows, null, 2));
}

debug();
