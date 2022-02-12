import { Injectable } from "@angular/core";
import { API, Auth } from "aws-amplify";
import { Subject } from "rxjs";
import { Comment } from "./comment.model";

@Injectable({providedIn: 'root'})
export class CommentService{
  private comments: Comment[] = [];
  commentsChanged = new Subject<Comment[]>();
  comment: Comment;

  constructor() {}


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
              commentContent: comment.commentContent
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
        console.log(comment);
        this.comments.push(comment);
        console.log(this.comments);
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
}
