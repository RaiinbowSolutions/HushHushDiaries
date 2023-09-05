import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './pages/home/home.page';
import { LoginPage } from './pages/login/login.page';
import { LogoutPage } from './pages/logout/logout.page';
import { UserCreatePage } from './pages/user-create/user-create.page';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { AnonymousGuard } from './guards/anonymous.guard';

const routes: Routes = [
  { path: '', component: HomePage, canActivate: [AuthenticatedGuard] },
  { path: 'login', component: LoginPage, canActivate: [AnonymousGuard]},
  { path: 'logout', component: LogoutPage, canActivate: [AuthenticatedGuard] },
  { path: 'users/create', component: UserCreatePage, canActivate: [AnonymousGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
