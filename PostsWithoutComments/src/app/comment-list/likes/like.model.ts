export class Like {
  constructor(
    public likeId: string,
    public likeOwnerUsername: string,
    public likeOwnerId?: string,
    public likeIndex?: number) {}
}
