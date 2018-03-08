import { TestBed, inject } from '@angular/core/testing';

import { CalendarService } from './calendar.service';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';

describe('CalendarService', () => {
  let httpMock: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CalendarService],
      imports: [HttpClientTestingModule]
    });
    httpMock = TestBed.get(HttpTestingController);
  });

  it('should be created', inject([CalendarService], (service: CalendarService) => {
    expect(service).toBeTruthy();
  }));

  it('should get calendar ids', inject([CalendarService], (service: CalendarService) => {
    expect(service).toBeTruthy();
    service.getCalendarIDs()
    .subscribe(res => {
      expect(res[0]._id).toEqual('Test-ID');
    });
    let calendarRequest = httpMock.expectOne('/users/calendars/get');
    calendarRequest.flush([{_id:'Test-ID'}]);
    httpMock.verify();
  }))
  
  it('should delete an event', inject([CalendarService], (service: CalendarService) => {
    expect(service).toBeTruthy();
    service.deleteEvent("Test-Event", "Test-Calendar")
    .subscribe(res => {
      expect(res).toEqual('event successfully deleted');
    });
    let calendarRequest = httpMock.expectOne({method: 'DELETE', url: '/events/remove'});
    calendarRequest.flush('event successfully deleted');
    httpMock.verify();
  }))

  it('should create an event', inject([CalendarService], (service: CalendarService) => {
    expect(service).toBeTruthy();
    let today = new Date("January 11, 2018 13:31:00");
    let submitEvent = {
        name: "name",
        date: {day: today.getDate(), month: today.getMonth, year: today.getFullYear },
        allDay: false,
        startTime: {hour: today.getHours(), minute: today.getMinutes(), year: today.getFullYear, month: today.getMonth(), day: today.getDate()},
        endTime: {hour: today.getHours(), minute: today.getMinutes(), year: today.getFullYear, month: today.getMonth(), day: today.getDate()},
        location: {name: 'Lawson', activated: true},
        rsvp: { activated: false },
        description: "",
        calendar: "ID"
    };
    service.createEvent(submitEvent)
    .subscribe(res => {
      expect(res).toEqual(submitEvent);
    });
    let calendarRequest = httpMock.expectOne({method: 'POST', url: '/events/create'});
    calendarRequest.flush(submitEvent);
    httpMock.verify();
  }))

  it('should get calendar', inject([CalendarService], (service: CalendarService) => {
    expect(service).toBeTruthy();
    service.getCalendar("id")
    .subscribe(res => {
      expect(res).toEqual('Test-ID');
    })
    let calendarRequest = httpMock.expectOne('/calendars/id');
    calendarRequest.flush("Test-ID");
    httpMock.verify();
  }))

  it('get a list of all events', inject([CalendarService], (service: CalendarService) => {
    expect(service).toBeTruthy();
    let event1 = { _id: "Test-ID-A", name: `Papa John's Official Wallyball Team`, members: ['asdf'],calendars: [], creator: 'a', invited: []};
    let event2 = { _id: "Test-ID-B", name: `The Avengers`, members: ['asdf'],calendars: [], creator: 'a', invited: []};
    let event3 = { _id: "Test-ID-c", name: `Justice League`, members: ['asdf'],calendars: [], creator: 'a', invited: []};
    service.getEvents()
      .subscribe(res => {
        expect(res).toEqual([event1, event2, event3]);
      });
    let groupsRequest = httpMock.expectOne(`/users/calendars/get`);
    groupsRequest.flush([{_id: "Test-ID-A"},{_id: "Test-ID-B"},{_id: "Test-ID-C"}]);
    let groupsRequesta = httpMock.expectOne(`/calendars/Test-ID-A`);
    groupsRequesta.flush(event1);
    let groupsRequestb = httpMock.expectOne(`/calendars/Test-ID-B`);
    groupsRequestb.flush(event2);
    let groupsRequestc = httpMock.expectOne(`/calendars/Test-ID-C`);
    groupsRequestc.flush(event3);
    httpMock.verify();
  }));
});


