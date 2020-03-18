'use strict';
const winston = require('winston');
const { format } = require('winston');
const fs = require('fs');

const logDir = 'logs';
// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}
const tsFormat = () => (new Date()).toLocaleString();

let transports = [
    new(winston.transports.Console)({
        timestamp: tsFormat,
        colorize: true
    }),
    new(winston.transports.File)({
        filename: './logs/api.log'
    })
];

exports.logger = winston.createLogger({
    format: format.combine(
        format.colorize(),
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
    transports: transports
});