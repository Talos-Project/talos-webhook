import { MergeRequests, Snippets, Users } from "../interfaces/GitClient";
import { MergeRequestId, MergeRequest } from "../interfaces/structs/MergeRequest";
import { ProjectId } from "../interfaces/structs/Project";
import * as YAML from "yaml"
import { GitlabStorage } from "./GitlabStorage";
import { User } from "../interfaces/structs/User";

export class MergeRequestDecorator implements MergeRequests {
    private mr: MergeRequests
    private snippets: Snippets
    private users: Users

    constructor(mr: MergeRequests, snippets: Snippets, users: Users, basePath?: string) {
        this.mr = mr
        this.snippets = snippets
        this.users = users
    }

    accept(project_id: ProjectId, mrId: ProjectId): Promise<object> {
        return this.mr.accept(project_id, mrId)
    }

    async edit(project_id: ProjectId, iid: MergeRequestId, options?: object): Promise<object> {
        let ext;

        if (Object.keys(options).includes("ext"))
            ext = this.update(project_id, iid, options["ext"])

        return Object.assign(await this.mr.edit(project_id, iid, options)
            .then(v => v)
            .catch(_ => new Object({ iid, project_id })), await ext)
    }

    async show(pid: ProjectId, mrid: MergeRequestId, options?: object) {
        try {
            const { reviewers, lgtmers } = await this.readFromStorage(pid, mrid, options);
            const users = await <Promise<User[]>>this.users.all()
            const payload = await <Promise<MergeRequest>>this.mr.show(pid, mrid)
            payload.reviewers = []
            payload.lgtmers = []
            users.filter(u => reviewers.includes(u.username)).forEach(u => payload.reviewers.push(u))
            users.filter(u => lgtmers.includes(u.username)).forEach(u => payload.lgtmers.push(u))
            return payload
        } catch (e) {
            return Promise.reject(e)
        }
    }

    private async readFromStorage(pid: ProjectId, mrid: MergeRequestId, options?: object) {
        const storage = this.makeStorage(pid, mrid, options);
        try {
            const file = await storage.read();
            const document = YAML.parse(file);

            const reviewers = document.hasOwnProperty("reviewers") ?
                document['reviewers'] : [];

            const lgtmers = document.hasOwnProperty("lgtmers") ?
                document['lgtmers'] : [];

            return { reviewers, lgtmers };
        } catch (e) {
            return Promise.reject(e)
        }
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

