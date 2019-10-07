import { Plugin } from "./Plugin"
import { GitProvider } from "./GitProvider";
import { NoteEvent } from "./NoteEvent";
import { MergeRequest } from "./MergeRequest";
import { MergeRequestParticipants } from "./MergeRequestParticipants";

export class LGTM implements Plugin<any, Promise<any>> {

    private client

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
        const participants = new MergeRequestParticipants(
            this.client.Snippets,
            rx.project_id,
            rx.merge_request.iid)

        const { reviewers, lgtmers } = await participants.get()

        if (!reviewers.includes(rx.user.username))
            return;

        const labels = await this.client.MergeRequests
            .show(rx.project_id, rx.merge_request.iid)
            .then(mr => (<MergeRequest>mr).labels);
        this.client.MergeRequests
            .edit(rx.project_id, rx.merge_request.iid,
                { labels: labels.concat("lgtm").join(",") });


        if (lgtmers.includes(rx.user.username))
            return

        lgtmers.push(rx.user.username)
        participants.set({ lgtmers })
    }

    private async unlgtm(rx: NoteEvent) {
        const participants = new MergeRequestParticipants(
            this.client.Snippets,
            rx.project_id,
            rx.merge_request.iid)

        let { lgtmers } = await participants.get()

        if (!lgtmers.includes(rx.user.username))
            return

        const lgtmerIndex = lgtmers.indexOf(rx.user.username)
        lgtmers.splice(lgtmerIndex, 1)

        participants.set({ lgtmers: lgtmers })

        if (lgtmers.length !== 0)
            return

        let labels = await this.client.MergeRequests
            .show(rx.project_id, rx.merge_request.iid)
            .then(mr => (<MergeRequest>mr).labels);

        const labelIndex = lgtmers.indexOf("lgtm")
        labels.splice(labelIndex, 1)

        this.client.MergeRequests
            .edit(rx.project_id, rx.merge_request.iid,
                { labels: labels.join(",") })
    }
}