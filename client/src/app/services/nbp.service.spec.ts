import { TestBed } from '@angular/core/testing';

import { NbpService } from './nbp.service';

describe('NbpService', () => {
  let service: NbpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NbpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
