import { User } from "./User";
import { SnippetId } from "./GitClient";

export interface Snippet {
    id: SnippetId;
    title: string;
    file_name: string;
    author: User;
}
