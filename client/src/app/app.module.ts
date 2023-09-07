import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { MenuComponent } from './components/menu/menu.component';
import { AccountMenuComponent } from './components/account-menu/account-menu.component';
import { InformationalMenuComponent } from './components/informational-menu/informational-menu.component';
import { AccountImageComponent } from './components/account-image/account-image.component';
import { HeaderComponent } from './components/header/header.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomePage } from './pages/home/home.page';
import { LoginPage } from './pages/login/login.page';
import { LogoutPage } from './pages/logout/logout.page';
import { UserCreatePage } from './pages/users/user-create/user-create.page';
import { AuthenticationService } from './services/authentication.service';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { UserService } from './services/user.service';
import { DialogService } from './services/dialog.service';
import { MAT_DIALOG_DEFAULT_OPTIONS, MatDialogModule } from '@angular/material/dialog';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { DialogComponent } from './components/dialog/dialog.component';
import { LicencePage } from './pages/licence/licence.page';
import { CategoriesPage } from './pages/categories/categories.page';
import { BlogsPage } from './pages/blogs/blogs.page';
import { BlogUpdatePage } from './pages/blogs/blog-update/blog-update.page';
import { BlogOwnedPage } from './pages/blogs/blog-owned/blog-owned.page';
import { BlogCreatePage } from './pages/blogs/blog-create/blog-create.page';
import { BlogViewPage } from './pages/blogs/blog-view/blog-view.page';
import { NewsPage } from './pages/news/news.page';
import { InformationPage } from './pages/information/information.page';
import { AboutUsPage } from './pages/about-us/about-us.page';
import { UsersPage } from './pages/users/users.page';
import { UserViewPage } from './pages/users/user-view/user-view.page';
import { UserEditPage } from './pages/users/user-edit/user-edit.page';
import { AnonymLicencePage } from './pages/anonym-licence/anonym-licence.page';
import { AnonymNewsPage } from './pages/anonym-news/anonym-news.page';
import { AnonymInformationPage } from './pages/anonym-information/anonym-information.page';
import { AnonymAboutUsPage } from './pages/anonym-about-us/anonym-about-us.page';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    MenuComponent,
    AccountMenuComponent,
    InformationalMenuComponent,
    AccountImageComponent,
    HeaderComponent,
    WelcomeComponent,
    DialogComponent,
    HomePage,
    LoginPage,
    LogoutPage,
    LicencePage,
    CategoriesPage,
    BlogsPage,
    BlogUpdatePage,
    BlogOwnedPage,
    BlogCreatePage,
    BlogViewPage,
    NewsPage,
    InformationPage,
    AboutUsPage,
    UsersPage,
    UserCreatePage,
    UserViewPage,
    UserEditPage,
    AnonymLicencePage,
    AnonymNewsPage,
    AnonymInformationPage,
    AnonymAboutUsPage,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatDialogModule,
    TitleCasePipe,
    HttpClientModule,
  ],
  providers: [
    DialogService,
    AuthenticationService,
    UserService,
    {provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: {hasBackdrop: false}},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
