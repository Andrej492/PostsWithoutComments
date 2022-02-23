import { Like } from "./likes/like.model";

export class Comment {
  constructor(
    public commentId: string,
    public commentOwnerId: string,
    public commentContent: string,
    public commentOwnerUsername: string,
    public commentIndex?: number,
    public commentEdited?: boolean,
    public commentCreatedAt?: Date,
    public commentUpdatedAt?: Date,
    public countLikes?: number,
    public likes?: Like[]
    ) {}
}
