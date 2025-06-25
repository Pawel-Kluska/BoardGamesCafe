import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionJoinComponent } from './session-join.component';

describe('SessionJoinComponent', () => {
  let component: SessionJoinComponent;
  let fixture: ComponentFixture<SessionJoinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionJoinComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SessionJoinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
