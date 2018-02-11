import { Component, OnInit } from '@angular/core';
import {
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  endOfMonth,
  isSameDay,
  isSameMonth,
  addHours
} from 'date-fns';
import { CalendarEvent, CalendarEventTitleFormatter } from 'angular-calendar';
import { CustomEventTitleFormatter } from './custom-event-title-formatter.provider';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs/Subject';




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
  activeDayIsOpen: boolean = false;
  eventName: string;
  start: string;
  end: string;
  defaultStartDate: string;
  defaultEndDate: string;
  eventStartDate: Date;
  eventEndDate: Date;
  startTime: string;
  endTime: string;

  events: CalendarEvent[] = [
    {
      start: new Date(2018, 1, 14, 13, 30),
      end: new Date(2018, 1, 15, 9, 30),
      title: 'Lunch with Manu',
      color: { primary: "blue", secondary: "lightblue" }
    }];

  refresh: Subject<any> = new Subject();
  constructor(private modalService: NgbModal) { }
  closeResult: string;

  open(content) {
    this.modalService.open(content).result.then((result) => {
    }, (reason) => {
    });
  }
  addDates(date: Date) {
    if(!date || date.toDateString() === "Invalid Date") {
      return false;
    }
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
    this.defaultStartDate = date.getFullYear() + "-" + month + "-" + day;
    this.defaultEndDate = date.getFullYear() + "-" + month + "-" + day;
    return true;
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  addEvent() {
    console.log("Start time: " + this.startTime);
    console.log("End time: " + this.endTime);
    let startHours = this.startTime.split(":");
    console.log(startHours);
    let endHours = this.endTime.split(":");
    this.start = this.defaultStartDate;
    this.end = this.defaultEndDate;
    this.eventStartDate = new Date(this.start);
    this.eventEndDate = new Date(this.end);
    this.eventStartDate.setHours(+startHours[0], +startHours[1]);
    this.eventStartDate.setDate(this.eventStartDate.getDate() + 1);
    this.eventEndDate.setHours(+endHours[0], +endHours[1]);
    this.eventEndDate.setDate(this.eventEndDate.getDate() + 1);
    let test = new Date(this.start);
    this.events.push({ start: this.eventStartDate, end: this.eventEndDate, title: this.eventName, color: { primary: "blue", secondary: "lightblue" } });
    this.refresh.next();
    console.log(this.events);
  }

  ngOnInit() {
    //this.http.get('/api/get-events').subscribe(resp => console.log(resp));
  }
  viewDate: Date = new Date();
  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
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
}
