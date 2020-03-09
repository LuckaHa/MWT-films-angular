import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserEditChildComponent } from './user-edit-child.component';

describe('UserEditChildComponent', () => {
  let component: UserEditChildComponent;
  let fixture: ComponentFixture<UserEditChildComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserEditChildComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserEditChildComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
