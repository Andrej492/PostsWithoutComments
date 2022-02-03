import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
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
  post: Post;
  postIdDatabase: string;
  isLoading: boolean;

  constructor(
    private postService: PostService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.postForm = new FormGroup({
      'postTitle': new FormControl(
        null,
        {validators: [Validators.required, Validators.minLength(3)]}
        ),
      'postImagePath': new FormControl(
        null,
        {validators: [Validators.required]}
        ),
      'postContent': new FormControl(
        null,
        {validators: [Validators.required]}
        )
    });
    this.route.params.subscribe((params: Params) => {
      this.id = +params['id'];
      this.editMode = params['id'] != null;
      if(this.editMode) {
        this.isLoading = true;
        this.postService.getPost(this.id)
        .then(postData =>{
          this.isLoading = false;
          this.post = {
            id: postData.id,
            postTitle: postData.postTitle,
            postContent: postData.postContent,
            postImagePath: postData.postImagePath,
            postOwnerId: postData.postOwnerId
          };
          this.postIdDatabase = this.post['id'];
        })
        .catch(err => {
          console.log(err);
        })
        .finally(() => {
          this.setForm();
        });
      } else {
        this.setForm();
      }
    });
  }

  onSubmit() {
    if (this.editMode) {
      this.postService.updatePost(this.id, this.postIdDatabase, this.postForm.value);
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

  private setForm() {
    let Title = "";
    let ImagePath = "";
    let Content = "";
    if (this.editMode) {
      Title = this.post.postTitle;
      Content = this.post.postContent;
      ImagePath = this.post.postImagePath;
    }
    this.postForm.setValue({
       postTitle: Title,
       postContent: Content,
       postImagePath: ImagePath
    });
  }
}
