import { Gitlab } from 'gitlab'
import { GitlabUsersDecorator } from './GitlabUsersDecorator';
import { GitProvider } from './GitProvider';
import { MergeRequestDecorator } from './MergeRequestDecorator';

export class GitlabAPIDecorator implements GitProvider {

    MergeRequests: import("./GitProvider").MergeRequests;
    RepositoryFiles: import("./GitProvider").RepositoryFiles;
    Snippets: import("./GitProvider").Snippets;
    Users: import("./GitProvider").Users;

    private provider;

    constructor(config?) {
        this.provider = new Gitlab(config)
        this.Users = new GitlabUsersDecorator(this.provider.Users,this.provider.Snippets)
        this.MergeRequests = new MergeRequestDecorator(this.provider.MergeRequests, this.provider.Snippets)
    }
}