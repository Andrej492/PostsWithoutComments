import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Post } from '../posts/post.model';
import { Comment } from './comment.model';
import { CommentService } from './comment.service';
import { LikeService } from './likes/likes.service';

@Component({
  selector: 'app-comment-list',
  templateUrl: './comment-list.component.html',
  styleUrls: ['./comment-list.component.css']
})
export class CommentListComponent implements OnInit, OnDestroy {
  @Input() postById: string;
  @Input() postInput: Post;
  commentSub: Subscription;
  comments: Comment[] = [];
  showButtonReply = false;
  loggedUser: string;
  postAuthor: string;

  constructor(
    private commentService: CommentService,
    private likeService: LikeService,
    private router: Router) {}

  ngOnInit(): void {
    this.postAuthor = this.postInput.postOwnerUsername;
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

  onCommentLike(comment, i){
    let hasLiked = false;
    if(comment.likes !== undefined) {
      for(let i = 0; i < comment.likes.length; i++) {
        if(comment.likes[i].likeOwnerUsername === this.loggedUser) {
          hasLiked = true;
        }
      }
    }
    if(hasLiked){
      console.log('You have already liked this comment!');
    }
    if(!hasLiked) {
      comment.likes = this.likeService.commentLike(comment);
    this.comments[i] = comment;
    if(comment.countLikes === undefined) {
      comment.countLikes = 1;
    } else {
      comment.countLikes += 1;
    }
    this.commentService.commentsChanged.next(this.comments.slice());
    }
  }

  ngOnDestroy(): void {
      this.commentSub.unsubscribe();
  }

}
