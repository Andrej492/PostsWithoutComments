import { Component, OnInit } from '@angular/core';
import { Auth } from 'aws-amplify';
import { PostService } from './post.service';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.css']
})
export class PostsComponent implements OnInit {

  constructor(private postService: PostService) { }

  ngOnInit(): void {
    Auth.currentAuthenticatedUser({
      bypassCache: false
    })
    .then((user) => {
      this.postService.authUsername.next(user.username);
      this.postService.isAuthenticated.next(true);
    })
    .catch(() => {
      this.postService.isAuthenticated.next(false);
      this.postService.authUsername.next('not Logged');
    });
  }

}
