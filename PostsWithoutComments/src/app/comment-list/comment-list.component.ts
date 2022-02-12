import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { Comment } from './comment.model';
import { CommentService } from './comment.service';

@Component({
  selector: 'app-comment-list',
  templateUrl: './comment-list.component.html',
  styleUrls: ['./comment-list.component.css']
})
export class CommentListComponent implements OnInit, OnDestroy {
  commentSub: Subscription;
  comments: Comment[] = [];
  showButtonReply = false;

  constructor(private commentService: CommentService) {}

  ngOnInit(): void {
    console.log(this.comments);
    this.commentSub = this.commentService.commentsChanged.subscribe( data => {
      console.log(data);
      this.comments = data;
      console.log(this.comments);
    }, err => {
      console.log(err);
    });
    console.log(this.comments);
  }

  toggleComment(close: boolean): void {
    this.showButtonReply = close;
  }

  ngOnDestroy(): void {
      this.commentSub.unsubscribe();
  }

}
