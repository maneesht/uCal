import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { switchMap } from 'rxjs/operators';
import 'rxjs/add/observable/forkJoin';
import { User } from '../models/user.interface';
interface CalendarID {
  edit? : boolean;
  _id : string;
}
@Injectable()
export class CalendarService {

  constructor(private http: HttpClient) { }
  searchUser(id: string) {
    return this.http.get<User[]>(`/users/search/${id}`);
  }
  getCalendarIDs() {
    return this.http.get<CalendarID[]>('/users/calendars/get');
  }
  deleteEvent(event: string, calendar: string) {
    return this.http.request('DELETE', '/events/remove', { responseType: 'text', body: {event, calendar} });
  }
  shareCalendar(calendarId: string, users: string[]) {
    return this.http.patch(`/calendars/${calendarId}/share`, { users: users});
    //open share modal
  }
  createEvent(submitEvent) {
    return this.http.request("POST", `/events/create`, { body: submitEvent });
  }

  getCalendar(id: string) {
    return this.http.get(`/calendars/${id}`);
  }

  getEvents() {
    return this.getCalendarIDs().pipe(switchMap((calendar: CalendarID[]) => {
      let observable$ = calendar.map(calendar => this.getCalendar(calendar._id));
      return Observable.forkJoin(observable$);
    }));
  }

  updateEvent(submitEvent) {
    return this.http.request("POST", '/events/update', { body: submitEvent});
  }
}
