import { Gitlab } from 'gitlab'
import { GitlabUsersDecorator } from './GitlabUsersDecorator';
import {  GitClient, Users, Snippets, RepositoryFiles, MergeRequests, MergeRequestNotes } from '../interfaces/GitClient';
import { MergeRequestDecorator } from './MergeRequestDecorator';

export class GitlabClient implements GitClient {
    MergeRequestNotes: MergeRequestNotes;
    MergeRequests: MergeRequests;
    RepositoryFiles: RepositoryFiles;
    Snippets: Snippets;
    Users: Users;

    private client;

    constructor(config?) {
        this.client = new Gitlab(config)
        this.Users = new GitlabUsersDecorator(this.client.Users,this.client.Snippets)
        this.MergeRequests = new MergeRequestDecorator(this.client.MergeRequests, this.client.Snippets, this.Users)
        this.MergeRequestNotes = this.client.MergeRequestNotes
        this.Snippets = this.client.Snippets
        this.RepositoryFiles = this.client.RepositoryFiles
    }
}