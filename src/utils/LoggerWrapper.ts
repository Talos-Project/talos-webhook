import { Logger } from "./Logger";

export class LoggerWrapper implements Logger {
    private logger: Logger;

    constructor(customLogger: Logger) {
        this.logger = customLogger;
    }

    debug(message?: any, ...optionalParams: any[]): void {
        this.logger.debug(this.format("debug", message));
    }
    error(message?: any, ...optionalParams: any[]): void {
        this.logger.error(this.format("error", message));
    }
    info(message?: any, ...optionalParams: any[]): void {
        this.logger.info(this.format("info", message));
    }
    log(message?: any, ...optionalParams: any[]): void {
        this.logger.log(JSON.stringify(message), optionalParams);
    }
    warn(message?: any, ...optionalParams: any[]): void {
        this.logger.warn(this.format("warn", message));
    }

    private format(level: string, message: string) {
        return JSON.stringify({
            level,
            message,
            timestamp: new Date().toISOString()
        })
    }
}
