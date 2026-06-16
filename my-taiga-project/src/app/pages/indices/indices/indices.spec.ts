import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Indices } from './indices';

describe('Indices', () => {
  let component: Indices;
  let fixture: ComponentFixture<Indices>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Indices],
    }).compileComponents();

    fixture = TestBed.createComponent(Indices);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
