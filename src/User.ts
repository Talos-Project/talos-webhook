export interface User {
  id: number;
  name: string;
  username: string;
  avatar_url: string;
}

export interface Users {
  current(): Promise<User>
  all(): Promise<User[]>
}