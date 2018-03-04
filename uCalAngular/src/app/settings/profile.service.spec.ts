import { TestBed, inject } from '@angular/core/testing';

import { ProfileService } from './profile.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
describe('Profile Service', () => {
  let httpMock: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProfileService],
      imports: [HttpClientTestingModule]
    });
    httpMock = TestBed.get(HttpTestingController);
  });

  it('should be created', inject([ProfileService], (service: ProfileService) => {
    expect(service).toBeTruthy();
  }));
  it('should be created', inject([ProfileService], (service: ProfileService) => {
    expect(service).toBeTruthy();
    service.getProfile()
      .subscribe(res => {
        expect(res._id).toEqual('Test-ID');
        expect(res.email).toEqual('test-email@gmail.com');
      });
    let profileRequest = httpMock.expectOne('/current-user');
    profileRequest.flush({ _id: 'Test-ID', email: 'test-email@gmail.com'});
    httpMock.verify();
  }));
});
