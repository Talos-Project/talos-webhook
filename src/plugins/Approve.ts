import { Plugin } from "../interfaces/Plugin"
import { GitClient } from "../interfaces/GitClient";
import { NoteEvent } from "../interfaces/events/NoteEvent";

export class Approve implements Plugin<any, Promise<any>> {

    private client: GitClient

    constructor(client: GitClient) {
        this.client = client
    }

    async handle(rx: NoteEvent): Promise<any> {
        if (rx.object_kind !== "note")
            return Promise.resolve()

        if (!rx.object_attributes.note.includes("/approve"))
            return Promise.resolve()

        if (rx.object_attributes.author_id !== rx.merge_request.assignee_id)
            return Promise.resolve()

        // TODO Handle rebasing
        // https://docs.gitlab.com/ee/api/merge_requests.html#rebase-a-merge-request
        return this.client.MergeRequests.accept(rx.project_id, rx.merge_request.iid)
    }

}