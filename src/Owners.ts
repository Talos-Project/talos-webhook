import { GitProvider } from "./GitProvider";
import { ProjectId } from "./Project";
import { RepoBlob } from "./RepoBlob";
import * as YAML from "yaml";

abstract class Owners {

    private projectId: ProjectId;
    private gitProvider: GitProvider;
    private type: string;
    private ownersFilePath = 'OWNERS';
    private owners = {};

    constructor(type, provider, projectId: ProjectId, path?: string) {
        this.type = type
        this.gitProvider = provider
        this.projectId = projectId
        if (typeof path === 'string') {
            this.ownersFilePath = path
        }
    }

    private async fetch() {
        const blob = await this.gitProvider.RepositoryFiles
            .show(this.projectId, this.ownersFilePath, 'master')
        this.owners = YAML.parse(Buffer.from((<RepoBlob>blob).content, "base64")
            .toString("ascii"))
    }

    public async get() {
        if (Object.keys(this.owners).length === 0) {
            await this.fetch()
        }
        return this.owners[this.type];
    }

}

export class Approvers extends Owners {
    constructor(provider, projectId: ProjectId, path?: string) {
        super("approvers", provider, projectId, path)
    }
}

export class Reviewers extends Owners {
    constructor(provider, projectId: ProjectId, path?: string) {
        super("reviewers", provider, projectId, path)
    }
}
