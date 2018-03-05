import { Injectable } from '@angular/core';
import { Group } from '../models/group.interface';
import {Observable} from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class GroupService {

  groupsObservable: Observable <string[]>;
  
  getGroups(): Observable<Group[]> {
    return this.groupsObservable.mergeMap((groups: string[]) => {
      let observable$: Observable<Group>[] = groups.map(group => this.getGroup(group));
      return Observable.forkJoin(observable$);
    });
  }
  getGroup(id: string) {
    return this.http.get<Group>(`/groups/${id}`);
  }

  saveGroup(group: Group) {
    return this.http.post('/user/groups/', {group});
  }
  
  constructor(private http: HttpClient) { 
    this.groupsObservable = this.http.get<string[]>(`/groups/`); 
  }

}
