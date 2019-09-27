import { GitProvider, SnippetId } from './GitProvider';
import { Reader } from './Reader';
import * as YAML from 'yaml';
import { Writer } from './Writer';

export type Name = string
export type Weight = number
export type Reviewers = Map<Name, Weight>

export class GitlabReviewers implements Reader<Promise<Reviewers>>, Writer<Reviewers> {

  private gitProvider: GitProvider;

  constructor(gitProvider) {
    this.gitProvider = gitProvider;
  }
  async read(): Promise<Reviewers> {
    const snippet = this.gitProvider.Snippets.content(await this.resolveId()).then(_ => _)
    const reviewers: Reviewers = YAML.parse(await snippet)
    return reviewers
  }

  async write(reviewers: Reviewers): Promise<any> {
     return this.gitProvider.Snippets.edit(await this.resolveId(), { content: YAML.stringify(reviewers) })
  }

  private resolveId(): Promise<SnippetId> {
    return this.gitProvider.Snippets.all({ public: false }).then(s => s.find(s => s.title === 'reviewers').id)
  }
}
