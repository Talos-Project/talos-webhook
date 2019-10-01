import { RepoBlob } from "./RepoBlob";
import { ProjectId } from "./Project";
import { User } from "./User";

export type SnippetId = number | string
export type Content = string

export interface GitProvider {
    RepositoryFiles: RepositoryFiles
    Snippets: Snippets
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
    content(snippetId: SnippetId): Promise<Content> | any
    all(options?: object): Promise<Snippet[]> | any
    edit(snippetId: SnippetId, options?: object): Promise<Snippet> | any
}