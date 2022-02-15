import { Component, Input, OnDestroy, OnInit } from '@angular/core';
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

  constructor(private commentService: CommentService) {}

  ngOnInit(): void {
    this.commentService.getComments(this.postById)
    .then((result) => {
      this.comments = result;
    })
    this.commentSub = this.commentService.getCommentsByIdObs().subscribe( data => {
      console.log(data);
      //this.comments = data;
    }, err => {
      console.log(err);
    });
  }

  toggleComment(close: boolean): void {
    this.showButtonReply = close;
  }

  ngOnDestroy(): void {
      this.commentSub.unsubscribe();
  }

}
