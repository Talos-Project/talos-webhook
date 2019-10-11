import { Users, UserId } from "../src/interfaces/GitClient";
import { User } from "../src/interfaces/structs/User";

export class UsersMock implements Users {

    private users: User[]

    constructor(users?: User[]) {
        this.users = users
    }
    edit(users: User[]) {
        throw new Error("Method not implemented.");
    }

    all() {
        return new Promise(resolve => resolve(this.users))
    }

    current() {
        return new Promise(resolve => resolve(this.users[0]))
    }

    show(userId: UserId) {
        return new Promise(resolve => resolve(this.users.find(u => userId === u.id)))
    }


}