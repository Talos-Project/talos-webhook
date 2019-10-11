import { GitClient } from "../src/interfaces/GitClient";

export class GitClientMock implements GitClient {
    MergeRequests: import("../src/interfaces/GitClient").MergeRequests;
    MergeRequestNotes: import("../src/interfaces/GitClient").MergeRequestNotes;
    Pipelines: import("../src/interfaces/GitClient").Pipelines;
    RepositoryFiles: import("../src/interfaces/GitClient").RepositoryFiles;
    RepositoryOwners: import("../src/interfaces/GitClient").RepositoryOwners;
    Snippets: import("../src/interfaces/GitClient").Snippets;
    Users: import("../src/interfaces/GitClient").Users;
}