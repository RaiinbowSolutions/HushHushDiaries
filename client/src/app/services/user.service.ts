import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';

const userPath = '/.netlify/functions/api/users';

type CreatedUserResponse = {
  created: true,
  id: string,
  path: string,
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  userCreationFailed: EventEmitter<boolean> = new EventEmitter<boolean>();
  userCreated: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    private http: HttpClient,
  ) { }

  create(email: string, password: string) {
    this.http.post<CreatedUserResponse>(userPath, {email, password}).subscribe({
      next: () => this.userCreated.emit(true),
      error: () => this.userCreationFailed.emit(true),
    });
  }
}