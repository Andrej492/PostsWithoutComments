import { Injectable, OnDestroy, OnInit } from "@angular/core";
import { API, Auth } from "aws-amplify";
import { BehaviorSubject, Observable, Subject, Subscription } from "rxjs";
import { PostService } from "../posts/post.service";
import { Comment } from "./comment.model";

@Injectable({providedIn: 'root'})
export class CommentService implements OnInit, OnDestroy{
  private comments: Comment[] = [];
  public commentsChanged: Subject<Comment[]> = new Subject<Comment[]>();
  comment: Comment;
  editedComment: Subject<Comment> = new Subject<Comment>();
  isEditing: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  authUsernameSub: Subscription;
  commentUsername: string = 'not Logged';

  constructor(private postService: PostService) {}

  ngOnInit(): void {}

  getCommentUsername(): string {
    this.authUsernameSub = this.postService.authUsername.subscribe((username: string)=> {
      this.commentUsername = username;
    }, err => {
      console.log(err);
      let usr = 'not Logged';
      this.commentUsername = usr;
    });
    return this.commentUsername;
  }

  getCommentsByIdObs(): Observable<Comment[]> {
    return this.commentsChanged.asObservable();
  }

  getComments(postId: string) {
    return API.get(
      'postsRestApi',
      `/posts/${postId}`,
      {}
      )
    .then(result => {
      const res = JSON.parse(result.body);
      this.comments = res.comments;
      this.commentsChanged.next(this.comments.slice());
      return this.comments;
    })
    .catch(err => {
      console.log(err);
      return err;
    });
  }

  postComment(id: string, comment: Comment) {
    Auth.currentSession()
    .then((session) =>{
      API.post(
        'postsRestApi',
        `/posts/${id}`,
        {
          body: {
            comments : {
              commentContent: comment.commentContent,
              commentOwnerUsername: this.getCommentUsername()
            }
          },
          headers: new Headers({
            'Authorization': session.getIdToken().getJwtToken()
          })
        }
      )
      .then((result) => {
        const res = JSON.parse(result.body);
        comment = res.comments;
        this.comments.push(comment);
        this.commentsChanged.next(this.comments.slice());
      })
      .catch(err => {
        console.log(err.response);
      });
    })
    .catch(err => {
      console.log(err);
    })
  }

  updateComment(id: string, comment: Comment) {
    Auth.currentSession()
    .then(session => {
      API.put('postsRestApi', `/posts/${id}`, {
        body: {
          commentId: comment.commentId,
          commentContent: comment.commentContent
        },
        headers: new Headers({
          'Authorization': session.getIdToken().getJwtToken()
        })
      })
      .then((result) => {
        const res = JSON.parse(result.body);
        const updatedComment: Comment = res.comments;
        this.comments['commentId'] = updatedComment;
        this.commentsChanged.next(this.comments.slice());
      })
      .catch(err => {
        console.log(err);
      });
    })
    .catch(err => {
      console.log(err);
    });
  }

  deleteComment(id: string, commentId: string) {
    Auth.currentSession()
    .then((session) =>{
      API.del(
        'postsRestApi',
        `/posts/${id}`,
        {
          body: {},
          headers: new Headers({
            'Authorization': session.getIdToken().getJwtToken()
          })
        }
      )
      .then((result) => {
        //let commentId = comment['commentId'];
        this.commentsChanged.next(this.comments.slice());
      })
      .catch(err => {
        console.log(err.response);
      });
    })
    .catch(err => {
      console.log(err);
    })
  }

  ngOnDestroy(): void {
    this.authUsernameSub.unsubscribe();
  }

}
