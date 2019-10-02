import { GitlabProvider } from "./GitlabProvider";
import { Storage } from "./Storage"
import { GitlabStorage } from "./GitlabStorage";
import { ProjectId } from "./Project";
import { MergeRequestId } from "./MergeRequest";
import * as YAML from "yaml"

export class MergeRequestReveiwers {

    private provider: GitlabProvider
    private storage: Storage<Promise<string>,string>
    private reviewers: string[]

    constructor(provider: GitlabProvider, projectId: ProjectId, mrId: MergeRequestId, basePath?: string) {
        if (typeof basePath !== 'string')
            basePath = ""
        this.provider = provider
        this.storage = new GitlabStorage(provider, `${basePath}/${projectId}/${mrId}`)
    }

    async get() {
        if (this.reviewers.length === 0) {
            this.reviewers = YAML.parse(await this.storage.read())
        }
        return this.reviewers
    }

    async set(reviewers: string[]) {
        this.reviewers = reviewers
        await this.storage.write(YAML.stringify({reviewers: this.reviewers }))
    }
}