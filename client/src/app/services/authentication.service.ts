import { Injectable } from '@angular/core';
import jwt_decode from 'jwt-decode';

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

  constructor() { }

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

      if (payload.exp <= now) return false;
      if (payload.nbf > now) return false;

    } catch(error) { return false; }

    return true;
  }

  authenticate(token: string, type: string) {
    localStorage.setItem("token", token);
    localStorage.setItem("token_type", type);
  }

  deauthenticate() {
    localStorage.removeItem("token");
    localStorage.removeItem("token_type");
  }
}
