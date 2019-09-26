import { GitProvider, SnippetId } from './GitProvider';
import { Reader } from './Reader';
import * as YAML from 'yaml';

type Reviewer = string;

export class GitlabReviewers implements Reader<Promise<Reviewer[]>> {

  private gitProvider: GitProvider;

  constructor(gitProvider) {
    this.gitProvider = gitProvider;
  }
  async read(): Promise<Reviewer[]> {
    const snippet = this.gitProvider.Snippets.content(await this.resolveId()).then(_ => _)
    const reviewers: Reviewer[] = YAML.parse(await snippet)
    return reviewers
  }

  private resolveId(): Promise<SnippetId> {
    return this.gitProvider.Snippets.all({ public: false }).then(s => s.find(s => s.title === 'reviewers').id)
  }
}
