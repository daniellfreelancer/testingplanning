/*
 # ┌────────────── second (optional)
 # │ ┌──────────── minute
 # │ │ ┌────────── hour
 # │ │ │ ┌──────── day of month
 # │ │ │ │ ┌────── month
 # │ │ │ │ │ ┌──── day of week
 # │ │ │ │ │ │
 # │ │ │ │ │ │
 # * * * * * * 
 */

const cron = require('node-cron');
const { runDailyProcess } = require('./dailyRunner');

function registerCronJobs(deps) {
    const dailyMidnight = cron.schedule(
        '0 0 0 * * *',        // seg min hora => 00:00:00 todos los días
        //'0 15 19 * * *',      // seg min hora => 10:00:00 todos los días (test)
        async () => {
            await runDailyProcess(deps);
        },
        { timezone: 'America/Santiago' }
    );

    return { dailyMidnight };
}

module.exports = { registerCronJobs };
