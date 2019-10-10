import { RepoBlob } from "./structs/RepoBlob";
import { ProjectId } from "./structs/Project";
import { User } from "./structs/User";
import { MergeRequestId } from "./structs/MergeRequest"
import { Snippet } from "./structs/Snippet";

export type Content = string
export type SnippetId = number | string
export type SnippetVisibility = 'private' | 'public' | 'internal';
export type UserId = number | string

export interface GitClient {
    MergeRequests: MergeRequests
    MergeRequestNotes: MergeRequestNotes
    Pipelines: Pipelines
    RepositoryFiles: RepositoryFiles
    RepositoryOwners: RepositoryOwners
    Snippets: Snippets
    Users: Users
}

export interface MergeRequests {
    edit(project_id: ProjectId, mrId: MergeRequestId, options: object): Promise<object>
    show(project_id: ProjectId, mrId: MergeRequestId, options?: object): Promise<object>
}

export interface MergeRequestNotes {
    create(project_id: ProjectId, mrId: MergeRequestId, body: string, options?: object): Promise<object>
}

export interface Pipelines {
    create(project_id: ProjectId, mrId: MergeRequestId, options?: object): Promise<object>
}

export interface RepositoryOwners {
    show(project_id: ProjectId, options?: object): Promise<object>
}

export interface RepositoryFiles {
    show(project_id: ProjectId, filename: string, branch: string): Promise<RepoBlob> | any
}

export interface Snippets {
    all(options?: object): Promise<Snippet[]> | any
    create(title: string, filename: string, content: string, visibility: SnippetVisibility, options?: object): Promise<object>
    content(snippetId: SnippetId): Promise<Content> | any
    edit(snippetId: SnippetId, options?: object): Promise<Snippet> | any
}

export interface Users {
    all(): Promise<User[]> | any
    current(): Promise<User> | any
    edit(users: User[]): Promise<User> | any
    show(userId: UserId): Promise<User> | any
}