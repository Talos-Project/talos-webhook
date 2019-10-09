import { Plugin } from "../interfaces/Plugin"
import { GitClient } from "../interfaces/GitClient";
import { NoteEvent } from "../interfaces/events/NoteEvent";
import { MergeRequest } from "../interfaces/structs/MergeRequest";

export class LGTM implements Plugin<any, Promise<any>> {

    private client: GitClient;

    constructor(client: GitClient) {
        this.client = client
    }

    async handle(rx: NoteEvent): Promise<any> {
        if (rx.object_kind !== "note")
            return Promise.resolve()

        if (rx.object_attributes.note.includes("/lgtm"))
            return this.lgtm(rx)

        if (rx.object_attributes.note.includes("/unlgtm"))
            return this.unlgtm(rx)
    }

    private async lgtm(rx: NoteEvent) {
        try {
            const mr = <MergeRequest>await this.client.MergeRequests
                .show(rx.project_id, rx.merge_request.iid)

            const { reviewers, lgtmers, labels } = mr

            if (!reviewers.map(u => u.id).includes(rx.object_attributes.author_id))
                return Promise.resolve();

            if (!lgtmers.map(u => u.id).includes(rx.object_attributes.author_id))
                lgtmers.push(rx.user)

            return this.client.MergeRequests
                .edit(rx.project_id, rx.merge_request.iid,
                    {
                        labels: labels.concat("lgtm").join(","),
                        ext: {
                            lgtmers: lgtmers.map(u => u.username)
                        }
                    });
        } catch (e) {
            return Promise.reject(e)
        }
    }

    private async unlgtm(rx: NoteEvent) {
        try {
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
        } catch (e) {
            return Promise.reject(e)
        }
    }
}