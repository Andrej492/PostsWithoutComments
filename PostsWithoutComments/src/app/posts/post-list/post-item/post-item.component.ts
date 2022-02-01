import { Component, Input, OnInit } from '@angular/core';
import { Post } from '../../post.model';
@Component({
  selector: 'app-post-item',
  templateUrl: './post-item.component.html',
  styleUrls: ['./post-item.component.css']
})
export class PostItemComponent implements OnInit {
  @Input() post: Post;
  @Input() index: number;
  postId: string;
  //@Input() index: string;
  constructor() {}

  ngOnInit(): void {
    //console.log(this.post);
    //console.log(this.index);
    this.postId = this.post['id'];
    //console.log(this.postId);
  }

  // checkPostId(index: number) {
  //   this.postService.checkGetPostId(index);
  // }
}
