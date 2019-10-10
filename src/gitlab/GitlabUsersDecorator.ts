import { Users, UserId, Snippets } from "../interfaces/GitClient";
import { User } from "../interfaces/structs/User";
import * as YAML from 'yaml';
import { Storage } from '../interfaces/structs/Storage';
import { GitlabStorage } from './GitlabStorage';

export type Username = string
export type Weight = number
export type Reviewers = Array<WeightMap>

interface WeightMap {
    name: string
    weight: number
}
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
        try {
            await this.readWM()
            return this.users
        } catch (e) {
            Promise.reject(e)
        }
    }

    async current() {
        try {
            return await this.gitlabUsers.current()
        } catch (e) {
            Promise.reject(e)
        }
    }

    async show(uid: UserId) {
        try {
            await this.readWM()
            return this.users.find(u => u.id === uid)
        } catch (e) {
            Promise.reject(e)
        }
    }
    async update(wm: WeightMap) {
        try {
            await this.readWM()
            this.users.find(u => u.username === wm.name).weight = wm.weight
            this.write()
        } catch (e) {
            Promise.reject(e)
        }
    }

    async increaseWeight(wm: WeightMap) {
        try {
            await this.readWM()
            const u = this.users.find(u => u.username === wm.name)
            wm.weight = isNaN(wm.weight) ? 0 : wm.weight + (isNaN(u.weight) ? 0 : u.weight)
            this.update(wm)
        } catch (e) {
            Promise.reject(e)
        }
    }

    async decreaseWeight(wm: WeightMap) {
        try {
            await this.readWM()
            const u = this.users.find(u => u.username === wm.name)
            wm.weight = isNaN(wm.weight) ? 0 : wm.weight - (isNaN(u.weight) ? 0 : u.weight)
            this.update(wm)
        } catch (e) {
            Promise.reject(e)
        }
    }

    private async readWM() {
        try {
            const users = (await <User[]>this.gitlabUsers.all())
            const snippet = await this.storage.read()
            const payload = YAML.parse(snippet);
            users.forEach(u => u["weight"] = payload[u.username])
            this.users = users
        } catch (e) {
            Promise.reject(e)
        }
    }

    private async write() {
        try {
            await this.readWM()
            const payload = {}
            this.users.forEach(u => payload[u.username] = u.weight)
            this.storage.write(YAML.stringify(payload))
        } catch (e) {
            Promise.reject(e)
        }
    }
}