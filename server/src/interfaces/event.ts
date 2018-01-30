interface Event {
    name: string,
    calendar: Calendar,
    day: number,
    month: number,
    year: number,
    description: string,
    rsvp: boolean,
    invites: User[],
    eventId: number
}