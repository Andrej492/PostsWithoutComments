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
  commentId: number | null = null;
  buttonName: 'Comment' | 'Reply' = 'Comment';
  commentForm: FormGroup;
  editMode = false;
  comment: Comment;
  editCommentSub: Subscription;
  editModeSub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private commentService: CommentService,
    private router: Router) { }

  ngOnInit(): void {
    this.editCommentSub = this.commentService.editedComment.subscribe((resultComment) => {
      this.comment = resultComment;
      console.log(this.comment);
      if(this.editMode) {
        this.commentForm.setValue({
          commentContent: this.comment.commentContent
       });
      }
    });
    this.editModeSub = this.commentService.isEditing.subscribe((res => {
      this.editMode = res;
      console.log(this.editMode);
    }));
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
  }

  onSubmit() {
    if (this.editMode) {
      this.commentService.updateComment(this.postId, this.commentForm.value);
    } else {
      this.commentService.postComment(this.postId, this.commentForm.value);
    }
    this.onCancel();
  }

  onCancel() {
    this.router.navigate(['../'], { relativeTo: this.route});
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
