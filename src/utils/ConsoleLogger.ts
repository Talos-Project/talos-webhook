import { Logger } from "./Logger";

export class ConsoleLogger implements Logger {

    debug(message?: any, ...optionalParams: any[]): void {
        console.debug(message)
    }
    error(message?: any, ...optionalParams: any[]): void {
        console.error(message)
    }
    info(message?: any, ...optionalParams: any[]): void {
        console.info(message)
    }
    log(message?: any, ...optionalParams: any[]): void {
        console.log(message)
    }
    warn(message?: any, ...optionalParams: any[]): void {
        console.warn(message)
    }

}