import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupDetailComponent } from './group-detail.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { GroupService } from '../group/group.service';

describe('GroupDetailComponent', () => {
  let component: GroupDetailComponent;
  let fixture: ComponentFixture<GroupDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupDetailComponent ],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [RouterTestingModule],
      providers: [GroupService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
