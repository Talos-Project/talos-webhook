import { GitProvider, RepositoryFiles } from "./GitProvider";
import { ProjectId } from "./Project";
import { Approvers, Reviewers } from "./Owners";
import { GitlabUsersDecorator } from "./GitlabUsersDecorator";
import { MergeRequestEventAttributes } from "./MergeRequestEventAttributes";

export class Blunderbuss {
    private mrEvt: MergeRequestEventAttributes;
    private approversCandidates: Approvers
    private reviewersCandidates: Reviewers
    private users: GitlabUsersDecorator

    constructor(users: GitlabUsersDecorator, projectId: ProjectId, mrEvt: MergeRequestEventAttributes, files: RepositoryFiles) {
        this.users = users
        this.mrEvt = mrEvt
        this.approversCandidates = new Approvers(files, projectId)
        this.reviewersCandidates = new Reviewers(files, projectId)
    }

    async selectApprover() {
        const users = await this.users.all()
        const eliminatedCandidate = users.find(u => u.id === this.mrEvt.author_id)
        const candidates = (await this.approversCandidates.get()).filter(c => c !== eliminatedCandidate.username)
        return users.find(u => u.username === candidates[Math.floor(Math.random() * candidates.length)])
    }

    async selectReviewers() {
        const candidates = await this.reviewersCandidates.get()
        return (await this.users.all())
            .filter(u => u.id !== this.mrEvt.author_id)
            .filter(u => candidates.includes(u.username))
            .sort((a, b) => a.weight - b.weight).slice(0, 2)
    }
}