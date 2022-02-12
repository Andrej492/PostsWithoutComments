import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Auth } from 'aws-amplify';
import { Subscription } from 'rxjs';
import { CommentService } from 'src/app/comment-list/comment.service';
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
  postId: string;
  isLoggedIn = false;
  subscriptionAuth: Subscription;
  postOwnerId: string;
  isAuthorOfPost: boolean;
  isLoading = true;
  comments: Comment[] = [];

  constructor(
    private postService: PostService,
    private route: ActivatedRoute,
    private router: Router,
    private commentService: CommentService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.id = +params['id'];
      this.postService.getPost(this.id)
      .then(post =>{
        this.post = post;
        this.postId = this.post['id'];
        this.postOwnerId = this.post['postOwnerId'];
        this.isLoading = false;
      })
      .catch(err => {
        console.log(err);
      })
      .finally(() => {
        let currentCognitoUserId: string;
        Auth.currentAuthenticatedUser({
          bypassCache: false
        })
        .then(user => {
          currentCognitoUserId = user.attributes.sub;
        })
        .catch(err => {
          console.log(err);
        })
        .finally(() => {
          if(currentCognitoUserId === this.postOwnerId) {
            this.isAuthorOfPost = true;
          } else {
            this.isAuthorOfPost = false;
          }
          this.loadComments(this.postId);
        });
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
    this.postService.deletePost(this.postId, this.id);
    this.router.navigate(['/posts']);
  }

  loadComments(postId: string): void {
    this.commentService.getComments(postId)
    .then((result) => {
      this.comments = result;
      console.log(result);
    })
    .catch(err => {
      console.log(err);
    });
  }
  ngOnDestroy(): void {
    this.subscriptionAuth.unsubscribe();
  }

}
