import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarComponent } from './calendar.component';
import { By } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CalendarModule } from 'angular-calendar';
import { FormsModule } from '@angular/forms';

describe('CalendarComponent', () => {
  let comp: CalendarComponent;
  let fixture: ComponentFixture<CalendarComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalendarComponent ],
      imports: [NgbModule, CalendarModule.forRoot(), FormsModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalendarComponent);
    comp = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(comp).toBeTruthy();
  });
  it('should render month/year in a h2 tag', async(() => {
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    let date = new Date();
    let month = date.toLocaleString('en-us', {month: 'long'});
    let year = date.getFullYear();
    expect(compiled.querySelector('h2').textContent).toContain(`${month} ${year}`);
  }));
  it('should update view when clicking on week', async(() => {
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    // query selects week button by looking for input with the value of week
    const weekButton = fixture.debugElement.query(By.css('input[value="week"]'));
    weekButton.nativeElement.click();
    fixture.detectChanges();
    expect(comp.view).toEqual('week');
  }));
  it('should update view when clicking on day', async(() => {
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    // query selects day button by looking for input with the value of day
    const dayButton = fixture.debugElement.query(By.css('input[value="day"]'));
    dayButton.nativeElement.click();
    fixture.detectChanges();
    expect(comp.view).toEqual('day');
  }));
  it('should update view when clicking on month', async(() => {
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    // query selects month button by looking for input with the value of month
    const monthButton = fixture.debugElement.query(By.css('input[value="month"]'));
    monthButton.nativeElement.click();
    fixture.detectChanges();
    expect(comp.view).toEqual('month');
  }));
});
