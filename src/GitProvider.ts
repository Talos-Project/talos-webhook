import { GitClient } from "./interfaces/GitClient";
import { Git } from "./interfaces/Config";

export class GitProvider {
    private static client: GitClient = null;
    private constructor() {}
    static getInstance(gitConfig: Git) {
        if (this.client === null) 
            this.client = new (require(gitConfig.client)).default(gitConfig)
        
        return this.client;
    }
}