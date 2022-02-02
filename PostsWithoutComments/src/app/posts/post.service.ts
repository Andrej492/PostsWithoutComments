import { Injectable, OnInit } from "@angular/core";
import { API, Auth } from "aws-amplify";
import { BehaviorSubject, Subject } from "rxjs";
import { Post } from "./post.model";

@Injectable({providedIn: 'root'})
export class PostService implements OnInit {
  private posts: Post[] = [];
  postsChanged = new Subject<Post[]>();
  dataEdited = new BehaviorSubject<boolean>(false);
  dataIsLoading = new BehaviorSubject<boolean>(false);
  dataLoaded = new Subject<Post[]>();
  dataLoadFailed = new Subject<boolean>();
  userData: Post;
  post: Post;
  postGet: Post;
  isAuthenticated = new BehaviorSubject<boolean>(false);
  cognitoUserId: string = "";

  ngOnInit(): void {

  }

  getCurrentAuthenticatedUser(): string {
    Auth.currentAuthenticatedUser({
      bypassCache: false  // Optional, By default is false. If set to true, this call will send a request to Cognito to get the latest user data
    })
    .then(user => {
      this.cognitoUserId = user.attributes.sub;
    })
    .catch(err => console.log(err));
    return this.cognitoUserId;
  }

  getCurrentUserId(userId: string | undefined): string {
    let cognitoId: string | undefined;

    return cognitoId;
  }

  getPosts(): Promise<Post[]> {
    return API.get('postsRestApi', '/posts', {})
    .then(result => {
      this.posts = JSON.parse(result.body);
      return this.posts;
    })
    .catch(err => {
      console.log(err);
      return err;
    });
  }

  getPost(index: number): Promise<Post> {
    const postById = this.posts[index];
    const postEditDatabaseId = postById['id'];
    return API.get('postsRestApi', `/posts/${postEditDatabaseId}`, {})
    .then(result => {
      this.post = JSON.parse(result.body);
      return this.post;
    })
    .catch(err => {
      console.log(err);
      return err;
    })
  }

  addPost(post: Post) {
    this.dataLoadFailed.next(false);
    this.dataIsLoading.next(true);
    this.dataEdited.next(false);
    this.userData = post;
    let postTitle = post.postTitle;
    let postContent = post.postContent;
    let postImagePath = post.postImagePath;
    API.post(
      'postsRestApi',
      '/posts',
      {
        body: {
          postTitle: postTitle,
          postContent: postContent,
          postImagePath: postImagePath
        }
      }
    )
    .then((result) => {
      const post: Post = JSON.parse(result.body);
      this.posts.push(post);
      this.postsChanged.next(this.posts.slice());
    })
    .catch(err => {
      this.dataIsLoading.next(false);
      this.dataLoadFailed.next(true);
      this.dataEdited.next(false);
      console.log('Error in posting: ' + err);
    });
  }

  deletePost(id: string, index: number) {
    API.del('postsRestApi', `/posts/${id}`, {})
    .then(result => {
      this.posts.splice(index, 1);
      this.postsChanged.next(this.posts.slice());
    })
    .catch(err => {
      console.log(err);
    });
  }

  updatePost(index: number, id: string, post: Post) {
    API.put('postsRestApi', '/posts', {
      body: {
        id: id,
        postTitle: post.postTitle,
        postContent: post.postContent,
        postImagePath: post.postImagePath
      }
    })
    .then((result) => {
      const post: Post = JSON.parse(result.body);
      this.posts[index] = post;
      this.postsChanged.next(this.posts.slice());
    })
    .catch(err => {
      console.log(err);
    });
  }


}
