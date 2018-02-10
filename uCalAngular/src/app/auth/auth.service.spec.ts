import { TestBed, inject } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { JwtModule } from '@auth0/angular-jwt';

describe('AuthService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ 
        JwtModule.forRoot({
          config: {
            tokenGetter: () => {
              return localStorage.getItem('token')
            },
            headerName: 'x-access-token',
            whitelistedDomains: ['localhost:3000', 'localhost:4200']
          }
        })
      ],
      providers: [AuthService]
    });
  });

  it('should be created', inject([AuthService], (service: AuthService) => {
    expect(service).toBeTruthy();
  }));
});
