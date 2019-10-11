import { Gitlab, Pipelines } from 'gitlab'
import { GitlabUsersDecorator } from './GitlabUsersDecorator';
import {  GitClient, Users, Snippets, RepositoryFiles, 
          MergeRequests, MergeRequestNotes, RepositoryOwners
       } from '../interfaces/GitClient';
import { MergeRequestDecorator } from './MergeRequestDecorator';
import { GitlabOwners } from './GitlabOwners';

export class GitlabClient implements GitClient {
    MergeRequestNotes: MergeRequestNotes;
    MergeRequests: MergeRequests;
    Pipelines: Pipelines;
    RepositoryFiles: RepositoryFiles;
    RepositoryOwners: RepositoryOwners;
    Snippets: Snippets;
    Users: Users;

    private client;

    constructor(config?) {
        this.client = new Gitlab(config)
        this.Users = new GitlabUsersDecorator(this.client.Users,this.client.Snippets)
        this.MergeRequests = 
            new MergeRequestDecorator(this.client.MergeRequests, this.client.Snippets, this.Users)

        this.MergeRequestNotes = this.client.MergeRequestNotes
        this.RepositoryFiles = this.client.RepositoryFiles
        this.Pipelines = this.client.Pipelines
        this.Snippets = this.client.Snippets

        this.RepositoryOwners = new GitlabOwners(this)
    }
}