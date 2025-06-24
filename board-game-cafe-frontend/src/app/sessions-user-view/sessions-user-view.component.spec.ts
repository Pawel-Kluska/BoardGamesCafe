import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionsUserViewComponent } from './sessions-user-view.component';

describe('SessionsUserViewComponent', () => {
  let component: SessionsUserViewComponent;
  let fixture: ComponentFixture<SessionsUserViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionsUserViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SessionsUserViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
