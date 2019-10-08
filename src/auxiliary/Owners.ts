import { RepositoryFiles } from "../interfaces/GitClient";
import { ProjectId } from "../interfaces/Project";
import { RepoBlob } from "../interfaces/RepoBlob";
import * as YAML from "yaml";

export type OwnerType = 'approvers' | 'reviewers'
abstract class Owners {

    private projectId: ProjectId;
    private files: RepositoryFiles;
    private type: string;
    private ownersFilePath = 'OWNERS';
    private owners = {};

    constructor(type: OwnerType, files: RepositoryFiles, projectId: ProjectId, path?: string) {
        this.type = type
        this.files = files
        this.projectId = projectId
        if (typeof path === 'string') {
            this.ownersFilePath = path
        }
    }

    private async fetch() {
        const blob = await this.files.show(this.projectId, this.ownersFilePath, 'master')
        this.owners = YAML.parse(Buffer.from((<RepoBlob>blob).content, "base64")
            .toString("ascii"))
    }

    public async get(): Promise<string[]> {
        if (Object.keys(this.owners).length === 0) {
            await this.fetch()
        }
        return this.owners[this.type];
    }

}

export class Approvers extends Owners {
    constructor(files: RepositoryFiles, projectId: ProjectId, path?: string) {
        super("approvers", files, projectId, path)
    }
}

export class Reviewers extends Owners {
    constructor(files: RepositoryFiles, projectId: ProjectId, path?: string) {
        super("reviewers", files, projectId, path)
    }
}
