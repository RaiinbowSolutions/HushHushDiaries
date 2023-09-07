import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './pages/home/home.page';
import { LoginPage } from './pages/login/login.page';
import { LogoutPage } from './pages/logout/logout.page';
import { UserCreatePage } from './pages/user-create/user-create.page';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { AnonymousGuard } from './guards/anonymous.guard';
import { LicencePage } from './pages/licence/licence.page';
import { CategoriesPage } from './pages/categories/categories.page';
import { BlogsPage } from './pages/blogs/blogs.page';
import { BlogCreatePage } from './pages/blogs/blog-create/blog-create.page';
import { BlogOwnedPage } from './pages/blogs/blog-owned/blog-owned.page';
import { BlogUpdatePage } from './pages/blogs/blog-update/blog-update.page';
import { BlogViewPage } from './pages/blogs/blog-view/blog-view.page';

const routes: Routes = [
  { path: '', component: HomePage, canActivate: [AuthenticatedGuard] },
  { path: 'login', component: LoginPage, canActivate: [AnonymousGuard]},
  { path: 'logout', component: LogoutPage, canActivate: [AuthenticatedGuard] },
  { path: 'users/create', component: UserCreatePage, canActivate: [AnonymousGuard] },
  { path: 'categories', component: CategoriesPage, canActivate: [AuthenticatedGuard] },

  { path: 'blogs', component: BlogsPage, canActivate: [AuthenticatedGuard] },
  { path: 'blogs/create', component: BlogCreatePage, canActivate: [AuthenticatedGuard] },
  { path: 'blogs/owned', component: BlogOwnedPage, canActivate: [AuthenticatedGuard] },
  { path: 'blogs/:id/edit', component: BlogUpdatePage, canActivate: [AuthenticatedGuard] },
  { path: 'blogs/:id', component: BlogViewPage, canActivate: [AuthenticatedGuard] },

  { path: 'licence', component: LicencePage },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
