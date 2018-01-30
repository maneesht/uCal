import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable()
export class AuthService {

  constructor(public jwtHelper: JwtHelperService) { }
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return token && !this.jwtHelper.isTokenExpired(token);
  }

}
