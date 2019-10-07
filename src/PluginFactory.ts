import { GitProvider } from "./GitProvider";
import { Plugin } from "./Plugin"
import { Meow } from "./Meow";
import { LGTM } from "./LGTM";

export class PluginFactory {

    private client: GitProvider;

    constructor(client: GitProvider) {
        this.client = client
    }

    public make(pluginName: string): Plugin<any, Promise<any>> {
        switch (pluginName) {
            case "meow":
                return new Meow(this.client)
            case "lgtm":
                return new LGTM(this.client)
            default:
                return null
        }
    }
}