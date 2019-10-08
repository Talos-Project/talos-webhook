import { Storage } from "../interfaces/Storage"
import { GitlabStorage } from "../gitlab/GitlabStorage";
import { ProjectId } from "../interfaces/Project";
import { MergeRequestId } from "../interfaces/MergeRequest";
import * as YAML from "yaml"
import { Snippets } from "../interfaces/GitClient";

export class MergeRequestParticipants {

    private storage: Storage<Promise<string>, string>
    private reviewers: string[]
    private lgtmers: string[]

    constructor(snippets: Snippets, projectId: ProjectId, mrId: MergeRequestId, basePath?: string) {
        this.reviewers = []
        this.lgtmers = []
        if (typeof basePath !== 'string')
            basePath = ""
        // FIXME Delegate storage decision to user class 
        this.storage = new GitlabStorage(snippets, `${basePath}/${projectId}/${mrId}`)
    }

    async get() {
        if (this.reviewers.length === 0 && this.lgtmers.length === 0) {
            this.reviewers = YAML.parse(await this.storage.read())['reviewers'] || []
            this.lgtmers = YAML.parse(await this.storage.read())['lgtmers'] || []
        }
        return { reviewers: this.reviewers, lgtmers: this.lgtmers }
    }

    async set(kvargs: object) {
        if (typeof kvargs["reviewers"] !== 'undefined')
            this.reviewers = kvargs["reviewers"]
        if (typeof kvargs["lgtmers"] !== 'undefined')
            this.lgtmers = kvargs["lgtmers"]
        await this.storage.write(YAML.stringify({ reviewers: this.reviewers, lgtmers: this.lgtmers }))
    }
}