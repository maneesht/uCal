import { Injectable, OnInit } from '@angular/core';

@Injectable()
export class TokenHandlerService {
  constructor() { }
  clearToken() {
    localStorage.removeItem('token');
  }
  setToken(token: string) {
      if(token) {
        localStorage.setItem('token', token);
      }
  }
}
