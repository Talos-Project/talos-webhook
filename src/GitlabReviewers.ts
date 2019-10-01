import { GitProvider, SnippetId } from './GitProvider';
import * as YAML from 'yaml';

export type Name = string
export type Weight = number
export type Reviewers = Array<WeightMap>

interface WeightMap {
  name: string
  weight: number
}

export class GitlabReviewers {

  private gitProvider: GitProvider;
  private reviewers: Map<Name, Weight>;
  private path: string = "Reviewers.WeightMaps";

  constructor(gitProvider, path?: string) {
    if (typeof path === 'string') {
      this.path = path
    }
    this.gitProvider = gitProvider;
    this.reviewers = new Map<Name, Weight>();
  }

  async getAll() {
    // try to fetch data if empty
    if (this.reviewers.size === 0) {
      await this.read()
    }
    const payload = new Array<WeightMap>()
    this.reviewers.forEach((weight, name) => payload.push({ name, weight }))
    return payload
  }

  async insert(wm: WeightMap) {
    this.update(wm)
  }

  async update(wm: WeightMap) {
    const revs = await this.getAll()
    this.reviewers.set(wm.name, wm.weight)
    this.write()
  }

  async delete(name: Name) {
    this.reviewers.delete(name)
    this.write()
  }

  async increaseWeight(wm: WeightMap) {
    this.reviewers.set(wm.name, this.reviewers.get(wm.name) + wm.weight)
    this.write()
  }

  async decreaseWeight(wm: WeightMap) {
    this.reviewers.set(wm.name, this.reviewers.get(wm.name) - wm.weight)
    this.write()
  }

  private async read() {
    const snippet = this.gitProvider.Snippets.content(await this.resolveId()).then(_ => _)
    const payload = YAML.parse(await snippet);
    Object.keys(payload).forEach((name) => this.reviewers.set(name, payload[name]))
  }

  private async write() {
    // FIXME return success status
    this.gitProvider.Snippets.edit(await this.resolveId(), { content: YAML.stringify(this.reviewers) })
  }

  private resolveId(): Promise<SnippetId> {
    return this.gitProvider.Snippets.all({ public: false }).then(s => s.find(s => s.title === this.path).id)
  }
}