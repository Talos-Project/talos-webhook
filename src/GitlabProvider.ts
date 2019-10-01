import { Gitlab } from 'gitlab'
import { GitProvider } from './GitProvider';

export class GitlabProvider extends Gitlab implements GitProvider {
    constructor(options?) {
        super(options)
    }
}