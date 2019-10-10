import { Plugin } from "../interfaces/Plugin"
import { GitClient } from "../interfaces/GitClient";
import { NoteEvent } from "../interfaces/events/NoteEvent";
import { RepositoryOwners } from "../interfaces/structs/RepositoryOwners";

export class Blunderbuss implements Plugin<any, Promise<any>> {

    private client: GitClient
    private message: string

    constructor(client: GitClient) {
        this.client = client
    }

    async handle(rx: NoteEvent): Promise<any> {
        if (rx.object_kind !== "note")
            return Promise.resolve()

        if (rx.object_attributes.note.includes("/ready-for-review") ||
            rx.object_attributes.note.includes("/rfr"))
            return this.selectParticipants(rx)
    }

    async selectParticipants(rx: NoteEvent) {
        if (rx.merge_request.assignee_id !== null)
            return Promise.resolve()

        try {
            const approver = await this.selectApprover(rx)
            const reviewers = await this.selectReviewers(rx)

            this.client.MergeRequestNotes
                .create(rx.project_id, rx.merge_request.iid, this.message)

            return this.client.MergeRequests
                .edit(
                    rx.project_id, rx.merge_request.iid,
                    {
                        assignee_id: approver.id,
                        ext: { reviewers: reviewers.map(r => r.username) }
                    }
                )
        } catch (e) {
            return Promise.reject(e)
        }
    }

    private async selectApprover(rx: NoteEvent) {
        try {
            const { approvers } = <RepositoryOwners>await this.client
                .RepositoryOwners.show(rx.project_id)

            const candidates = approvers
                .filter(c => c.id !== rx.merge_request.author_id)

            return candidates[Math.floor(Math.random() * candidates.length)]

        } catch (e) {
            return Promise.reject(e)
        }
    }

    private async selectReviewers(rx: NoteEvent) {
        try {
            const { reviewers } = <RepositoryOwners>await this.client
                .RepositoryOwners.show(rx.project_id)

            return reviewers
                .filter(r => r.id !== rx.merge_request.author_id)
                .sort((a, b) => a.weight - b.weight).slice(0, 2)

        } catch (e) {
            Promise.reject(e)
        }
    }

}