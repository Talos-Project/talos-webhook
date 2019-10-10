import { Plugin } from "../interfaces/Plugin"
import { GitClient } from "../interfaces/GitClient";
import { NoteEvent } from "../interfaces/events/NoteEvent";
import { RepositoryOwners } from "../interfaces/structs/RepositoryOwners";
import { MergeRequest } from "../interfaces/structs/MergeRequest";
import { User } from "../interfaces/structs/User";
import { MergeRequestEvent } from "../interfaces/events/MergeRequestEvent";

export class Blunderbuss implements Plugin<any, Promise<any>> {

    private client: GitClient

    constructor(client: GitClient) {
        this.client = client
    }

    async handle(rx: any): Promise<any> {

        if (rx.object_kind === "merge_request")
            return this.handleMergeRequestEvent(rx)

        if (rx.object_kind === "note")
            return this.handleNoteEvent(rx)

        return Promise.resolve()

    }

    private async handleMergeRequestEvent(rx: MergeRequestEvent) {
        const action = rx.object_attributes.action

        // TODO Notify participants about the state of MR
        if (action !== "close" && action !== "merge")
            return Promise.resolve()

        const { changes_count, reviewers } = <MergeRequest>await this.client
            .MergeRequests.show(rx.project.id, rx.object_attributes.iid)

        this.updateWeights(reviewers, -parseInt(changes_count))

        return this.client.MergeRequests
            .edit(
                rx.project.id, 
                rx.object_attributes.iid, 
                { 
                    assignee_id: null, 
                    ext: { reviewers: [], lgtmers: [] } 
                })
    }

    private async handleNoteEvent(rx: NoteEvent) {
        const note = rx.object_attributes.note;

        if (!note.includes("/ready-for-review") && !note.includes("/rfr"))
            return Promise.resolve()

        if (rx.merge_request.assignee_id !== null)
            return Promise.resolve()

        try {
            const { approver, reviewers } = await this.selectParticipants(rx)

            const result = <MergeRequest>await this.client.MergeRequests
                .edit(
                    rx.project_id, rx.merge_request.iid,
                    {
                        assignee_id: approver.id,
                        title: rx.merge_request.title.replace('WIP: ', ''),
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
            "", "Role | Name", "---|---",
            `Author | @${mr.author.username}`,
            `Approver | @${mr.assignee.username}`,
            `Reviewers | @${mr.reviewers.join(", @")}`, "",
            "Reviewers can accept the MR using `/lgtm` command. Approver can merge the MR using `/approve`."
        ]

        return this.client.MergeRequestNotes
            .create(mr.project_id, mr.iid, message.join("\n"))
    }
}