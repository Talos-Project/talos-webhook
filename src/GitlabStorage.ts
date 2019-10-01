import { Storage } from './Storage'
import { GitProvider, SnippetId } from './GitProvider';

export class GitlabStorage implements Storage<Promise<string>,string> {

    private path: string;
    private gitProvider: GitProvider;

    constructor(provider: GitProvider, path: string) {
        this.gitProvider = provider
        this.path = path
    }

    async read(): Promise<string> {
        return this.gitProvider.Snippets.content(await this.resolveId()).then(_ => _)
    }

    async write(content: string) {
        this.gitProvider.Snippets.edit(await this.resolveId(), { content })
    }

    private resolveId(): Promise<SnippetId> {
        return this.gitProvider.Snippets.all({ public: false }).then(s => s.find(s => s.title === this.path).id)
    }

}