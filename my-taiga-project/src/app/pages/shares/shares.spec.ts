import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Shares } from './shares';

describe('Shares', () => {
  let component: Shares;
  let fixture: ComponentFixture<Shares>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Shares],
    }).compileComponents();

    fixture = TestBed.createComponent(Shares);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
