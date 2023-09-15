import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { AuthenticationService } from './authentication.service';
import { Pagination } from '../models/pagination.model';
import { User, UserCreateData, UserCreated, UserCredentialUpdateData, UserDetail, UserDetailUpdateData, UserOption, UserOptionUpdateData, UserUpdateData } from '../models/user.model';
import { Permission } from '../models/permission.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private path = '/.netlify/functions/api/users';
  private options = {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': this.authService.getAuthenticationHeader(),
    }
  };

  userCreateFailed: EventEmitter<boolean> = new EventEmitter<boolean>();
  userUpdateFailed: EventEmitter<boolean> = new EventEmitter<boolean>();
  userDeleteFailed: EventEmitter<boolean> = new EventEmitter<boolean>();
  userDeactivateFailed: EventEmitter<boolean> = new EventEmitter<boolean>();
  userBanFailed: EventEmitter<boolean> = new EventEmitter<boolean>();
  userValidateFailed: EventEmitter<boolean> = new EventEmitter<boolean>();
  userOptionUpdateFailed: EventEmitter<boolean> = new EventEmitter<boolean>();
  userDetailUpdateFailed: EventEmitter<boolean> = new EventEmitter<boolean>();
  userCredentialUpdateFailed: EventEmitter<boolean> = new EventEmitter<boolean>();
  addUserPermissionFailed: EventEmitter<boolean> = new EventEmitter<boolean>();
  removeUserPermissionFailed: EventEmitter<boolean> = new EventEmitter<boolean>();

  userCreated: EventEmitter<boolean> = new EventEmitter<boolean>();
  userUpdated: EventEmitter<boolean> = new EventEmitter<boolean>();
  userDeleted: EventEmitter<boolean> = new EventEmitter<boolean>();
  userDeactivated: EventEmitter<boolean> = new EventEmitter<boolean>();
  userBanned: EventEmitter<boolean> = new EventEmitter<boolean>();
  userValidated: EventEmitter<boolean> = new EventEmitter<boolean>();
  userOptionUpdated: EventEmitter<boolean> = new EventEmitter<boolean>();
  userDetailUpdated: EventEmitter<boolean> = new EventEmitter<boolean>();
  userCredentialUpdated: EventEmitter<boolean> = new EventEmitter<boolean>();
  addedUserPermission: EventEmitter<boolean> = new EventEmitter<boolean>();
  removedUserPermission: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    private http: HttpClient,
    private authService: AuthenticationService,
  ) { }

  getUsers(page: number = 1) {
    let result = this.http.get<Pagination<User>>(this.path + `?page=${page}`, this.options);

    return result;
  }

  getUser(id: string) {
    let result = this.http.get<User>(this.path + `/${id}`, this.options);

    return result;
  }

  getUserOption(id: string) {
    let result = this.http.get<UserOption>(this.path + `/${id}/option`, this.options);

    return result;
  }

  getUserDetail(id: string) {
    let result = this.http.get<UserDetail>(this.path + `/${id}/detail`, this.options);

    return result;
  }

  getUserPermissions(id: string, page: number = 1) {
    let result = this.http.get<Pagination<Permission>>(this.path + `${id}/permissions?page=${page}`, this.options);

    return result;
  }

  create(createData: UserCreateData) {
    let result = this.http.post<UserCreated>(this.path, createData, this.options);
    result.subscribe({
      next: () => this.userCreated.emit(true),
      error: () => this.userCreateFailed.emit(true),
    });

    return result;
  }

  update(id: string, updateData: UserUpdateData) {
    let result = this.http.patch<void>(this.path + `/${id}`, updateData, this.options);
    result.subscribe({
      next: () => this.userUpdated.emit(true),
      error: () => this.userUpdateFailed.emit(true),
    });

    return result;
  }

  delete(id: string) {
    let result = this.http.delete<void>(this.path + `/${id}`, this.options);
    result.subscribe({
      next: () => this.userDeleted.emit(true),
      error: () => this.userDeleteFailed.emit(true),
    });

    return result;
  }

  deactivate(id: string) {
    let result = this.http.post<void>(this.path + `/${id}/deactivate`, {}, this.options);
    result.subscribe({
      next: () => this.userUpdated.emit(true),
      error: () => this.userUpdateFailed.emit(true),
    });

    return result;
  }

  ban(id: string) {
    let result = this.http.post<void>(this.path + `/${id}/ban`, {}, this.options);
    result.subscribe({
      next: () => this.userBanned.emit(true),
      error: () => this.userBanFailed.emit(true),
    });

    return result;
  }

  validate(id: string) {
    let result = this.http.post<void>(this.path + `/${id}/validate`, {}, this.options);
    result.subscribe({
      next: () => this.userValidated.emit(true),
      error: () => this.userValidateFailed.emit(true),
    });

    return result;
  }

  optionUpdate(id: string, optionUpdateData: UserOptionUpdateData) {
    console.log(optionUpdateData);
    let result = this.http.patch<void>(this.path + `/${id}/option`, optionUpdateData, this.options);
    result.subscribe({
      next: () => this.userOptionUpdated.emit(true),
      error: () => this.userOptionUpdateFailed.emit(true),
    });

    return result;
  }

  detailUpdate(id: string, detailUpdateData: UserDetailUpdateData) {
    let result = this.http.patch<void>(this.path + `/${id}/detail`, detailUpdateData, this.options);
    result.subscribe({
      next: () => this.userDetailUpdated.emit(true),
      error: () => this.userDetailUpdateFailed.emit(true),
    });

    return result;
  }

  credentialUpdate(id: string, credentialUpdateData: UserCredentialUpdateData) {
    let result = this.http.patch<void>(this.path + `/${id}/credential`, credentialUpdateData, this.options);
    result.subscribe({
      next: () => this.userCredentialUpdated.emit(true),
      error: () => this.userCredentialUpdateFailed.emit(true),
    });

    return result;
  }

  addPermission(id: string, permissionId: string) {
    let result = this.http.post<void>(this.path + `/${id}/permissions/${permissionId}`, this.options);
    result.subscribe({
      next: () => this.addedUserPermission.emit(true),
      error: () => this.addUserPermissionFailed.emit(true),
    });

    return result;
  }

  removePermission(id: string, permissionId: string) {
    let result = this.http.delete<void>(this.path + `/${id}/permissions/${permissionId}`, this.options);
    result.subscribe({
      next: () => this.removedUserPermission.emit(true),
      error: () => this.removeUserPermissionFailed.emit(true),
    });

    return result;
  }
}
