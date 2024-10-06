import fs from 'fs';

export enum LogType {
    INFO = "INFO",
    ERROR = "ERROR",
    WARN = "WARN",
    DEBUG = "DEBUG"
}

export enum LoggingMethod {
    LOG= "LOG",
    STREAM = "STREAM",
    LOG_AND_STREAM = "LOG_AND_STREAM"
}

export class Logger {

    static _loggingMethod: LoggingMethod;
    static _loggingPath: string;

    static init(loggingMethod: LoggingMethod, loggingPath: string) : void {
        Logger._loggingMethod = loggingMethod;
        Logger._loggingPath = loggingPath;
    }

    static getDate(): string {
        return new Date().toISOString();
    }

    static info(msg: string): void {

        let logEntry : string = Logger.getDate() + " - " + msg

        switch (Logger._loggingMethod) {
            case LoggingMethod.LOG:
                fs.appendFile(`${Logger._loggingPath}` , `${logEntry}\r\n`, function (err) {
                    if (err) throw err;
                });
                break;
            case LoggingMethod.LOG_AND_STREAM:

                console.log(logEntry);

                fs.appendFile(`${Logger._loggingPath}` , `${logEntry}\r\n`, function (err) {
                    if (err) throw err;
                });

                break;
            case LoggingMethod.STREAM:
                console.log(logEntry);
                break;
        }

    }

    static error(msg: string): void {

        let logEntry : string = Logger.getDate() + " - " + msg

        switch (Logger._loggingMethod) {
            case LoggingMethod.LOG:
                fs.appendFile(`${Logger._loggingPath}` , `${logEntry}\r\n`, function (err) {
                    if (err) throw err;
                });
                break;
            case LoggingMethod.LOG_AND_STREAM:
                console.error(logEntry);
                fs.appendFile(`${Logger._loggingPath}` , `${logEntry}\r\n`, function (err) {
                    if (err) throw err;
                });
                break;
            case LoggingMethod.STREAM:
                console.error(logEntry);
                break;
        }


    }

    static warn(msg: string): void {

        let logEntry : string = Logger.getDate() + " - " + msg

        switch (Logger._loggingMethod) {
            case LoggingMethod.LOG:
                fs.appendFile(`${Logger._loggingPath}` , `${logEntry}\r\n`, function (err) {
                    if (err) throw err;
                });
                break;
            case LoggingMethod.LOG_AND_STREAM:
                console.warn(logEntry);
                fs.appendFile(`${Logger._loggingPath}` , `${logEntry}\r\n`, function (err) {
                    if (err) throw err;
                });
                break;
            case LoggingMethod.STREAM:
                console.warn(logEntry);
                break;
        }


    }

    static debug(msg: string): void {

        let logEntry : string = Logger.getDate() + " - " + msg

        switch (Logger._loggingMethod) {
            case LoggingMethod.LOG:
                fs.appendFile(`${Logger._loggingPath}` , `${logEntry}\r\n`, function (err) {
                    if (err) throw err;
                });
                break;
            case LoggingMethod.LOG_AND_STREAM:
                console.debug(logEntry);
                fs.appendFile(`${Logger._loggingPath}` , `${logEntry}\r\n`, function (err) {
                    if (err) throw err;
                });
                break;
            case LoggingMethod.STREAM:
                console.debug(logEntry);
                break;
        }

    }
}
