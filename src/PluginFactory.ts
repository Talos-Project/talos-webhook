import { GitProvider } from "./GitProvider";
import { Plugin } from "./Plugin"
import { Meow } from "./Meow";

export class PluginFactory {

    private client: GitProvider;

    constructor(client: GitProvider) {
        this.client = client
    }

    public make(pluginName: string): Plugin<any, Promise<any>> {
        switch (pluginName) {
            case "meow":
                return new Meow(this.client)
        }
    }
}