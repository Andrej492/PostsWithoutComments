export class Dislike {
  constructor(
    public dislikeId: string,
    public dislikeOwnerUsername: string,
    public dislikeOwnerId?: string,
    public dislikeIndex?: number) {}
  }
