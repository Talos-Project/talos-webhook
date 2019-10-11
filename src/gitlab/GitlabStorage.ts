import { Snippets, SnippetId } from '../interfaces/GitClient';
import { Storage } from '../interfaces/structs/Storage'
import { Snippet } from "../interfaces/structs/Snippet";

export class GitlabStorage implements Storage<Promise<string>, string> {

    private path: string;
    private snippets: Snippets;

    constructor(snippets: Snippets, path: string) {
        this.snippets = snippets
        this.path = path
    }

    async read(): Promise<string> {
        try {
            const id = await this.resolveId();

            if (id === null)
                return ""

            return this.snippets.content(id)
            
        } catch(e) {
            return Promise.reject(e)
        }
    }

    async write(content: string) {
        try {
            const id = await this.resolveId()
            if (id !== null)
                return this.snippets.edit(id, { content })
            else
                return this.snippets.create(this.path, "", content, "private")
        } catch (e) {
            return Promise.reject(e)
        }
    }

    private async resolveId(): Promise<SnippetId> {
        try {
            const snippet = <Snippet>await this.snippets
                .all({ public: false })
                .then(s => s.find(s => s.title === this.path))

            if (typeof snippet === 'undefined')
                return null
            
            return snippet.id

        } catch (e) {
            return Promise.reject(e)
        }
    }
}