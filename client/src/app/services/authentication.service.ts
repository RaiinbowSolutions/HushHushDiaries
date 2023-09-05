import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import jwt_decode from 'jwt-decode';

const tokenPath = '/.netlify/functions/api/token';
const refreshPrompOffsetInSeconds = 60 * 5;

type Auth = {
  token: string;
  type: string;
}
type Token = {
  id: string, 
  iat: number, 
  nbf: number, 
  exp: number, 
  iss: 'HushHushDiaries',
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private email: string | null = null;
  private password: string | null = null;

  deauthenticated: EventEmitter<boolean> = new EventEmitter<boolean>();
  authenticated: EventEmitter<boolean> = new EventEmitter<boolean>();
  expireSoon: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    private http: HttpClient,
  ) { }

  getToken() {
    let token = localStorage.getItem("token");
    let type = localStorage.getItem("token_type");

    return `${type} ${token}`;
  }

  isAuthenticated() {
    let token = localStorage.getItem("token");
    let type = localStorage.getItem("token_type");

    if (token === null) return false;
    if (type === null) return false;

    try {
      let payload = jwt_decode<Token>(token);
      let now = Date.now().valueOf() / 1000;

      if (payload.nbf > now) return false;
      if (payload.exp <= now) {
        localStorage.removeItem("token");
        localStorage.removeItem("token_type");
        this.deauthenticated.emit(true);
        return false;
      }

      if(payload.exp <= now - refreshPrompOffsetInSeconds) {
        this.expireSoon.emit(true);
      }

    } catch(error) { return false; }

    return true;
  }

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("token_type");
    this.deauthenticated.emit(true);
  }

  login(email: string, password: string) {
    this.email = email;
    this.password = password;

    this.http.post<Auth>(tokenPath, {email, password}).subscribe((auth) => {
      localStorage.setItem("token", auth.token);
      localStorage.setItem("token_type", auth.type);
      this.authenticated.emit(true);
    });
  }

  refresh() {
    let email = this.email;
    let password = this.password;

    if (!email) return;
    if (!password) return;

    this.http.post<Auth>(tokenPath, {email, password}).subscribe((auth) => {
      localStorage.setItem("token", auth.token);
      localStorage.setItem("token_type", auth.type);
    });
  }
}
