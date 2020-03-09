import { TestBed } from '@angular/core/testing';

import { UsersServerService } from './users-services.service';

describe('UsersServicesService', () => {
  let service: UsersServerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsersServerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
