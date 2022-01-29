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
  post: Post;
  id: number;
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
      this.post = this.postService.getPost(this.id);
    });

    this.subscriptionAuth = this.postService.isAuthenticated.subscribe((isAuth: boolean) => {
      this.isLoggedIn = isAuth;
    });
  }

  onEditPost() {
    this.router.navigate(['edit'], {relativeTo: this.route});
    //this.router.navigate(['../', this.id, 'edit], {relativeTo: this.route});
  }

  onDeletePost() {
    this.postService.deletePost(this.id);
    this.router.navigate(['/posts']);
  }

  onAddComment() {}

  ngOnDestroy(): void {
    this.subscriptionAuth.unsubscribe();
  }

}
