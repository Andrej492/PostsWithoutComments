import { Injectable } from "@angular/core";
import { API } from "aws-amplify";
import { BehaviorSubject, Subject } from "rxjs";
import { Post } from "./post.model";

@Injectable({providedIn: 'root'})
export class PostService {
  //dataLoadFailed = new Subject<boolean>();
  //postsLoaded = new Subject<Post[]>();
  //postData: Post;
  postsChanged = new Subject<Post[]>();


  isAuthenticated = new BehaviorSubject<boolean>(false);

  private posts: Post[] = [
    new Post(
      'First Post',
      'Post about tasty Schnitzel!',
      'https://upload.wikimedia.org/wikipedia/commons/7/72/Schnitzel.JPG'
    ),
    new Post(
      'Second Post',
      'Post about big burger!',
      'https://upload.wikimedia.org/wikipedia/commons/b/be/Burger_King_Angus_Bacon_%26_Cheese_Steak_Burger.jpg'
    ),
    new Post(
      'Third Post',
      'Post about big burger!',
      'https://upload.wikimedia.org/wikipedia/commons/b/be/Burger_King_Angus_Bacon_%26_Cheese_Steak_Burger.jpg'
    )
  ];

  getPosts() {
    // Call Api
    return this.posts.slice();
  }

  getPost(index: number) {
    // Call APi to get single element
    return this.posts[index];
  }

  addPost(post: Post) {
    // call api to add Post
    this.posts.push(post);
    this.postsChanged.next(this.posts.slice());
  }

  deletePost(index: number) {
    // Call Api.del ...
    this.posts.splice(index, 1);
    this.postsChanged.next(this.posts.slice());
  }

  updatePost(index: number, post: Post) {
    this.posts[index] = post;
    this.postsChanged.next(this.posts.slice());
  }


}
