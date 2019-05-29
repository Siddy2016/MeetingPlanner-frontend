import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, filter, catchError, mergeMap } from 'rxjs/operators';
import { Cookie } from 'ng2-cookies';

@Injectable({
  providedIn: 'root'
})
export class MeetingService {
  private baseUrl = 'http://api.meetingplanner.ml/api/v1/meetings'

  constructor(private http : HttpClient) { }

  public getAllUsers(pageValue):Observable<any>{
    return this.http.get(`${this.baseUrl}/allusers?skip=${pageValue}&authToken=${Cookie.get('authToken')}`)
  }

  public getAllUserMeetings(userId):Observable<any>{
    return this.http.get(`${this.baseUrl}/userMeetings/${userId}?authToken=${Cookie.get('authToken')}`)
    .pipe(map(
     meetingObject =>{
       if(meetingObject['status']==200){
        meetingObject['data'].forEach(
          i=>{
             i.start = new Date(i.start)
             i.end = new Date(i.end)
          }
        )
       }
        return meetingObject
      }
    ))
  }
}
