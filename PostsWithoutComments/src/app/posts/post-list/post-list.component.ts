import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Post } from '../post.model';
import { PostService } from '../post.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  postsSub: Subscription;
  isAllowed = false;
  authSub: Subscription;

  constructor(
    private postService: PostService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.postService.getPosts().then(
      (result: Post[]) => {
        this.posts = result;
      }
    );
    this.postsSub = this.postService.postsChanged
    .subscribe(
      (posts: Post[]) => {
        this.posts = posts;
      }
    );
    this.authSub = this.postService.isAuthenticated.subscribe((isAuth: boolean) => {
      this.isAllowed = isAuth;
    });
  }

  getAuthStatus() {
    console.log(this.isAllowed);
  }

  onNewPost() {
    this.router.navigate(['new'], {relativeTo: this.route});
  }

  ngOnDestroy(): void {
    this.postsSub.unsubscribe();
    this.authSub.unsubscribe();
  }

}
