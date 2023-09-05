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
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    MatIconModule,
    HttpClientModule,
  ],
  providers: [
    AuthenticationService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
