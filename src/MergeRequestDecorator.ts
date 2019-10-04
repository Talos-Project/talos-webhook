import { MergeRequests, Snippet, Snippets } from "./GitProvider";
import { MergeRequestId } from "./MergeRequest";
import { ProjectId } from "./Project";
import { MergeRequestParticipants } from "./MergeRequestParticipants";

export class MergeRequestDecorator implements MergeRequests {

    private mr
    private snippets

    constructor(mr: MergeRequests, snippets: Snippets) {
        this.mr = mr
        this.snippets = snippets
    }

    edit(project_id: ProjectId, mrId: ProjectId, options?: object): Promise<object> {
        return this.mr.edit()
    }

    async show(pid: ProjectId, mrid: MergeRequestId) {
        const payload = await this.mr.show(pid, mrid)
        const { reviewers, lgtmers } = await new MergeRequestParticipants(this.snippets,pid,mrid).get()
        payload.reviewers = reviewers
        payload.lgtmers = lgtmers
        return payload
    }

}