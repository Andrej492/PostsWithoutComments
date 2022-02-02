import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CognitoUser } from '@aws-amplify/auth';
import { Auth } from 'aws-amplify';
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
    if(this.isAllowed) {
      Auth.currentSession()
      .then(session => {
        let str: string = session.getIdToken().getJwtToken();
        console.log(str);
      })
      .catch(err => {
        console.log(err);
      });
    }
    if(this.isAllowed) {
      Auth.currentSession()
      .then(session => {
        let str: string = session.getAccessToken().getJwtToken();
        console.log(str);
      })
      .catch(err => {
        console.log(err);
      });
    }
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

  onNewPost() {
    this.router.navigate(['new'], {relativeTo: this.route});
  }

  ngOnDestroy(): void {
    this.postsSub.unsubscribe();
    this.authSub.unsubscribe();
  }

}
