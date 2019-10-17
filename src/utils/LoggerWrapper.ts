import { Logger } from "./Logger";

export class LoggerWrapper implements Logger {
    private logger: Logger;

    constructor(customLogger: Logger) {
        this.logger = customLogger;
    }

    debug(message?: any, ...optionalParams: any[]): void {
        this.logger.debug(
            JSON.stringify({
                level: "debug",
                message,
                timestamp: new Date().toISOString()
            }),
        );
    }
    error(message?: any, ...optionalParams: any[]): void {
        this.logger.error(
            JSON.stringify({
                level: "error",
                message,
                timestamp: new Date().toISOString()
            }),
        );
    }
    info(message?: any, ...optionalParams: any[]): void {
        this.logger.info(
            JSON.stringify({
                level: "info",
                message,
                timestamp: new Date().toISOString()
            })
        );
    }
    log(message?: any, ...optionalParams: any[]): void {
        this.logger.log(JSON.stringify(message), optionalParams);
    }
    warn(message?: any, ...optionalParams: any[]): void {
        this.logger.warn(
            JSON.stringify({
                level: "warn",
                message,
                timestamp: new Date().toISOString()
            }),
        );
    }
}
