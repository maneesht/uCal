import { Component, OnInit, ViewChild } from '@angular/core';
import {
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  endOfMonth,
  isSameDay,
  isSameMonth,
  addHours,
  addWeeks
} from 'date-fns';
import 'date-fns/add_weeks';
import { CalendarEvent, CalendarEventTitleFormatter } from 'angular-calendar';
import { CustomEventTitleFormatter } from './custom-event-title-formatter.provider';
import { NgbModal, ModalDismissReasons, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs/Subject';
import { HttpClient, HttpParams } from '@angular/common/http';

import { switchMap, concatMap, debounce, distinctUntilChanged, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operator/mergeMap';
import { CalendarEventAction } from 'angular-calendar';
import { CalendarService } from './calendar.service';
import { uCalendarEvent } from '../models/u-calendar-event.interface';
import { FormControl } from '@angular/forms';
import { timer } from 'rxjs/observable/timer';
import { of } from 'rxjs/observable/of';
import { GroupService } from '../group/group.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
  providers: [
    {
      provide: CalendarEventTitleFormatter,
      useClass: CustomEventTitleFormatter
    }
  ]
})

export class CalendarComponent implements OnInit {
  currentModal: NgbModalRef;
  description: string;
  searchGroup: (text$: Observable<string>) => Observable<any[]>;
  eventObservable: Observable<Object[]>;
  search: (text$: Observable<string>) => Observable<Object>;
  @ViewChild('content') public contentModal;
  members = [];
  newMember = new FormControl();
  group = new FormControl();
  activeDayIsOpen: boolean = false;
  calendarToShare: string;
  eventName: string;
  start: string;
  end: string;
  defaultStartDate: string;
  currentEventID: string;
  defaultEndDate: string;
  location: string;
  addEventError: string;
  startTime: string;
  endTime: string;
  calendarIdObservable: Observable<any>;
  events: CalendarEvent[] = [];
  editFlag: boolean;
  currentCalendar: string;

  refresh: Subject<any> = new Subject();
  constructor(private modalService: NgbModal, private calendarService: CalendarService, private groupService: GroupService) { }
  closeResult: string;

  clear() {
    this.editFlag = false;
    this.defaultStartDate = undefined;
    this.defaultEndDate = undefined;
    this.eventName = undefined;
    this.startTime = undefined;
    this.location = undefined;
    this.endTime = undefined;
    this.description = undefined;
  }
  open(content) {
    this.currentModal = this.modalService.open(content);
    this.currentModal.result.then((result) => {
      this.clear();
    }, (reason) => {
      this.clear();
    });
  }
  actions: CalendarEventAction[] = [
    {
      label: '<button class="btn btn-danger" style="margin-right: 10px" >Edit</button>',
      onClick: ({ event }: { event: uCalendarEvent }): void => {
        this.editFlag = true;
        this.currentCalendar = event.calendarID;
        this.currentEventID = String(event.id);
        this.setUpDates(event.start, event.end);
        this.setUpTimes(event.start, event.end);
        this.location = event.location.name;
        this.description = event.description;
        this.eventName = event.title;
        this.open(this.contentModal);
      }
    },
    {
      label: '<button class="btn btn-danger">X</button>',
      onClick: ({ event }: { event: uCalendarEvent }): void => {
        let index = this.events.indexOf(event);
        this.calendarIdObservable.subscribe(calendars => {
          this.calendarService.deleteEvent(<string>event.id, calendars[0]._id).subscribe(() => {
            this.events = this.events.filter(e => e !== event);
          })
        })
      }
    }
  ];
  addZero(time: number) {
    return time < 10 ? "0" + time : time;
  }
  formatTime(start: Date) {
    let hours = this.addZero(start.getHours());
    let minutes = this.addZero(start.getMinutes());
    return hours + ":" + minutes;
  }
  setUpTimes(start: Date, end: Date) {
    this.startTime = this.formatTime(start);
    this.endTime = this.formatTime(end);
  }
  dateFormatter(date: Date) {
    let month: string;
    let day: string;
    let m = date.getMonth() + 1;
    let d = date.getDate();
    if (m < 10) {
      month = "0" + m;
    } else {
      month = m + "";
    }
    if (d < 10) {
      day = "0" + d;
    } else {
      day = d + "";
    }
    return {month, day};
  }

  setUpDates(startDate: Date, endDate: Date) {
    if(!startDate || startDate.toDateString() === "Invalid Date") {
      return false;
    }
    let formattedStart = this.dateFormatter(startDate);
    let formattedEnd = this.dateFormatter(endDate);
    this.defaultStartDate = startDate.getFullYear() + "-" + formattedStart.month + "-" + formattedStart.day;
    this.defaultEndDate = endDate.getFullYear() + "-" + formattedEnd.month + "-" + formattedEnd.day;
    return true;
  }


  addEvent() {
    let startHours = this.startTime.split(":");
    let endHours = this.endTime.split(":");
    this.start = this.defaultStartDate;
    this.end = this.defaultEndDate;
    let eventStartDate = new Date(this.start);
    let eventEndDate = new Date(this.end);
    eventStartDate.setHours(+startHours[0], +startHours[1]);
    eventStartDate.setDate(eventStartDate.getDate() + 1);
    eventEndDate.setHours(+endHours[0], +endHours[1]);
    eventEndDate.setDate(eventEndDate.getDate() + 1);
    let test = new Date(this.start);
    this.addEventError = '';
   // if(eventEndDate.getTime() < eventStartDate.getTime()) { //End date could be before start date
     // this.addEventError = 'Start Date needs to be before End Date';
     // return false;
    //}
    this.calendarService.getCalendarIDs().subscribe(calendars => {
      let defaultCalendar = calendars[0]._id;
      let submitEvent = {name: this.eventName,
        date: {day: eventStartDate.getDate(), month: eventStartDate.getMonth(), year: eventStartDate.getFullYear() },
        allDay: false,
        endTime: { hour: eventEndDate.getHours(), minute: eventEndDate.getMinutes(), year: eventEndDate.getFullYear(), month: eventEndDate.getMonth(), day: eventEndDate.getDate() },
        location: {activated: false, name: undefined},
        rsvp: { activated: false },
        calendar: this.editFlag ? this.currentCalendar : defaultCalendar
      };
      if(this.location) {
        submitEvent.location = {
          name: this.location,
          activated: true
        }
      }
      if(this.editFlag)
        submitEvent['id'] = this.currentEventID;
      let observable = this.editFlag ? this.calendarService.updateEvent(submitEvent) : this.calendarService.createEvent(submitEvent);
      observable.subscribe(data => {
        console.log(data);
        if(!this.editFlag) {
          let event: uCalendarEvent = { description: data['description'], calendarID: data['calendar'],id: data['_id'], location: {name: this.location, activated: !!this.location}, start: eventStartDate, end: eventEndDate, title: this.eventName, color: { primary: "blue", secondary: "lightblue" }, actions: this.actions };
          this.events.push(event);
          this.refresh.next();
        } else {
          this.getData();
        }
        this.clear();
        this.currentModal.close();
      }, error => this.addEventError = error);
    });
  }
  formatter(x: {email: string, _id: string})  {
    return x.email;
  }
  select(obj) {
    let filtered = this.members.filter(member => member.email === obj.item.email);
    if(filtered.length === 0) {
      this.members.push(obj.item);
    }
    this.newMember.setValue('');
  }
  selectGroup(obj) {
    let members = obj.item.members;
    this.groupService.getGroup(obj.item._id).subscribe(data => {
      console.log(this.members);
      members.forEach((member, index) => {
        let obj = {
            _id: member,
            email: data.members[index]
          };
          let filtered = this.members.filter(member => member.email === obj.email);
        if (filtered.length === 0) {
          this.members.push(obj);
        }
      });
    });
    this.group.setValue('');
  }
  ngOnInit() {
    this.calendarIdObservable = this.calendarService.getCalendarIDs();
    this.search = ((text$: Observable<string>) =>
      text$
        .pipe(debounce(() => timer(200)), distinctUntilChanged(), switchMap(() =>
          !!this.newMember.value ? this.calendarService.searchUser(this.newMember.value) : of([])
        ))
    );
    this.searchGroup = ((text$: Observable<string>) =>
      text$
        .pipe(debounce(() => timer(200)), distinctUntilChanged(), switchMap(() =>
          !!this.group.value ? this.calendarService.searchGroup(this.group.value) : of([])
        ))
    );
    this.eventObservable = this.calendarService.getEvents();
    this.getData();
  }
  /* Unnecessary method to add a member to the toInvite array */
  addMember() {
    this.groupService.getUserByEmail(this.newMember.value).subscribe(user => this.members.push(user), (error) => this.members.push({ email: this.newMember.value, _id: 'abcde'}));
  }
  previous() {
    if(this.view === "week") {
      this.viewDate = addWeeks(this.viewDate, 2);
    }
  }
  next() {
    if(this.view === "day") {
      this.viewDate = addDays(this.viewDate, 1);
    }
  }
  getData() {
    this.eventObservable
      .subscribe(data => {
        this.events = [];
        data.forEach((calendar) => {
          let events: any[] = calendar['events'];
          let modifiedEvents: uCalendarEvent[] = events.map(event => {
            return {
              start: new Date(event.startTime.year, event.startTime.month, event.startTime.day, event.startTime.hour, event.startTime.minute),
              id: event._id,
              title: event.name,
              description: event.description,
              actions: this.actions,
              color: { primary: "blue", secondary: "lightblue" },
              location: event.location,
              calendarID: event.calendar,
              end: new Date(event.endTime.year, event.endTime.month, event.endTime.day, event.endTime.hour, event.endTime.minute)
            }
          });
          this.events = this.events.concat(modifiedEvents);
        });
        this.refresh.next();
    });
  }
  viewDate: Date = new Date();
  dayClicked({ date, events }: { date: Date; events: uCalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
        this.viewDate = date;
      }
    }
  }
  title = 'app';
  view = 'month';
  handleDay(day) {
    this.viewDate = day.date;
  }
  setView(view) {
    this.view = view;
  }
  shareCalendar() {
    this.calendarService.shareCalendar(this.calendarToShare, this.members).subscribe(() => this.currentModal.close());
  }

}
