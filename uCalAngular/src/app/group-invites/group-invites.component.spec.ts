import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupInvitesComponent } from './group-invites.component';
import { GroupService } from '../group/group.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('GroupInvitesComponent', () => {
  let component: GroupInvitesComponent;
  let fixture: ComponentFixture<GroupInvitesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupInvitesComponent ],
      imports: [HttpClientTestingModule],
      providers: [GroupService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupInvitesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
