#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { startCommand } from '../commands/start.js';
import { stopCommand } from '../commands/stop.js';
import { todayCommand } from '../commands/today.js';
import { statusCommand } from '../commands/status.js';
import { clearCommand } from '../commands/clear.js';

const program = new Command();

program
    .name('coderoller')
    .description('Track your coding time locally and privately')
    .version('1.0.0')
    .addHelpText('before', `
   ${chalk.cyan('____ ___  ____ ____ ____ ____ _    _    ____ ____')}
   ${chalk.cyan('|    |  \\ |___ |__/ |  | |    |    |    |___ |__/')}
   ${chalk.cyan('|___ |__/ |___ |  \\ |__| |___ |___ |___ |___ |  \\')}
    `)
    .addHelpText('after', `
Example call:
  $ coderoller start
  $ coderoller today
    `);

program
    .command('start')
    .description('Start tracking activity in the current directory')
    .action(startCommand);

program
    .command('stop')
    .description('Stop background tracking')
    .action(stopCommand);

program
    .command('today')
    .description('Show activity summary for today')
    .action(todayCommand);

program
    .command('status')
    .description('Check if tracking is active')
    .action(statusCommand);

program
    .command('clear')
    .description('Reset the activity database (DANGEROUS)')
    .action(clearCommand);

program.parse();
