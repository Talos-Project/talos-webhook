import * as YAML from 'yaml';
import { readFileSync } from 'fs';
import { Config } from './interfaces/Config';

export class ConfigLoader {

    private config: Config;

    constructor(path: string) {
        this.config = YAML.parse(readFileSync(path, { encoding: "UTF-8"}))
    }

    getConfig() {
        return this.config
    }

}

