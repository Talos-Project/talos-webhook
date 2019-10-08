import { Storage } from '../interfaces/Storage'
import { Snippets, SnippetId } from '../interfaces/GitClient';
import { Snippet } from "../interfaces/Snippet";

export class GitlabStorage implements Storage<Promise<string>,string> {

    private path: string;
    private snippets: Snippets;

    constructor(snippets: Snippets, path: string) {
        this.snippets = snippets
        this.path = path
    }

    async read(): Promise<string> {
        return this.snippets.content(await this.resolveId()).then(_ => _)
    }

    async write(content: string) {
        const id = await this.resolveId()
        if (id !== null)
            return this.snippets.edit(id, { content })
        else 
            return this.snippets.create(this.path, "", content, "private")
    }

    private async resolveId(): Promise<SnippetId> {
        const snippet = <Snippet>await this.snippets.all({ public: false }).then(s => s.find(s => s.title === this.path))
        if (typeof snippet === 'undefined')
            return null
        return snippet.id
    }
}