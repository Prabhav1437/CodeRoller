import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import os from 'os';

const DB_PATH = path.join(os.homedir(), '.coderoller.db');

let dbInstance = null;

/**
 * Get or initialize the SQLite database connection.
 * @returns {Promise<import('sqlite').Database>}
 */
async function getDb() {
  if (dbInstance) return dbInstance;

  dbInstance = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });

  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS activity (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_name TEXT,
      file_path TEXT,
      language TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      branch TEXT
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_name TEXT,
      start_time DATETIME,
      end_time DATETIME,
      duration INTEGER
    );
  `);

  return dbInstance;
}

/**
 * Log a single activity event.
 * @param {Object} params
 * @param {string} params.projectName
 * @param {string} params.filePath
 * @param {string} params.language
 * @param {string} params.branch
 */
export async function logActivity({ projectName, filePath, language, branch }) {
  const db = await getDb();
  return await db.run(`
    INSERT INTO activity (project_name, file_path, language, branch)
    VALUES (?, ?, ?, ?)
  `, projectName, filePath, language, branch);
}

/**
 * Save a session to the database.
 * @param {Object} session
 * @param {string} session.projectName
 * @param {string} session.startTime
 * @param {string} session.endTime
 * @param {number} session.duration
 */
export async function saveSession(session) {
  const db = await getDb();
  return await db.run(`
    INSERT INTO sessions (project_name, start_time, end_time, duration)
    VALUES (?, ?, ?, ?)
  `, session.projectName, session.startTime, session.endTime, session.duration);
}

/**
 * Get aggregated activity for today per project.
 * @returns {Promise<Array<{project_name: string, total_duration: number, last_active: string}>>}
 */
export async function getTodayActivity() {
  const db = await getDb();
  return await db.all(`
    SELECT project_name, SUM(duration) as total_duration, MAX(end_time) as last_active
    FROM sessions
    WHERE date(start_time) = date('now', 'localtime')
    GROUP BY project_name
  `);
}

/**
 * Get a summary of activity categories for today.
 * @returns {Promise<Array<{category: string, total_duration: number}>>}
 */
export async function getTodayCategorySummary() {
  const db = await getDb();
  const total = await db.get(`SELECT SUM(duration) as total FROM sessions WHERE date(start_time) = date('now', 'localtime')`);
  if (!total || !total.total) return [];

  const activities = await db.all(`
    SELECT 
      CASE 
        WHEN file_path LIKE '%test%' OR file_path LIKE '%spec%' OR file_path LIKE '%__tests__%' THEN 'Debugging'
        WHEN language IN ('.md', '.txt', '.markdown') THEN 'Reading Docs'
        WHEN language IN ('.json', '.yml', '.yaml', '.toml', '.env') THEN 'Config/Global'
        WHEN file_path LIKE '%.git/%' THEN 'Git Work'
        ELSE 'Coding'
      END as category,
      COUNT(*) as count
    FROM activity
    WHERE date(timestamp) = date('now', 'localtime')
    GROUP BY category
  `);

  const totalCount = activities.reduce((acc, curr) => acc + curr.count, 0);

  return activities.map(a => ({
    category: a.category,
    total_duration: Math.floor((a.count / totalCount) * total.total)
  })).sort((a, b) => b.total_duration - a.total_duration);
}

/**
 * Get overall statistics for today.
 * @returns {Promise<{first_active: string, last_active: string, total_duration: number}>}
 */
export async function getTodayStats() {
  const db = await getDb();
  return await db.get(`
        SELECT 
            MIN(start_time) as first_active,
            MAX(end_time) as last_active,
            SUM(duration) as total_duration
        FROM sessions
        WHERE date(start_time) = date('now', 'localtime')
    `);
}
