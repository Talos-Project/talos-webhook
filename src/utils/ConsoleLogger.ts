import { Logger } from "./Logger";

export class ConsoleLogger implements Logger {

    debug(message?: any, ...optionalParams: any[]): void {
        console.debug(message, optionalParams)
    }
    error(message?: any, ...optionalParams: any[]): void {
        console.error(message, optionalParams)
    }
    info(message?: any, ...optionalParams: any[]): void {
        console.info(message, optionalParams)
    }
    log(message?: any, ...optionalParams: any[]): void {
        console.log(message, optionalParams)
    }
    warn(message?: any, ...optionalParams: any[]): void {
        console.warn(message, optionalParams)
    }

}