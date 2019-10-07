import { MergeRequests, Snippet, Snippets, Users } from "./GitProvider";
import { MergeRequestId, MergeRequest } from "./MergeRequest";
import { ProjectId } from "./Project";
import { Storage } from "./Storage"
import * as YAML from "yaml"
import { GitlabStorage } from "./GitlabStorage";
import { User } from "./User";

export class MergeRequestDecorator implements MergeRequests {
    private mr
    private snippets
    private users: Users

    constructor(mr: MergeRequests, snippets: Snippets, users: Users, basePath?: string) {
        this.mr = mr
        this.snippets = snippets
        this.users = users
    }

    async edit(project_id: ProjectId, iid: MergeRequestId, options?: object): Promise<object> {
        let ext;

        if (Object.keys(options).includes("ext"))
            ext = this.update(project_id, iid, options["ext"])

        return Object.assign(await this.mr.edit(project_id, iid, options).then(v => v)
            .catch(_ => new Object({ iid, project_id })), await ext)
    }

    async show(pid: ProjectId, mrid: MergeRequestId, options?: object) {
        const { reviewers, lgtmers } = await this.readFromStorage(pid, mrid, options);
        const users = await <Promise<User[]>>this.users.all()
        const payload = await <Promise<MergeRequest>>this.mr.show(pid, mrid)
        payload.reviewers = []
        payload.lgtmers = []
        users.filter(u => reviewers.includes(u.username)).forEach(u => payload.reviewers.push(u))
        users.filter(u => lgtmers.includes(u.username)).forEach(u => payload.lgtmers.push(u))
        return payload
    }

    private async readFromStorage(pid: ProjectId, mrid: MergeRequestId, options?: object) {
        const storage = this.makeStorage(pid, mrid, options);
        const reviewers = YAML.parse(await storage.read())['reviewers'] || [];
        const lgtmers = YAML.parse(await storage.read())['lgtmers'] || [];
        return { reviewers, lgtmers };
    }

    private async update(pid: ProjectId, mrid: MergeRequestId, options: object): Promise<object> {
        const storage = this.makeStorage(pid, mrid, options);
        let { reviewers, lgtmers } = await this.readFromStorage(pid, mrid, options)

        if (Object.keys(options).includes("reviewers")) {
            reviewers = options["reviewers"]
        }

        if (Object.keys(options).includes("lgtmers")) {
            lgtmers = options["lgtmers"]
        }

        return storage.write(YAML.stringify({ reviewers, lgtmers }))
            .then(_ => Object.assign({ reviewers, lgtmers }))
            .catch(err => `couldn't write to storage: ${err}`)
    }

    private makeStorage(pid: ProjectId, mrid: MergeRequestId, options?: object) {
        const basePath = (typeof options !== 'undefined' && typeof options["basepath"] === 'string') ? options["basePath"] : "";
        // FIXME Delegate storage decision to user class 
        return new GitlabStorage(this.snippets, `${basePath}/${pid}/${mrid}`);
    }
}

