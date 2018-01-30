import { TestBed, inject } from '@angular/core/testing';

import { TokenHandlerService } from './token-handler.service';

describe('TokenHandlerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TokenHandlerService]
    });
  });

  it('should be created', inject([TokenHandlerService], (service: TokenHandlerService) => {
    expect(service).toBeTruthy();
  }));
});
