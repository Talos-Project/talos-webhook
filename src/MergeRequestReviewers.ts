import { Storage } from "./Storage"
import { GitlabStorage } from "./GitlabStorage";
import { ProjectId } from "./Project";
import { MergeRequestId } from "./MergeRequest";
import * as YAML from "yaml"
import { Snippets } from "./GitProvider";

export class MergeRequestReveiwers {

    private storage: Storage<Promise<string>, string>
    private reviewers: string[]

    constructor(snippets: Snippets, projectId: ProjectId, mrId: MergeRequestId, basePath?: string) {
        this.reviewers = []
        if (typeof basePath !== 'string')
            basePath = ""
        // FIXME Delegate storage decision to user class 
        this.storage = new GitlabStorage(snippets, `${basePath}/${projectId}/${mrId}`)
    }

    async get() {
        if (this.reviewers.length === 0) {
            this.reviewers = YAML.parse(await this.storage.read())['reviewers']
        }
        return this.reviewers
    }

    async set(reviewers: string[]) {
        this.reviewers = reviewers
        await this.storage.write(YAML.stringify({ reviewers: this.reviewers }))
    }
}