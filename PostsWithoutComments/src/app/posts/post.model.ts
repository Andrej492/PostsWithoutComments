export class Post {
  constructor(
    public id: string,
    public postTitle: string,
    public postContent: string,
    public postImagePath: string,
    public postOwnerId: string
    ) {}
}
