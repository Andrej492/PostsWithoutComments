import { ActivatedRoute, Router } from '@angular/router';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CommentService } from '../comment.service';

@Component({
  selector: 'app-comment-create',
  templateUrl: './comment-create.component.html',
  styleUrls: ['./comment-create.component.css']
})
export class CommentCreateComponent implements OnInit {
  @Input() postId: string;
  @Input() commentId: number | null = null;
  @Input() buttonName: 'Comment' | 'Reply' = 'Comment';
  commentForm: FormGroup;
  editMode = false;
  comment: Comment;

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
  }

  onSubmit() {
    if (this.editMode) {
      //this.commentService.updatePost(this.id, this.postIdDatabase, this.postForm.value);
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
    if (this.editMode) {
      //Content = this.comment.commentContent;
    }
    this.commentForm.setValue({
       commentContent: Content
    });
  }

}
