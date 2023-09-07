import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import jwt_decode from 'jwt-decode';

const tokenPath = '/.netlify/functions/api/token';
const refreshBeforeInSeconds = 2 * 60;

type Auth = {
  token: string;
  type: string;
  refresh: string;
}
type Token = {
  id: string, 
  email: string, 
  username: string, 
  iat: number, 
  nbf: number, 
  exp: number, 
  iss: 'HushHushDiaries',
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private payload: Token | null = null;
  private refreshTimeout: NodeJS.Timeout | null = null;
  private expireTimeout: NodeJS.Timeout | null = null;

  refreshFailed = new EventEmitter(true);
  loginFailed = new EventEmitter(true);
  hasLogout = new EventEmitter(true);
  hasLogin = new EventEmitter(true);
  tokenExpireSoon = new EventEmitter(true);
  tokenExpired = new EventEmitter(true);

  constructor(
    private http: HttpClient,
  ) {
    let token = localStorage.getItem("token");
    let type = localStorage.getItem("token_type");

    if (token && type) this.payload = jwt_decode<Token>(token);

    this.setRefreshTimeout();
    this.setExpireTimeout();
  }

  private setRefreshTimeout() {
    if (this.payload) {
      let now = new Date().valueOf() / 1000;
      let expire = this.payload.exp - now;
      let refresh = this.payload.exp - now - refreshBeforeInSeconds;

      if (expire > 0) {
        if (this.refreshTimeout) clearTimeout(this.refreshTimeout);
        this.refreshTimeout = setTimeout(() => {
          this.tokenExpireSoon.next(true);
        }, refresh * 1000);
      }
    }
  }

  private setExpireTimeout() {
    if (this.payload) {
      let now = new Date().valueOf() / 1000;
      let expire = this.payload.exp - now;

      if (this.expireTimeout) clearTimeout(this.expireTimeout);
      this.expireTimeout = setTimeout(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("token_type");
        localStorage.removeItem("token_refresh");
        this.payload = null;
        this.tokenExpired.next(true);
      }, expire * 1000);
    }
  }

  getAuthenticationHeader() {
    let token = localStorage.getItem("token");
    let type = localStorage.getItem("token_type");

    if (!token || !type) return '';

    return `${type} ${token}`;
  }

  getUserId() {
    if (!this.payload) return null;
    return this.payload.id;
  }

  getEmail() {
    if (!this.payload) return null;
    return this.payload.email;
  }

  getUsername() {
    if (!this.payload) return null;
    return `${this.payload.username}#${this.payload.id}`;
  }

  isAuthenticated() {
    if (!this.payload) return false;

    let now = Date.now().valueOf() / 1000;

    if (this.payload.nbf > now) return false;
    if (this.payload.exp <= now) {
      localStorage.removeItem("token");
      localStorage.removeItem("token_type");
      localStorage.removeItem("token_refresh");
      this.payload = null;
      return false;
    }

    return true;
  }

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("token_type");
    localStorage.removeItem("token_refresh");
    this.payload = null;
    this.hasLogout.next(true);
  }

  login(email: string, password: string) {
    this.http.post<Auth>(tokenPath, {email, password}).subscribe({
      error: () => {
        this.loginFailed.next(true);
      },
      next: (auth) => {
        localStorage.setItem("token", auth.token);
        localStorage.setItem("token_type", auth.type);
        localStorage.setItem("token_refresh", auth.refresh);
        this.payload = jwt_decode<Token>(auth.token);
        this.setRefreshTimeout();
        this.setExpireTimeout();
        this.hasLogin.next(true);
      }
    });
  }

  refresh() {
    let refresh = localStorage.getItem("token_refresh");

    if (!refresh) {
      this.refreshFailed.next(true);
      return;
    }

    this.http.post<Auth>(tokenPath + '/refresh', {refresh}).subscribe({
      error: () => {
        this.refreshFailed.next(true);
      },
      next: (auth) => {
        localStorage.setItem("token", auth.token);
        localStorage.setItem("token_type", auth.type);
        localStorage.setItem("token_refresh", auth.refresh);
        this.payload = jwt_decode<Token>(auth.token);
        this.setRefreshTimeout();
        this.setExpireTimeout();
      }
    });
  }
}
