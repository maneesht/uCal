export interface Group {
  _id?: string;
  name: string;
  calendars: string[];
  creator: string;
  invited: string[];
  members: string[];
}
