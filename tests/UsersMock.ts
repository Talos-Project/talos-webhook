import { Users, UserId } from "../src/GitProvider";
import { User } from "../src/User";

export class UsersMock implements Users {

    private users: User[]

    constructor(users?: User[]) {
        this.users = users
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