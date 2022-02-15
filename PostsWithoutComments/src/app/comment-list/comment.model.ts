export class Comment {
  constructor(
    public commentId: string,
    public commentOwnerId: string,
    public commentContent: string,
    public commentOwnerUsername: string
    ) {}
}
