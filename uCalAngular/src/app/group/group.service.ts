import { Injectable } from '@angular/core';
import { Group } from '../models/group.interface';

@Injectable()
export class GroupService {
  /* 
    hard-coded list. Replace with observable:
    groupsObservable: Observable <Group[]>; 
  */
  private groups: Group[] = [
    { 
      id: 0,
      name: `Papa John's Official Wallyball team`,
      members: [
        'Maneesh Tewani',
        'Kevin Meyer',
        'Matthew Kramer',
        'Ben Collier',
        'Chris Blackwell',
        'Hector Trevino'
      ]
    }
  ];
  getGroups() {
    return this.groups; //return observable created in constructor
  }
  getGroup(id: number) {
    return this.groups.find(group => group.id === id); //return an observable with an HTTP request instead
  }
  /* Insert HTTP Observable to request data. DO NOT subscribe */
  /* 
  Example: 
    this.groupsObservable = this.http.get(`/groups/`);
  Don't forget to inject HTTPClient:
    constructor(private http: HTTPClient) { }
  ...And import HTTPClient
    import { HTTPClient } from '@angular/common/http';
  */
  constructor() { }

}
