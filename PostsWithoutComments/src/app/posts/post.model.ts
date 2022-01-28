export class Post {
  constructor(
    public id: string,
    public postOwnerId: string,
    public postOwnerUsername: string,
    public postTitle: string,
    public postContent: string,
    public postImagePath: string
    ) {}
}
