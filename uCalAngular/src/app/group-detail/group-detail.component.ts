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
  newMember: string;
  constructor(private activatedRoute: ActivatedRoute, private groupService: GroupService) {
    this.activatedRoute.params.subscribe(params => {
      if(params.id !== "new") { 
        this.groupService.getGroup(params.id).subscribe((group)=>{
          this.group = group;
        })
      }
      else {
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

  addMember(){
    this.group.members.push(this.newMember);
    this.newMember = "";
  }

  save() {
    this.groupService.saveGroup(this.group);
  }
  
  removeMember(name: string) {
    //remove person from group object locally, do NOT call save
    let index = this.group.members.indexOf(name);
    this.group.members.splice(index, 1);
  }

  ngOnInit() {
  }

}
