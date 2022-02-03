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
  isLoading = true;

  constructor(
    private postService: PostService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.postService.getPosts().then(
      (result: Post[]) => {
        console.log(this.isLoading);
        this.posts = result;
        this.isLoading = false;
        console.log(this.isLoading);
      }
    );
    this.postsSub = this.postService.postsChanged
    .subscribe(
      (posts: Post[]) => {
        this.isLoading = true;
        this.posts = posts;
        this.isLoading = false;
      }
    );
    this.authSub = this.postService.isAuthenticated.subscribe((isAuth: boolean) => {
      this.isAllowed = isAuth;
    });
  }

  onNewPost() {
    this.router.navigate(['new'], {relativeTo: this.route});
  }

  ngOnDestroy(): void {
    this.postsSub.unsubscribe();
    this.authSub.unsubscribe();
  }

  // getcurrentauthuser(): Promise<CognitoUser> {
  //   return Auth.currentAuthenticatedUser();
  // }
  // logout() {
  //   this.getcurrentauthuser().then(
  //     (user: CognitoUser) => {
  //       user.signOut();
  //     }
  //   )
  // }

}
