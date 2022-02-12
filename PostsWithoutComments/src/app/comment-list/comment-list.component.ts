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
  @Input() id: number;
  @Input() commentsList: Comment[] = [];
  commentSub: Subscription;
  commented = new Subject<number>();
  comments: Comment[];
  showButtonReply = false;
  currentComment: Comment | null = null;

  constructor(
    private commentService: CommentService
  ) {}

  ngOnInit(): void {
    this.commentSub = this.commentService.commentsChanged.subscribe((result: Comment[])=> {
      this.comments = result;
      console.log(this.comments);
      console.log(this.commentsList);
    })
    console.log(this.comments);
    console.log(this.commentsList);
  }

  toggleComment(close: boolean): void {
    this.showButtonReply = close;
  }

  ngOnDestroy(): void {
      this.commentSub.unsubscribe();
  }

}
