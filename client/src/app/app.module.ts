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
import { UserCreatePage } from './pages/user-create/user-create.page';
import { AuthenticationService } from './services/authentication.service';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { UserService } from './services/user.service';
import { DialogService } from './services/dialog.service';
import { MAT_DIALOG_DEFAULT_OPTIONS, MatDialogModule } from '@angular/material/dialog';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { DialogComponent } from './components/dialog/dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    MenuComponent,
    AccountMenuComponent,
    InformationalMenuComponent,
    AccountImageComponent,
    HeaderComponent,
    HomePage,
    LoginPage,
    LogoutPage,
    UserCreatePage,
    WelcomeComponent,
    DialogComponent,
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
