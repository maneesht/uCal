import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GroupService } from '../group/group.service';
import { Group } from '../models/group.interface';

@Component({
  selector: 'app-group-detail',
  templateUrl: './group-detail.component.html',
  styleUrls: ['./group-detail.component.css']
})
export class GroupDetailComponent implements OnInit {
  group: Group;
  constructor(private activatedRoute: ActivatedRoute, private groupService: GroupService) {
    this.activatedRoute.params.subscribe(params => this.group = this.groupService.getGroup(+params.id));
  }
  save() {
    //implement code to call service and make it POST to update the group
    /* 
      Something like:
        this.groupService.saveGroup(this.group); //be sure to also create this function in groupService
    */
  }
  removeMember(name: string) {
    //remove person from group object locally, do NOT call save
  }

  ngOnInit() {
  }

}
