import { GitClient, RepositoryOwners } from "../interfaces/GitClient";
import { ProjectId } from "../interfaces/Project";
import * as YAML from "yaml";
import { RepoBlob } from "../interfaces/RepoBlob";
import { User } from "../interfaces/User";

export interface Owners {
    approvers: string[]
    reviewers: string[]
}

export class GitlabOwners implements RepositoryOwners {

    private client: GitClient

    constructor(client: GitClient) {
        this.client = client
    }

    async show(pid: ProjectId, options?) {
        let branch = "master"
        let filename = "OWNERS"

        if (options && options.branch)
            branch = options.branch

        if (options && options.filename)
            filename = options.filename

        const blob = await <Promise<RepoBlob>>this.client
            .RepositoryFiles.show(pid, filename, branch)

        const users: User[] = await this.client.Users.all()

        const { approvers, reviewers }: Owners = YAML.parse(Buffer.from((blob).content, "base64")
            .toString("ascii"));

        return {
            project_id: pid,
            approvers: approvers
                .map(username => users.find(u => u.username === username)),
            reviewers: reviewers
                .map(username => users.find(u => u.username === username)) 
        }
    }

}