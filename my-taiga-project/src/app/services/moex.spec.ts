import { TestBed } from '@angular/core/testing';

import { Moex } from './moex';

describe('Moex', () => {
  let service: Moex;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Moex);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
