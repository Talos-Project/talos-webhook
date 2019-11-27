export interface Config {
    plugins: string[];
    git: Git;
}

export interface Git {
    client: string;
    host: string;
    token: string;
}
