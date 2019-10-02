import { RepoBlob } from "./RepoBlob";
import { ProjectId } from "./Project";
import { User } from "./User";
import { MergeRequestId } from "./MergeRequest"

export type Content = string
export type SnippetId = number | string
export type SnippetVisibility = 'private' | 'public' | 'internal';
export type UserId = number | string

export interface GitProvider {
    MergeRequests: MergeRequests;
    RepositoryFiles: RepositoryFiles
    Snippets: Snippets
    Users: Users
}

export interface MergeRequests {
    edit(project_id: ProjectId, mrId: MergeRequestId, options?: object): Promise<object>
}

export interface Snippet {
    id: SnippetId
    title: string
    file_name: string
    author: User
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
    show(userId: UserId): Promise<User> | any
}