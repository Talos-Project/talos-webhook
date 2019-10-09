import { ProjectId } from "./Project";
import { User } from "./User";

export interface RepositoryOwners {
    project_id: ProjectId
    approvers: User[]
    reviewers: User[]
}