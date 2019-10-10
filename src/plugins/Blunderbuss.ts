import { Plugin } from "../interfaces/Plugin"
import { GitClient } from "../interfaces/GitClient";
import { NoteEvent } from "../interfaces/events/NoteEvent";
import { RepositoryOwners } from "../interfaces/structs/RepositoryOwners";
import { MergeRequest } from "../interfaces/structs/MergeRequest";
import { User } from "../interfaces/structs/User";

export class Blunderbuss implements Plugin<any, Promise<any>> {

    private client: GitClient

    constructor(client: GitClient) {
        this.client = client
    }

    async handle(rx: NoteEvent): Promise<any> {
        if (rx.object_kind !== "note")
            return Promise.resolve()

        if (rx.object_attributes.note.includes("/ready-for-review") ||
            rx.object_attributes.note.includes("/rfr"))
            return this.triggerSelection(rx)
    }

    async triggerSelection(rx: NoteEvent) {
        if (rx.merge_request.assignee_id !== null)
            return Promise.resolve()

        try {
            const { approver, reviewers } = await this.selectParticipants(rx)

            const result = <MergeRequest>await this.client.MergeRequests
                .edit(
                    rx.project_id, rx.merge_request.iid,
                    {
                        assignee_id: approver.id,
                        ext: { reviewers: reviewers.map(r => r.username) }
                    }
                )
            // TODO Chain operations
            this.updateWeights(reviewers, parseInt(result.changes_count))

            return this.replyToThread(result)
        } catch (e) {
            return Promise.reject(e) 
        }
    }

    private async selectParticipants(rx: NoteEvent) {
        try {
            const { approvers, reviewers } = <RepositoryOwners>await this.client
                .RepositoryOwners.show(rx.project_id)

            const candidates = approvers
                .filter(c => c.id !== rx.merge_request.author_id)

            return {
                approver: candidates[Math.floor(Math.random() * candidates.length)],
                reviewers: reviewers
                    .filter(r => r.id !== rx.merge_request.author_id)
                    .sort((a, b) => a.weight - b.weight).slice(0, 2)
            }
        } catch (e) {
            return Promise.reject(e)
        }
    }

    private async updateWeights(revs: User[], weight: number) {
        try {
            revs.forEach(r => 
                r.weight = isNaN(r.weight) ? weight : r.weight + weight
            )
            return this.client.Users.edit(revs)
        } catch (e) {
            return Promise.reject(e)
        }
    }

    private async replyToThread(mr: MergeRequest) {
        const message = [
            "The following table represents the participants of this MR",
            // "", "Name | Role", "---|---",
            "", "Role | Name", "---|---",
            // `@${author.username} | Author`,
            `Author | @${mr.author.username}`,
            // `@${approver.username} | Approver`,
            `Approver | @${mr.assignee.username}`,
            // ...reviewers.map(r => `@${r.username} | Reviewer`), "",
            `Reviewers | @${mr.reviewers.join(", @")}`, "",
            "Reviewers can accept the MR using `/lgtm` command. Approver can merge the MR using `/approve`."
        ]

        return this.client.MergeRequestNotes
            .create(mr.project_id, mr.iid, message.join("\n"))
    }
}