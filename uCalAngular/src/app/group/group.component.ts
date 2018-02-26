import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupService } from './group.service';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css']
})
export class GroupComponent implements OnInit {
  
  constructor(private activatedRoute: ActivatedRoute, private router: Router, private groupService: GroupService){
  }

  getGroups() {
    return this.groupService.getGroups();
  }

  isDetail() {
    return this.router.url.indexOf('/group/detail/') >= 0;
  }

  ngOnInit() {
  }

}
