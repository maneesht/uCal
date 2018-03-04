import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user.interface';

@Injectable()
export class ProfileService {

  constructor(private http: HttpClient) { }
  getProfile() {
    return this.http.get<User>(`/current-user`);
  }
}
