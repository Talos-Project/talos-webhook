import { GitClient } from "./interfaces/GitClient";
import { Plugin } from "./interfaces/Plugin"
import { Caturday } from "./plugins/Caturday";
import { LGTM } from "./plugins/LGTM";

export class PluginFactory {

    private client: GitClient;

    constructor(client: GitClient) {
        this.client = client
    }

    public make(pluginName: string, config?: object): Plugin<any, Promise<any>> {
        switch (pluginName) {
            case "meow":
                return new Caturday(this.client)
            case "lgtm":
                return new LGTM(this.client)
            default:
                return null
        }
    }
}