import { Injectable } from '@angular/core';
import { Group } from '../models/group.interface';
import {Observable, Subject} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';

interface User {
  _id: string;
  email: string;
}

@Injectable()
export class GroupService {

  groupsObservable: Observable <string[]>;

  changedSubject = new Subject<string>();
  changed$ = this.changedSubject.asObservable();
  emitChange() {
    this.changedSubject.next('CHANGE');
  }
  getGroups(): Observable<Group[]> {
    return this.groupsObservable.mergeMap((groups: string[]) => {
      let observable$: Observable<Group>[] = groups.map(group => this.getGroup(group));
      return Observable.forkJoin(observable$);
    });
  }
  getGroup(id: string) {
    return this.http.get<Group>(`/group/${id}`).mergeMap((group: Group) => {
      let observable$: Observable<string>[] = group.members.map(member => this.getUser(member));
      return Observable.forkJoin(observable$).map(members => {
        group.members = members;
        return group;
      });
    });
  }

  getInvites() {
    let g = this.http.get<string[]>('/groups/invites').mergeMap((groups: string[]) => {
      let observable$: Observable<Group>[] = groups.map(group => this.getGroup(group));
      return observable$.length ? Observable.forkJoin(observable$): of([]);
    });
    g.subscribe((data) => console.log(data));
    return g;
  }
  respondToInvite(_id: string, status: boolean) {
    return this.http.patch(`/groups/${_id}/accept`, {accept: status}, {responseType: 'text'});
  }
  acceptInvite(_id: string) {
    return this.respondToInvite(_id, true);
  }
  declineInvite(_id: string) {
    return this.respondToInvite(_id, true);
  }
  inviteMember(groupId: string, memberId: string) {
    return this.http.post(`/groups/${groupId}/invite`, { users: [memberId] });
  }

  inviteMembers(groupId: string, members: string[]) {
    return this.http.patch(`groups/${groupId}/invite`, {users: members});
  }

  saveGroup(group: Group) {
    return this.http.post('/groups/', {group});
  }

  updateGroup(group: Group){
    return this.http.post('/user/groups/edit', {group});
  }

  getUser(_id: string) {
    return this.http.get<User>(`/user/get-email/${_id}`).pipe(map(user => user.email));
  }
  getUserByEmail(email: string) {
    return this.http.get<User>(`/users/find/${email}`);
  }
  constructor(private http: HttpClient) { 
    this.groupsObservable = this.http.get<string[]>(`/groups/`); 
  }

}
