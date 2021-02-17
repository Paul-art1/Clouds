import { TestBed } from '@angular/core/testing';

import { CountryPagesGuard } from './countrypages.guard';

describe('CountryPagesGuard', () => {
  let guard: CountryPagesGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(CountryPagesGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
