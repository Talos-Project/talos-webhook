import { Plugin } from "./Plugin"
import { GitProvider } from "./GitProvider";
import { NoteEvent } from "./NoteEvent";
import { MergeRequest } from "./MergeRequest";

export class LGTM implements Plugin<any, Promise<any>> {

    private client: GitProvider;

    constructor(client: GitProvider) {
        this.client = client
    }

    async handle(rx: NoteEvent): Promise<Promise<any>> {
        if (!rx.object_attributes.note)
            return

        if (rx.object_attributes.note.includes("/lgtm"))
            this.lgtm(rx)

        if (rx.object_attributes.note.includes("/unlgtm"))
            this.unlgtm(rx)
    }

    private async lgtm(rx: NoteEvent) {
        // TODO Handle WIP request
        const mr = (<MergeRequest>await this.client.MergeRequests
            .show(rx.project_id, rx.merge_request.iid));

        const { reviewers, lgtmers, labels } = mr

        if (!reviewers.map(u => u.id).includes(rx.object_attributes.author_id))
            return;

        if (!lgtmers.map(u => u.id).includes(rx.object_attributes.author_id))
            lgtmers.push(rx.user)

        return this.client.MergeRequests
            .edit(rx.project_id, rx.merge_request.iid,
                { labels: labels.concat("lgtm").join(","), ext: { lgtmers: lgtmers.map(u => u.username) } });
    }

    private async unlgtm(rx: NoteEvent) {
        const mr = (<MergeRequest>await this.client.MergeRequests
            .show(rx.project_id, rx.merge_request.iid));

        let { lgtmers, labels } = mr

        if (!lgtmers.map(u => u.id).includes(rx.object_attributes.author_id))
            return

        const lgtmerIndex = lgtmers.map(u => u.id).indexOf(rx.object_attributes.author_id)
        lgtmers.splice(lgtmerIndex, 1)

        if (lgtmers.length === 0) {
            const labelIndex = lgtmers.map(u => u.username).indexOf("lgtm")
            labels.splice(labelIndex, 1)
        }

        return this.client.MergeRequests
            .edit(rx.project_id, rx.merge_request.iid,
                { labels: labels.join(","), ext: { lgtmers: lgtmers.map(u => u.username) } })
    }
}