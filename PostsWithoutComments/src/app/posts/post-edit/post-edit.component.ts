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
  post: Post = new Post( null, "", "", "", "" );
  postIdDatabase: string;
  postTest: Post;

  constructor(
    private postService: PostService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.id = +params['id'];
      this.editMode = params['id'] != null;
      if(this.editMode) {
        this.postService.getPost(this.id)
        .then(post =>{
          this.post = post;
          this.postIdDatabase = this.post['id'];
          return this.post;
        })
        .catch(err => {
          console.log(err);
        })
        .finally(() => {
          this.initForm();
        });
      } else {
        this.initForm();
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

  private initForm() {
    let Title = '';
    let ImagePath = '';
    let Content = '';

    if (this.editMode) {
      Title = this.post.postTitle;
      ImagePath = this.post.postImagePath;
      Content = this.post.postContent;
    }

    this.postForm = new FormGroup({
      'postTitle': new FormControl(Title, Validators.required),
      'postImagePath': new FormControl(ImagePath, Validators.required),
      'postContent': new FormControl(Content)
    });
  }
}
