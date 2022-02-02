import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { Post } from "./post.model";
import { PostService } from "./post.service";

@Injectable({providedIn: 'root'})
export class PostsResolverService implements Resolve<Post[]> {

  constructor(private postService: PostService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Post[] | Observable<Post[]> | Promise<Post[]> {
      return this.postService.getPosts();
  }
}
