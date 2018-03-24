import { Component, OnInit } from '@angular/core';
import { GroupService } from '../group/group.service';
import { Observable } from 'rxjs/Observable';
import { Group } from '../models/group.interface';
import { mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-group-invites',
  templateUrl: './group-invites.component.html',
  styleUrls: ['./group-invites.component.css']
})
export class GroupInvitesComponent implements OnInit {

  groups: Group[];
  constructor(private groupService: GroupService) { 
    this.getInvites();
    this.groupService.changed$.subscribe(() => this.getInvites());
  }
  getInvites() {
    this.groupService.getInvites().subscribe((groups) => {
      this.groups = groups;
    });
  }
  acceptInvite(_id: string) {
    this.groupService.acceptInvite(_id)
    .subscribe(() => {
      //this.groupService.emitChange();
    });
  }
  declineInvite(_id: string) {
    this.groupService.declineInvite(_id)
    .subscribe(() => {
      this.groupService.emitChange();
    });
  }
  ngOnInit() {
  }
}
