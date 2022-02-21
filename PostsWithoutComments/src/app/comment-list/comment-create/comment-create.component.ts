import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CommentService } from '../comment.service';
import { Comment } from "../comment.model";

@Component({
  selector: 'app-comment-create',
  templateUrl: './comment-create.component.html',
  styleUrls: ['./comment-create.component.css']
})
export class CommentCreateComponent implements OnInit, OnDestroy {
  @Input() postId: string;
  commentForm: FormGroup;
  editMode = false;
  comment: Comment;
  comments: Comment[];
  editCommentSub: Subscription;
  editModeSub: Subscription;
  index: number;

  constructor(
    private route: ActivatedRoute,
    private commentService: CommentService,
    private router: Router) { }

  ngOnInit(): void {
    this.commentForm = new FormGroup({
      'commentContent': new FormControl(
        null,
        {validators: [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(200)]}
        )
    });
    this.setForm();
    this.editCommentSub = this.commentService.editedComment.subscribe((resultComment) => {
      this.comment = resultComment;
      for(let i = 0; i < this.comments.length; i++) {
        if(this.comments[i].commentId === this.comment.commentId){
          this.index = i;
          console.log(this.index);
        }
      }
      if(this.editMode) {
        this.commentForm.setValue({
          commentContent: this.comment.commentContent
       });
      }
    });
    this.editModeSub = this.commentService.isEditing.subscribe((res => {
      this.editMode = res;
    }));
    this.commentService.getComments(this.postId)
    .then((result) => {
      this.comments = result;
    })
  }

  onSubmit() {
    if (this.editMode) {
      let comment = {
        commentId: this.comment.commentId,
        commentOwnerId: this.comment.commentOwnerId,
        commentContent: this.commentForm.value.commentContent,
        commentOwnerUsername: this.comment.commentOwnerUsername
      }
      console.log(comment);
      this.commentService.updateComment(this.postId, this.index, comment);
    } else {
      this.commentService.postComment(this.postId, this.commentForm.value);
    }
    this.onCancel();
  }

  onCancel() {
    this.router.navigate(['../'], { relativeTo: this.route});
    this.editMode = false;
  }

  onClear() {
    this.commentForm.reset();
    this.editMode = false;
  }

  private setForm() {
    let Content = "";
    this.commentForm.setValue({
       commentContent: Content
    });
  }

  ngOnDestroy(): void {
      this.editCommentSub.unsubscribe();
      this.editModeSub.unsubscribe();
  }
}
