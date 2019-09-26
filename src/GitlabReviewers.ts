import { GitProvider, SnippetId } from './GitProvider';
import { Reader } from './Reader';
import * as YAML from 'yaml';
import { Reviewer } from './Reviewer';
import { Writer } from './Writer';

export class GitlabReviewers implements Reader<Promise<Reviewer[]>>, Writer<Reviewer[]> {

  private gitProvider: GitProvider;

  constructor(gitProvider) {
    this.gitProvider = gitProvider;
  }
  async read(): Promise<Reviewer[]> {
    const snippet = this.gitProvider.Snippets.content(await this.resolveId()).then(_ => _)
    const reviewers: Reviewer[] = YAML.parse(await snippet)
    return reviewers
  }

  async write(reviewers: Reviewer[]): Promise<any> {
     return this.gitProvider.Snippets.edit(await this.resolveId(), { content: YAML.stringify(reviewers) })
  }

  private resolveId(): Promise<SnippetId> {
    return this.gitProvider.Snippets.all({ public: false }).then(s => s.find(s => s.title === 'reviewers').id)
  }
}
