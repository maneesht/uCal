import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupService } from './group.service';
import { Group } from '../models/group.interface';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css']
})
export class GroupComponent implements OnInit {
  groups: Group[];
  constructor(private activatedRoute: ActivatedRoute, private router: Router, private groupService: GroupService){
    this.getGroups();
  }

  getGroups() {
    this.groupService.getGroups().subscribe((groups)=>{
      this.groups = groups;
    });
  }

  isDetail() {
    return this.router.url.indexOf('/group/detail/') >= 0;
  }

  ngOnInit() {
  }

}
