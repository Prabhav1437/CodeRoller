import Table from 'cli-table3';
import chalk from 'chalk';
import { getTodayActivity, getTodayCategorySummary, getTodayStats } from '../storage/db.js';
import { formatDistanceToNow } from 'date-fns';

function formatDuration(seconds) {
    if (seconds <= 0) return '0m';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
}

export async function todayCommand() {
    const projects = await getTodayActivity();
    const categories = await getTodayCategorySummary();
    const stats = await getTodayStats();

    if (projects.length === 0) {
        console.log(chalk.yellow('\nNo activity recorded for today. \n'));
        return;
    }

    const firstActive = new Date(stats.first_active);
    const lastActive = new Date(stats.last_active);
    const totalSpannedSeconds = Math.floor((lastActive - firstActive) / 1000);
    const idleSeconds = Math.max(0, totalSpannedSeconds - stats.total_duration);

    const activityTable = new Table({
        head: [chalk.magenta('Activity'), chalk.magenta('Duration')],
        colWidths: [20, 15],
        style: { head: [], border: [] }
    });

    categories.forEach(row => {
        activityTable.push([row.category, formatDuration(row.total_duration)]);
    });

    if (idleSeconds > 60) {
        activityTable.push([chalk.dim('Idle'), chalk.dim(formatDuration(idleSeconds))]);
    }

    console.log(chalk.bold.cyan(`\n 📊 Activity Breakdown`));
    console.log(activityTable.toString());

    const projectTable = new Table({
        head: [chalk.blueBright('Project'), chalk.blueBright('Duration'), chalk.blueBright('Last Active')],
        colWidths: [25, 15, 20],
        style: { head: [], border: ['dim'] }
    });

    projects.forEach(row => {
        const lastActiveStr = row.last_active
            ? formatDistanceToNow(new Date(row.last_active), { addSuffix: true })
            : 'never';

        projectTable.push([
            chalk.white(row.project_name),
            chalk.yellow(formatDuration(row.total_duration)),
            chalk.dim(lastActiveStr)
        ]);
    });

    console.log(chalk.bold.cyan(`\n 📁 Top Projects`));
    console.log(projectTable.toString());

    console.log(`\n${chalk.gray('Total tracked time today:')} ${chalk.bold.greenBright(formatDuration(stats.total_duration))}\n`);
}