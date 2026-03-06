#!/usr/bin/env node

import { Command } from 'commander';
import { startCommand } from '../commands/start.js';
import { stopCommand } from '../commands/stop.js';
import { todayCommand } from '../commands/today.js';
import { statusCommand } from '../commands/status.js';

const program = new Command();

program
    .name('coderoller')
    .description('Track your coding time locally and privately')
    .version('1.0.0');

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

program.parse();
