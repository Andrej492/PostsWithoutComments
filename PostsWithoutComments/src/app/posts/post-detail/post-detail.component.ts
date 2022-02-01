import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Post } from '../post.model';
import { PostService } from '../post.service';

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css']
})
export class PostDetailComponent implements OnInit, OnDestroy {
  post: Post = new Post( null, "", "", "", "");
  // Important to set new Post, since it first renders the html file, then not to be empty..
  id: number;
  postIdDatabase: string;
  isLoggedIn = false;
  subscriptionAuth: Subscription;

  constructor(
    private postService: PostService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.id = +params['id'];
      this.postService.getPost(this.id)
      .then(post =>{
        this.post = post;
        this.postIdDatabase = this.post['id'];
        console.log(this.post);
        console.log(this.postIdDatabase);
      })
      .catch(err => {
        console.log(err);
      })
    });
    this.subscriptionAuth = this.postService.isAuthenticated.subscribe((isAuth: boolean) => {
      this.isLoggedIn = isAuth;
    });
  }

  onEditPost() {
    this.router.navigate(['edit'], {relativeTo: this.route});
  }

  onDeletePost() {
    console.log(this.id);
    this.postService.deletePost(this.postIdDatabase, this.id);
    this.router.navigate(['/posts']);
  }
  onAddComment() {}

  ngOnDestroy(): void {
    this.subscriptionAuth.unsubscribe();
  }

}
