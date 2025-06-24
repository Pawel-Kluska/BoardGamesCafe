import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavBookmarksComponent } from './nav-bookmarks.component';

describe('NavBookmarksComponent', () => {
  let component: NavBookmarksComponent;
  let fixture: ComponentFixture<NavBookmarksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavBookmarksComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavBookmarksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
