import { TestBed, inject } from '@angular/core/testing';

import { AuthGuardService } from './auth-guard.service';
import { AuthService } from './auth.service';
import { JwtHelperService, JwtModule } from '@auth0/angular-jwt';
import { RouterTestingModule } from '@angular/router/testing';

describe('AuthGuardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthGuardService, AuthService],
      imports: [
        JwtModule.forRoot({
          config: {
            tokenGetter: () => {
              return localStorage.getItem('token')
            },
            headerName: 'x-access-token',
            whitelistedDomains: ['localhost:3000', 'localhost:4200']
          }
        }), 
        RouterTestingModule
      ]
    });
  });

  it('should be created', inject([AuthGuardService], (service: AuthGuardService) => {
    expect(service).toBeTruthy();
  }));
});
