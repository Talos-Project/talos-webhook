import { Users, UserId, Snippets } from "./GitProvider";
import { User } from "./User";
import * as YAML from 'yaml';
import { Storage } from './Storage';
import { GitlabStorage } from './GitlabStorage';

export type Username = string
export type Weight = number
export type Reviewers = Array<WeightMap>

interface WeightMap {
    name: string
    weight: number
}
// TODO Rename to Reviewers
export class GitlabUsersDecorator implements Users {

    private gitlabUsers: Users
    private storage: Storage<Promise<string>, string>;
    private users: User[]

    constructor(u: Users, snippets: Snippets, path?: string) {
        this.users = []
        this.gitlabUsers = u
        if (typeof path !== 'string') {
            path = "Reviewers.WeightMaps"
        }
        this.storage = new GitlabStorage(snippets, path);
    }

    async all() {
        if (this.users.length === 0) {
            await this.readWM()
        }
        return this.users
    }

    async current() {
        return await this.gitlabUsers.current()
    }

    async show(uid: UserId) {
        await this.readWM()
        return this.users.find(u => u.id === uid)
    }
    async update(wm: WeightMap) {
        await this.readWM()
        this.users.find(u => u.username === wm.name).weight = wm.weight
        this.write()
    }

    async increaseWeight(wm: WeightMap) {
        await this.readWM()
        const u = this.users.find(u => u.username === wm.name)
        wm.weight = isNaN(wm.weight) ? 0 : wm.weight + (isNaN(u.weight) ? 0 : u.weight)
        this.update(wm)
    }

    async decreaseWeight(wm: WeightMap) {
        await this.readWM()
        const u = this.users.find(u => u.username === wm.name)
        wm.weight = isNaN(wm.weight) ? 0 : wm.weight - (isNaN(u.weight) ? 0 : u.weight)
        this.update(wm)
    }

    private async readWM() {
        if (this.users.length !== 0)
            return
        const users = (await <User[]>this.gitlabUsers.all())
        const snippet = await this.storage.read()
        const payload = YAML.parse(snippet);
        users.forEach(u => u["weight"] = payload[u.username])
        this.users = users
    }

    private async write() {
        // FIXME return success status
        await this.readWM()
        const payload = {}
        this.users.forEach(u => payload[u.username] = u.weight)
        this.storage.write(YAML.stringify(payload))
    }
}