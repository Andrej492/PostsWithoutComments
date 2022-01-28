import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { PostService } from '../posts/post.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isAuthenticated = false;
  authSubscription: Subscription;

  constructor(private postService: PostService) { }

  ngOnInit(): void {
    this.authSubscription = this.postService.isAuthenticated
      .subscribe((authStatus: boolean) => {
        this.isAuthenticated = authStatus;
      });
  }

  ngOnDestroy(): void {
      this.authSubscription.unsubscribe();
  }

}
