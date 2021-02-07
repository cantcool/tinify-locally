const tinify = require('tinify');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

const SKIP_EXTENSIONS = ['gif', 'jpg', 'jpeg'];
const MONTH_FREE_LIMIT = 500;
const MONTH_FREE_ALERT_THRESHOLD = 0.94;
const INPUT_PATH = './input';
const WRITE_DELAY = 250;

const watcher = chokidar.watch(INPUT_PATH);
let compressionsThisRun = 0;
let writeTimeout;

fs.readFile('.key', 'utf8', function (err, data) {
    if (err) {
        console.log(`${chalk.red('API key error!')} Check ${chalk.bgRed('.key')} file is stored in root directory`);
    };
    tinify.key = data;
});

const handleFile = file => {
    const slashPos = file.lastIndexOf('\\');
    const dotPos = file.lastIndexOf('.');
    const name = file.slice(slashPos + 1, dotPos);
    const ext = file.substr(dotPos + 1);
    const filePadded = `${name}.${ext} `.padEnd(36, '_');
    const newFileName = `./output/${name}.${ext}`;

    if (SKIP_EXTENSIONS.includes(ext.toLowerCase())) {
        fs.copyFile(file, newFileName, (err) => {
            if (err) throw err;
            logger(`00 ➜  ${chalk.blue(filePadded)} ${chalk.bgBlue.bold('  Passed  ')} ➜  ${chalk.bold(newFileName)}`);
        });

        return;
    }

    const source = tinify.fromFile(file);
    source.toFile(newFileName, errorHandler);

    let tinifyMonthMessage;

    if (tinify.compressionCount) {
        const monthRate = tinify.compressionCount / MONTH_FREE_LIMIT;
        tinifyMonthMessage = `This month: ${chalk.bold(tinify.compressionCount + ' / ' + MONTH_FREE_LIMIT)} `
        if (monthRate < 0.5) {
            tinifyMonthMessage = `${chalk.green(tinifyMonthMessage)}`;
        } else if (monthRate > MONTH_FREE_ALERT_THRESHOLD) {
            tinifyMonthMessage = `${chalk.red(tinifyMonthMessage)}`;
        } else {
            tinifyMonthMessage = `${chalk.yellow(tinifyMonthMessage)}`;
        }
    }

    logger(`${String(++compressionsThisRun).padStart(2, '0')} ➜  ${chalk.green(filePadded)} ${chalk.bgGreen.bold(' Tinified ')} ${tinifyMonthMessage ? tinifyMonthMessage : ' '}`);
};

const logger = message => {
    console.log(`${chalk.bgGrey(' ' + (new Date()).toLocaleTimeString('de-DE') + ' ')} ${message}`);
}

const errorHandler = err => {
    if (err instanceof tinify.AccountError) {
        console.error(chalk.red('Verify your API key and account limit.'));
    } else if (err instanceof tinify.ClientError) {
        // Check your source image and request options.
        console.error(chalk.bgRed(file), err);
        console.error('Check your source image and request options.');
    } else if (err instanceof tinify.ServerError) {
        // Temporary issue with the Tinify API.
        console.error('Temporary issue with the Tinify API.');
    } else if (err instanceof tinify.ConnectionError) {
        // A network connection error occurred.
        console.error('A network connection error occurred.')
    } else if (err) {
        // Something else went wrong, unrelated to the Tinify API.
        console.error(chalk.red(file), err);
        console.error('Something else went wrong, unrelated to the Tinify API.')
    }
};

watcher
    .on('add', path => {
        if (path.indexOf('_tmp') > -1) { return }
        writeTimeout = setTimeout(() => handleFile(path), WRITE_DELAY);
    })
    .on('error', error => {
        console.error('error', error)
    })