import { GitProvider, SnippetId } from './GitProvider';
import { Reader } from './Reader';
import * as YAML from 'yaml';
import { Writer } from './Writer';

export type Name = string
export type Weight = number
export type Reviewers = Map<Name, Weight>

export class GitlabReviewers implements Reader<Promise<Reviewers>>, Writer<Reviewers> {

  private gitProvider: GitProvider;
  constructor(gitProvider, path?: string) {
    this.gitProvider = gitProvider;
  }
  async read(): Promise<Reviewers> {
    let reviewers: Reviewers = new Map<Name, Weight>();
    const snippet = this.gitProvider.Snippets.content(await this.resolveId()).then(_ => _)
    const r = YAML.parse(await snippet);
    Object.keys(r).forEach((k) => reviewers.set(k,r[k]))
    return reviewers
  }

  async write(reviewers: Reviewers): Promise<any> {
     return this.gitProvider.Snippets.edit(await this.resolveId(), { content: YAML.stringify(reviewers) })
  }

  private resolveId(): Promise<SnippetId> {
    return this.gitProvider.Snippets.all({ public: false }).then(s => s.find(s => s.title === 'reviewers').id)
  }
}