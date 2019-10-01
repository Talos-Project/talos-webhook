import * as YAML from 'yaml';
import { Storage } from './Storage';
import { GitlabStorage } from './GitlabStorage';

export type Name = string
export type Weight = number
export type Reviewers = Array<WeightMap>

interface WeightMap {
  name: string
  weight: number
}

export class GitlabReviewers {

  private reviewers: Map<Name, Weight>;
  private path: string = "Reviewers.WeightMaps";
  private storage: Storage<Promise<string>, string>;

  constructor(provider, path?: string) {
    if (typeof path === 'string') {
      this.path = path
    }
    this.storage = new GitlabStorage(provider,this.path);
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
    const snippet = await this.storage.read()
    const payload = YAML.parse(snippet);
    Object.keys(payload).forEach((name) => this.reviewers.set(name, payload[name]))
  }

  private async write() {
    // FIXME return success status
    this.storage.write(YAML.stringify(this.reviewers))
  }
}