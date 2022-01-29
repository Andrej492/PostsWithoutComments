import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Post } from '../post.model';
import { PostService } from '../post.service';

@Component({
  selector: 'app-post-edit',
  templateUrl: './post-edit.component.html',
  styleUrls: ['./post-edit.component.css']
})
export class PostEditComponent implements OnInit {
  id: number;
  editMode = false;
  postForm: FormGroup;

  constructor(
    private postService: PostService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.id = +params['id'];
      this.editMode = params['id'] != null;
      this.initForm();
    });
  }

  onSubmit() {
    if (this.editMode) {
      this.postService.updatePost(this.id, this.postForm.value);
    } else {
      this.postService.addPost(this.postForm.value);
    }
    this.onCancel();
  }

  onCancel() {
    this.router.navigate(['../'], { relativeTo: this.route});
  }

  onClear() {
    this.postForm.reset();
    this.editMode = false;
  }

  ngOnDestroy(): void {
      //this.editPostSubscription.unsubscribe();
  }

  private initForm() {
    let Title = '';
    let ImagePath = '';
    let Content = '';

    if (this.editMode) {
      const post: Post = this.postService.getPost(this.id);
      Title = post.postTitle;
      ImagePath = post.postImagePath;
      Content = post.postContent;
    }
    this.postForm = new FormGroup({
      'postTitle': new FormControl(Title, Validators.required),
      'postImagePath': new FormControl(ImagePath, Validators.required),
      'postContent': new FormControl(Content)
    });
  }

}
