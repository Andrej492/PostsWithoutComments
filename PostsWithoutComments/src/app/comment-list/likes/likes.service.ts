import { Injectable, OnInit } from "@angular/core";
import { Subject } from "rxjs";
import { CommentService } from "../comment.service";
import { Like } from "./like.model";

@Injectable({providedIn: 'root'})
export class LikeService implements OnInit {

  private likes: Like[] = [];
  public likesChanged: Subject<Like[]> = new Subject<Like[]>();
  like: Like;

  constructor(private commentService: CommentService) {}

  ngOnInit(): void {}

  getLikes(commentId: string) {
    return this.likes.slice();
  }

  commentLike(comment: Comment) : Like[] {
    console.log(comment);
    let likeNew = new Like(this.generate(), this.commentService.getCommentUsername());
    console.log(likeNew);
    this.likes.push(likeNew);
    this.likesChanged.next(this.likes.slice());
    return this.likes;
  }

  public ids: string[] = [];

  public generate(): string {
    let isUnique = false;
    let tempId = '';
    while (!isUnique) {
      tempId = this.generator();
      if (!this.idExists(tempId)) {
        isUnique = true;
        this.ids.push(tempId);
      }
    }
    return tempId;
  }
  public remove(id: string): void {
    const index = this.ids.indexOf(id);
    this.ids.splice(index, 1);
  }
  private generator(): string {
    const isString = `${this.S4()}${this.S4()}-${this.S4()}-${this.S4()}-${this.S4()}-${this.S4()}${this.S4()}${this.S4()}`;
    return isString;
  }
  private idExists(id: string): boolean {
    return this.ids.includes(id);
  }
  private S4(): string {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }
}
