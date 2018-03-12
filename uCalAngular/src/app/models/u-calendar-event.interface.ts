import { CalendarEvent } from "angular-calendar";

export interface uCalendarEvent extends CalendarEvent {
    calendarID: string;
    location: {
        activated: boolean;
        name?: string;
    };
    description: string;
}