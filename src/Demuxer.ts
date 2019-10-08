import { Plugin } from "./interfaces/Plugin"

export class Demuxer {

    plugins: Plugin<any, Promise<any>>[]

    constructor(plugins: Plugin<any, Promise<any>>[]) {
        this.plugins = plugins
    }

    dispatch(payload: any) {
        this.plugins.forEach(plugin => {
            plugin.handle(payload)
        })
    }

}