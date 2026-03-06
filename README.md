# coderoller

A local-first, privacy-friendly CLI tool to track your coding time across projects automatically.

## Features

- **Local-first**: No cloud, no tracking, no data leaks. Your activity stays on your machine in a SQLite database.
- **Privacy-friendly**: Tracks file edits without collecting sensitive content.
- **Zero-config**: Automatically detects project names based on `.git` folders.
- **Fast**: Built with Node.js and an asynchronous SQLite engine.
- **Background Tracking**: Minimal CPU usage, runs as a detached process.

## Getting Started

### Installation

```bash
npm link
```

### Usage

1. **Start tracking**:
   ```bash
   coderoller start
   ```

2. **Check your status**:
   ```bash
   coderoller status
   ```

3. **See today's summary**:
   ```bash
   coderoller today
   ```

4. **Stop tracking**:
   ```bash
   coderoller stop
   ```

5. **Clear activity history**:
   ```bash
   coderoller clear
   ```

## Project Structure

- `bin/`: CLI entry point.
- `commands/`: Command logic (start, stop, today, status).
- `watcher/`: The background engine that tracks file changes.
- `storage/`: SQLite database initialization and queries.

## Tech Stack

- **CLI Framework**: [commander](https://www.npmjs.com/package/commander)
- **File Watching**: [chokidar](https://www.npmjs.com/package/chokidar)
- **Storage**: [sqlite](https://www.npmjs.com/package/sqlite) / [sqlite3](https://www.npmjs.com/package/sqlite3)
- **UI**: [chalk](https://www.npmjs.com/package/chalk), [cli-table3](https://www.npmjs.com/package/cli-table3)
- **Date Handling**: [date-fns](https://www.npmjs.com/package/date-fns)

## License

MIT
