import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupService } from '../group/group.service';
import { Group } from '../models/group.interface';
import { Observable } from 'rxjs/Observable';
import { debounce, distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { timer } from 'rxjs/observable/timer';
import { FormControl } from '@angular/forms';
import { CalendarService } from '../calendar/calendar.service';
import { of } from 'rxjs/observable/of';
import { User } from '../models/user.interface';

@Component({
  selector: 'app-group-detail',
  templateUrl: './group-detail.component.html',
  styleUrls: ['./group-detail.component.css']
})
//TODO: use a 'refresh' event to tell when data should be updated
export class GroupDetailComponent implements OnInit {
  search: (text$: any) => any;
  newMember = new FormControl();
  group: Group;
  newGroup: Boolean;
  toInvite: User[];
  isInvited(user: User) {
    return this.toInvite.indexOf(user) !== -1;
  }
  constructor(private activatedRoute: ActivatedRoute, private groupService: GroupService, private calendarService: CalendarService, private router: Router) {
    this.toInvite = [];
    this.search = ((text$: Observable<string>) => 
      text$
        .pipe(debounce(() => timer(200)), distinctUntilChanged(), switchMap(() => 
          !!this.newMember.value ? this.calendarService.searchUser(this.newMember.value).pipe(map(members => members.filter(member => !this.isInvited(member)))) : of([])
        ))
    )

    this.activatedRoute.params.subscribe(params => {
      if(params.id !== "new") { 
        this.groupService.getGroup(params.id).subscribe((group)=>{
          this.group = group;
        })
      }
      else {
        this.newGroup = true;
        this.group = {
          name: "",
          members: [],
          invited: [],
          creator: "",
          calendars: []
        }
      }
    });
  }
  formatter(x: { email: string, _id: string }) {
    return x.email;
  }
  select(obj) {
    //TODO: Invite member
    this.toInvite.push(obj.item);
    this.newMember.setValue('');
  }
  inviteAll() {
    this.groupService.inviteMembers(this.group._id, this.toInvite.map(user => user._id)).subscribe(() => {
      this.toInvite = [];
    });
  }

  save() {
    this.groupService.saveGroup(this.group).subscribe(() => {
      this.groupService.emitChange();
      this.router.navigate(['/group']);
    });
  }
  
  ngOnInit() {
  }

}
