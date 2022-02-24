import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Post } from '../posts/post.model';
import { Comment } from './comment.model';
import { CommentService } from './comment.service';
import { Dislike } from './likes/dislike.model';
import { Like } from './likes/like.model';
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

  onLikeComment(comment, index){
    let userAlreadyDislikedCommentLikeIndex: number;
    if(comment.dislikes !== undefined) {
      userAlreadyDislikedCommentLikeIndex = this.hasDisliked(comment.dislikes);
    }
    let hasLiked = false;
    if(comment.likes !== undefined) {
      for(let i = 0; i < comment.likes.length; i++) {
        if(comment.likes[i].likeOwnerUsername === this.loggedUser ) {
          hasLiked = true;
        }
      }
    }
    if(!hasLiked) {
      let commentUpdated: Comment;
      commentUpdated = this.likeService.commentLike(comment, index);
      this.comments[index] = commentUpdated;
      if(comment.countLikes === undefined) {
        comment.countLikes = 1;
      } else {
        comment.countLikes += 1;
      }
    } else {
      console.log('Cannot like the same comment twice by same user!');
    }
    if(userAlreadyDislikedCommentLikeIndex >= 0) {
      this.likeService.deleteDislike(comment, userAlreadyDislikedCommentLikeIndex);
      comment.countDislikes -= 1;
      this.comments[index] = comment;
    }
    this.commentService.commentsChanged.next(this.comments.slice());
    console.log(this.comments);
  }

  onDislikeComment(comment, index) {
    let userAlreadyLikedCommentLikeIndex: number;
    if(comment.likes !== undefined) {
      userAlreadyLikedCommentLikeIndex = this.hasLiked(comment.likes);
    }
    let hasDisliked = false;
    if(comment.dislikes !== undefined) {
      for(let i = 0; i < comment.dislikes.length; i++) {
        if(comment.dislikes[i].dislikeOwnerUsername === this.loggedUser) {
          hasDisliked = true;
        }
      }
    }
    if(!hasDisliked) {
      let commentUpdated: Comment;
      commentUpdated = this.likeService.commentDislike(comment, index);
      this.comments[index] = commentUpdated;
      if(comment.countDislikes === undefined) {
        comment.countDislikes = 1;
      } else {
        comment.countDislikes += 1;
      }
    } else {
      console.log('Cannot dislike the same comment twice by same user!');
    }
    if(userAlreadyLikedCommentLikeIndex >= 0) {
      this.likeService.deleteLike(comment, userAlreadyLikedCommentLikeIndex);
      comment.countLikes -= 1;
      this.comments[index] = comment;
    }
    this.commentService.commentsChanged.next(this.comments.slice());
    console.log(this.comments);
  }

  hasLiked(likes: Like[]) : number {
    let index: number = -5;
    for(let i = 0; i < likes.length; i++) {
      if(likes[i].likeOwnerUsername === this.loggedUser) {
        index = i;
      }
    }
    return index;
  }

  hasDisliked(dislikes: Dislike[]) : number {
    let index: number = -5;
    for(let i = 0; i < dislikes.length; i++) {
      if(dislikes[i].dislikeOwnerUsername === this.loggedUser) {
        index = i;
      }
    }
    return index;
  }

  ngOnDestroy(): void {
      this.commentSub.unsubscribe();
  }

}
