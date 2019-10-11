import { GitClient } from "./interfaces/GitClient";
import { Caturday } from "./plugins/Caturday";
import { LGTM } from "./plugins/LGTM";
import { Welcome } from "./plugins/Welcome";
import { TestRunner } from "./plugins/TestRunner";
import { Blunderbuss } from "./plugins/Blunderbuss";
import { Approve } from "./plugins/Approve";

export class PluginFactory {

    private client: GitClient;

    private pluginMap = { 
            Caturday: Caturday.prototype,
            LGTM: LGTM.prototype,
            Welcome: Welcome.prototype,
            TestRunner: TestRunner.prototype,
            Blunderbuss: Blunderbuss.prototype,
            Approve: Approve.prototype
         }

    constructor(client: GitClient) {
        this.client = client
    }

    public make(pluginName: string, config?: object) {

        if (Object.keys(this.pluginMap).indexOf(pluginName) === -1)
            return Object.create({ 
                handle: () => { 
                    return Promise.reject(
                        `Invalid plugin name provided: "${pluginName}". ` +
                        `List of available plugins: ${Object.keys(this.pluginMap).join(', ')}`
                        ) 
                }
            })

        return Object.setPrototypeOf(
            { client: this.client }, 
            this.pluginMap[pluginName]
        )
    }
}
