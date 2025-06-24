import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionsViewComponent } from './sessions-view.component';

describe('SessionsViewComponent', () => {
  let component: SessionsViewComponent;
  let fixture: ComponentFixture<SessionsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionsViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SessionsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
