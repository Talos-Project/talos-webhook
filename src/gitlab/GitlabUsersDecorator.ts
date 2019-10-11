import { Users, UserId, Snippets } from "../interfaces/GitClient";
import { User } from "../interfaces/structs/User";
import * as YAML from 'yaml';
import { Storage } from '../interfaces/structs/Storage';
import { GitlabStorage } from './GitlabStorage';

export type Username = string
export type Weight = number

export class GitlabUsersDecorator implements Users {

    private gitlabUsers: Users
    private storage: Storage<Promise<string>, string>
    private users: User[]

    constructor(users: Users, snippets: Snippets, path?: string) {
        this.gitlabUsers = users
        if (typeof path !== 'string') {
            path = "Reviewers.WeightMaps"
        }
        this.storage = new GitlabStorage(snippets, path);
    }

    async all() {
        return this.read()
            .then(() => this.users)
            .catch(e => Promise.reject(e))
    }

    async current() {
        return this.gitlabUsers.current()
    }

    async show(uid: UserId) {
        return this.read()
            .then(() => this.users.find(u => u.id === uid))
            .catch(e => Promise.reject(e))

    }

    async edit(users: User[]) {
        users.forEach(u => {
            const index = this.users.map(lu => lu.id).indexOf(u.id)
            this.users[index] = u
        })
        return this.write()
    }

    private async read() {
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
        const payload = {}
        this.users.forEach(u => payload[u.username] = u.weight)
        return this.storage.write(YAML.stringify(payload))
    }
}