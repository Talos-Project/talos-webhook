import { Snippets, Snippet, SnippetId, SnippetVisibility } from "../src/GitProvider";

export class SnippetsMock implements Snippets {

    private snippets: Snippet[]

    constructor(snippets?: Snippet[]) {
        this.snippets = snippets
    }

    all(options?: object) {
        return new Promise((res) => res(this.snippets))
    }
    create(title: string, filename: string, content: string,
        visibility: SnippetVisibility, options?: object): Promise<object> {
        throw new Error("Method not implemented.");
    }
    
    content(snippetId: SnippetId) {
        return new Promise((res) => res('reviewers:\n- john'))
    }

    edit(snippetId: SnippetId, options?: object) {
        throw new Error("Method not implemented.");
    }
    
}