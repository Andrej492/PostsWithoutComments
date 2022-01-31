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

  dataEdited = new BehaviorSubject<boolean>(false);
  dataIsLoading = new BehaviorSubject<boolean>(false);
  dataLoaded = new Subject<Post[]>();
  dataLoadFailed = new Subject<boolean>();
  userData: Post;
  lastPostId = "";
  isAuthenticated = new BehaviorSubject<boolean>(false);

  // private posts: Post[] = [
  //   new Post(
  //     'First Post',
  //     'Post about tasty Schnitzel!',
  //     'https://upload.wikimedia.org/wikipedia/commons/7/72/Schnitzel.JPG'
  //   ),
  //   new Post(
  //     'Second Post',
  //     'Post about big burger!',
  //     'https://upload.wikimedia.org/wikipedia/commons/b/be/Burger_King_Angus_Bacon_%26_Cheese_Steak_Burger.jpg'
  //   ),
  //   new Post(
  //     'Third Post',
  //     'Post about big burger!',
  //     'https://upload.wikimedia.org/wikipedia/commons/b/be/Burger_King_Angus_Bacon_%26_Cheese_Steak_Burger.jpg'
  //   )
  // ];

  private posts: Post[] = [];

  getPosts() {
    // Call Api
    return API.get('postsRestApi', '/posts', {})
    .then(result => {
      console.log(result);
      let str = (result.body);
      console.log(str);
      //this.posts = <Post[]>JSON.parse(result);
      const obj = JSON.parse(result.body);
      console.log(obj);
      for(let i = 0; i < obj.length; i++) {
        this.userData.postContent = (obj.postContent);
        this.userData.postTitle = (obj.postTitle);
        this.userData.postImagePath = (obj.postImagePath);
        console.log(this.userData);
      }
      // I am returning whole response, such as generatedes ids and postOwnerId
      // maybe I should change the Post model? I think no,
      // I should either filter here or there in responses

      console.log(this.posts);
      return this.posts;
    })
    .catch(err => {
      console.log(err);
      return err;
    });
    //
    //return this.posts.slice();
  }

  getPost(index: number) {
    // Call APi to get single element

    return this.posts[index];
  }

  addPost(post: Post) {
    // Call API to add Post
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
      this.lastPostId = JSON.parse(result.body).id;
      console.log(this.lastPostId);
      console.log(result);
    })
    .catch(err => {
      this.dataIsLoading.next(false);
      this.dataLoadFailed.next(true);
      this.dataEdited.next(false);
      console.log('Error in posting: ' + err);
    });
    // this.posts.push(post);
    // this.postsChanged.next(this.posts.slice());
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
