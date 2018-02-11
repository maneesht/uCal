import { TestBed, inject } from '@angular/core/testing';

import { TokenHandlerService } from './token-handler.service';

describe('TokenHandlerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TokenHandlerService]
    });
  });

  afterEach(() => {
    localStorage.removeItem('token');
  });

  it('should be created', inject([TokenHandlerService], (service: TokenHandlerService) => {
    expect(service).toBeTruthy();
  }));
  it('should add a token to localStorage', inject([TokenHandlerService], (service: TokenHandlerService) => {
    let tokenInput = 'uCal';
    service.setToken(tokenInput);
    let token = localStorage.getItem('token');
    expect(token).toEqual(tokenInput);
  }));
  it('should remove a token to localStorage', inject([TokenHandlerService], (service: TokenHandlerService) => {
    let tokenInput = 'uCal';
    service.setToken(tokenInput);
    let token = localStorage.getItem('token');
    expect(token).toEqual(tokenInput);
    service.clearToken();
    token = localStorage.getItem('token');
    expect(token).toEqual(null);
  }));
  it('shouldn\'t add an item to localStorage', inject([TokenHandlerService], (service: TokenHandlerService) => {
    let tokenInput;
    service.setToken(tokenInput);
    let token = localStorage.getItem('token');
    expect(token).toEqual(null);
  }));
});
