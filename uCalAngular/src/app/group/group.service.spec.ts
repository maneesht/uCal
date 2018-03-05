import { TestBed, inject } from '@angular/core/testing';

import { GroupService } from './group.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('GroupService', () => {
  let httpMock: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GroupService],
      imports: [HttpClientTestingModule]
    });
    httpMock = TestBed.get(HttpTestingController);
  });

  it('should be created', inject([GroupService], (service: GroupService) => {
    expect(service).toBeTruthy();
  }));

  it('should get a group', inject([GroupService], (service: GroupService) => {
    expect(service).toBeTruthy();
    service.getGroup("Test-ID")
    .subscribe(res => {
      expect(res._id).toEqual('Test-ID');
    });
    let groupRequest = httpMock.expectOne(`/groups/Test-ID`);
    groupRequest.flush({_id:"Test-ID"});
    httpMock.verify();
  }));

  it('get a list of all groups and their details', inject([GroupService], (service: GroupService) => {
    expect(service).toBeTruthy();
    service.getGroups()
    .subscribe(res => {
      expect(res[0]._id).toEqual("Test-ID-A");
    });
    let groupsRequest = httpMock.expectOne(`/groups/`);
    groupsRequest.flush(["Test-ID-A","Test-ID-B","Test-ID-C"]);
    let groupsRequesta = httpMock.expectOne(`/groups/Test-ID-A`);
    groupsRequesta.flush({_id:"Test-ID-A"});
    let groupsRequestb = httpMock.expectOne(`/groups/Test-ID-B`);
    groupsRequestb.flush({_id:"Test-ID-B"});
    let groupsRequestc = httpMock.expectOne(`/groups/Test-ID-C`);
    groupsRequestc.flush({_id:"Test-ID-C"});
    httpMock.verify();
  }));
it('get a list of all groups and their details', inject([GroupService], (service: GroupService) => {
    expect(service).toBeTruthy();
    let group1 = { _id: "Test-ID-A", name: `Papa John's Official Wallyball Team`, members: ['asdf'],calendars: [], creator: 'a', invited: []};
    let group2 = { _id: "Test-ID-B", name: `The Avengers`, members: ['asdf'],calendars: [], creator: 'a', invited: []};
    let group3 = { _id: "Test-ID-c", name: `Justice League`, members: ['asdf'],calendars: [], creator: 'a', invited: []};
    service.getGroups()
      .subscribe(res => {
        expect(res).toEqual([group1, group2, group3]);
      });
    let groupsRequest = httpMock.expectOne(`/groups/`);
    groupsRequest.flush(["Test-ID-A","Test-ID-B","Test-ID-C"]);
    let groupsRequesta = httpMock.expectOne(`/groups/Test-ID-A`);
    groupsRequesta.flush(group1);
    let groupsRequestb = httpMock.expectOne(`/groups/Test-ID-B`);
    groupsRequestb.flush(group2);
    let groupsRequestc = httpMock.expectOne(`/groups/Test-ID-C`);
    groupsRequestc.flush(group3);
    httpMock.verify();
  }));
});
