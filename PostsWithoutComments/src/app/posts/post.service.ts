import { Injectable, OnInit } from "@angular/core";
import { API } from "aws-amplify";
import { BehaviorSubject, Subject } from "rxjs";
import { Post } from "./post.model";

@Injectable({providedIn: 'root'})
export class PostService implements OnInit {
  //dataLoadFailed = new Subject<boolean>();
  //postsLoaded = new Subject<Post[]>();
  //postData: Post;
  postsChanged = new Subject<Post[]>();
  dataEdited = new BehaviorSubject<boolean>(false);
  dataIsLoading = new BehaviorSubject<boolean>(false);
  dataLoaded = new Subject<Post[]>();
  dataLoadFailed = new Subject<boolean>();
  userData: Post;
  post: Post;
  postGet: Post;
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
  ngOnInit(): void {
    // if(this.posts.length > 0){
    //   this.getPosts();
    // }
  }
  private posts: Post[] = [];

  getPosts() {
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

  getPost(index: number) {
    const postById = this.posts[index];
    const postEditDatabaseId = postById['id'];
    console.log(postEditDatabaseId);
    return API.get('postsRestApi', `/posts/${postEditDatabaseId}`, {})
    .then(result => {
      this.post = JSON.parse(result.body);
      console.log(this.post);
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
      // this.lastPostId = JSON.parse(result.body).id;
      const post: Post = JSON.parse(result.body);
      this.posts.push(post);
      this.postsChanged.next(this.posts.slice());
      console.log(result);
    })
    .catch(err => {
      this.dataIsLoading.next(false);
      this.dataLoadFailed.next(true);
      this.dataEdited.next(false);
      console.log('Error in posting: ' + err);
    });
  }

  deletePost(id: string, index: number) {
    console.log("Deleting Post!");
    console.log(id);
    console.log(index);
    API.del('postsRestApi', `/posts/${id}`, {})
    .then(result => {
      console.log(result);
      this.posts.splice(index, 1);// to spet ne dela?1
      this.postsChanged.next(this.posts.slice());
    })
    .catch(err => {
      console.log(err);
    });
  }

  updatePost(index: number, post: Post) {
    this.posts[index] = post;
    this.postsChanged.next(this.posts.slice());
  }


}
