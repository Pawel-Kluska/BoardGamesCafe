import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationsUserViewComponent } from './reservations-user-view.component';

describe('ReservationsUserViewComponent', () => {
  let component: ReservationsUserViewComponent;
  let fixture: ComponentFixture<ReservationsUserViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservationsUserViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservationsUserViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
