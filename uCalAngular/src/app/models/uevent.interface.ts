export interface UEvent {
      name: {
        type: String,
        required: true
      },
      date: {
        day: Number,
        month: Number,
        year: Number
      },
      allDay: Boolean,
      startTime: {
        day: Number,
        month: Number,
        year: Number,
        hour: Number,
        minute: Number
      },
      endTime: {
        day: Number,
        month: Number,
        year: Number,
        hour: Number,
        minute: Number
      },
      location: {
        name: String,
        longitude: Number,
        latitude: Number
      },
      description: String,
      owner: string,
      calendar: string,
      invites: string,
      rsvp: {
        required: false,
        accepted: string,
        declined: string,
        noResponse: string,
      }
    }