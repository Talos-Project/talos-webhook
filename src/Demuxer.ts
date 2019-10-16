import { Plugin } from "./interfaces/Plugin";
import { Logger } from "./utils/Logger";

export class Demuxer {
    plugins: Plugin<any, Promise<any>>[];
    logger: Logger;

    constructor(plugins: Plugin<any, Promise<any>>[], logger?: Logger) {
        if (logger) this.logger = logger;

        this.plugins = plugins;
    }

    dispatch(payload: any) {
        this.plugins.forEach(plugin => {
            plugin
                .handle(payload)
                .catch(e =>
                    this.logger.error(
                        JSON.stringify(Object.assign(e,
                            {
                                pluginName: plugin.constructor.name,
                                request: payload,
                            }
                        ))
                    )
                );
        });
    }
}
