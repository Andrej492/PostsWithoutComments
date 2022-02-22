import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Comment } from './comment.model';
import { CommentService } from './comment.service';

@Component({
  selector: 'app-comment-list',
  templateUrl: './comment-list.component.html',
  styleUrls: ['./comment-list.component.css']
})
export class CommentListComponent implements OnInit, OnDestroy {
  @Input() postById: string;
  commentSub: Subscription;
  comments: Comment[] = [];
  showButtonReply = false;
  commentAuthor: string;
  loggedUser: string;

  constructor(private commentService: CommentService,
    private router: Router) {}

  ngOnInit(): void {
    this.loggedUser = this.commentService.getCommentUsername();
    this.commentService.getComments(this.postById)
    .then((result) => {
      this.comments = result;
    })
    this.commentSub = this.commentService.getCommentsByIdObs().subscribe( data => {
      this.comments = data;
    }, err => {
      console.log(err);
    });
    this.commentService.isEditing.next(false);
  }

  onEditComment(comment: Comment) {
    this.commentService.isEditing.next(true);
    let commentUpdate: Comment = {
      commentId: comment.commentId,
      commentOwnerId: comment.commentOwnerId,
      commentContent: comment.commentContent,
      commentOwnerUsername: comment.commentOwnerUsername
    }
    this.commentService.editedComment.next(commentUpdate);
  }

  onDeleteComment(comment: Comment) {
    let index: number;
    for(let i = 0; i < this.comments.length; i++) {
      if(this.comments[i].commentId === comment.commentId) {
        index = i;
      }
    }
    this.commentService.deleteComment(this.postById, comment, index);
    this.router.navigate(['/posts']);
  }

  toggleComment(close: boolean): void {
    this.showButtonReply = close;
  }

  ngOnDestroy(): void {
      this.commentSub.unsubscribe();
  }

}
