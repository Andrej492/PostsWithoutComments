import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { PostsComponent } from './posts/posts.component';
import { PostEditComponent } from './posts/post-edit/post-edit.component';
import { PostDetailComponent } from './posts/post-detail/post-detail.component';
import { PostStartComponent } from './posts/post-start/post-start.component';
import { PostsResolverService } from './posts/posts-resolver.service';

const routes: Routes = [
  { path: '', redirectTo: '/posts', pathMatch: 'full'},
  { path: 'auth', component: AuthComponent },
  { path: 'posts', component: PostsComponent,
    children: [
      { path: '', component: PostStartComponent },
      { path: 'new', component: PostEditComponent },
      { path: ':id', component: PostDetailComponent, resolve: [PostsResolverService]},
      { path: ':id/edit', component: PostEditComponent, resolve: [PostsResolverService]}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
