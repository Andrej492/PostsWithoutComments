import { Injectable, OnInit } from "@angular/core";
import { Subject } from "rxjs";
import { CommentService } from "../comment.service";
import { Dislike } from "./dislike.model";
import { Like } from "./like.model";
import { Comment } from "../comment.model"

@Injectable({providedIn: 'root'})
export class LikeService implements OnInit {

  private likes: Like[] = [];
  private dislikes: Dislike[] = [];
  public likesChanged: Subject<Like[]> = new Subject<Like[]>();
  public dislikesChanged: Subject<Dislike[]> = new Subject<Dislike[]>();
  commentGet: Comment;

  constructor(private commentService: CommentService) {}

  ngOnInit(): void {}

  getLikes(commentId: string) {
    return this.likes.slice();
  }

  commentLike(comment: Comment, index: number) : Comment {
    let likeNew = new Like(this.generate(), this.commentService.getCommentUsername());
    if(comment.likes === undefined) {
      let likesToInit: Like[] = [];
      comment.likes = likesToInit;
      comment.likes.push(likeNew);
    } else {
      comment.likes.push(likeNew);
    }
    return comment;
  }

  commentDislike(comment: Comment, index: number) : Comment {
    let dislikeNew = new Dislike(this.generate(), this.commentService.getCommentUsername());
    if(comment.dislikes === undefined) {
      let dislikesToInit: Dislike[] = [];
      comment.dislikes = dislikesToInit;
      comment.dislikes.push(dislikeNew);
    } else {
      comment.dislikes.push(dislikeNew);
    }
    return comment;
  }


  deleteLike(comment: Comment, index: number) : Comment {
    let getComment = comment;
    getComment.likes.splice(index, 1);
    comment = getComment;
    return comment;
  }

  deleteDislike(comment: Comment, index: number) : Comment {
    let getComment = comment;
    getComment.dislikes.splice(index, 1);
    comment = getComment;
    return comment;
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
