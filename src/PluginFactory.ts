import { GitProvider } from "./GitProvider";
import { Plugin } from "./Plugin"
import { Caturday } from "./Caturday";
import { LGTM } from "./LGTM";

export class PluginFactory {

    private client: GitProvider;

    constructor(client: GitProvider) {
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