import { Component, OnInit, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { Cookie } from 'ng2-cookies';
import { SocketService } from '../../socket.service';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../user.service';
import { MeetingService } from '../../meeting.service';
import { ToastrService } from 'ngx-toastr';
import { CalendarEvent, CalendarView } from 'angular-calendar';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import $ from 'jquery';
import { Subject } from 'rxjs';
import { CheckUser } from '../../models/checkUser';
import { Meeting } from '../../models/meeting';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-user-meeting',
  templateUrl: './user-meeting.component.html',
  styleUrls: ['./user-meeting.component.css'],
  providers: [SocketService]
})
export class UserMeetingComponent implements OnInit, OnDestroy, CheckUser {
  @ViewChild('modalContent')
  public modalContent: TemplateRef<any>;
  public pageFound:boolean;
  public authToken: any;
  public userInfo: any;
  public startTime: any;
  public endTime: any;
  public user:any;
  public meetingTitle: any;
  public meetingVenue: any;
  public meetingData: any;
  public readOnly: any;
  public refresh: Subject<any> = new Subject();
  public viewDate: Date = new Date(); // setting current date tab in calendar
  public events: any = []; // declaring array of events
  public view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView
  constructor(private userService: UserService, private meetingService: MeetingService, private socketService: SocketService, private router: Router, private activatedRoute: ActivatedRoute, private toastrService: ToastrService, private modal: NgbModal) { }

  ngOnInit() {
    if (this.checkStatus()) {
      this.userInfo = this.userService.getUserInfoInLocalStorage()
      //check if username has -admin in its name then keep the user on the page else redirect to user page
      if (!/\w*-admin\b/.test(this.userInfo.userName)) {
        this.router.navigate(['/home'])
      } else {
        this.authToken = Cookie.get('authToken')
        this.verifyUserConfirmation()
        this.getUserDetails()
        this.joinCurrentDashboard()
        this.updateMeetingToDashboard()
        this.deleteMeetingFromDashboard()
        this.setDefaultTimings()
        this.authError()
      }
    } else {
      this.router.navigate(['/login'])
    }
  }

  public checkStatus: any = () => {
    if (Cookie.get('authToken') === undefined || Cookie.get('authToken') === null || Cookie.get('authToken') === '') {
      return false
    } else {
      return true
    }
  }

  public verifyUserConfirmation: any = () => {
    this.socketService.verifyUser().subscribe(
      data => {
        this.socketService.setAdmin(this.authToken)
      }
    )
  }

  public joinCurrentDashboard: any = () => {
    this.socketService.startRoom().subscribe(
      data => {
        this.socketService.joinRoom(this.activatedRoute.snapshot.paramMap.get('userId'))
      }
    )
  }

  public getUserDetails:any = () =>{
    this.userService.getUser(this.activatedRoute.snapshot.paramMap.get('userId')).subscribe(
      apiResponse => {
        if(apiResponse.status === 200){
          this.user = apiResponse.data
          this.pageFound = true
          this.getUserMeetings()
        } else {
          this.pageFound=false;
        }
      }
    )
  }

  public setDefaultTimings: any = () => {
    // setting start time to current time
    this.startTime = new Date()
    //setting end time to one hour ahead of current time
    this.endTime = new Date()
    this.endTime.setMinutes(this.endTime.getMinutes() + 60)
    // this.viewDate = this.startTime
  }

  public currentTimeOnly:any = () =>{
    this.startTime = new Date(this.startTime.getFullYear(), this.startTime.getMonth(), this.startTime.getDate(), new Date().getHours(), new Date().getMinutes())
    this.endTime = new Date(this.endTime.getFullYear(), this.endTime.getMonth(), this.endTime.getDate(), new Date().getHours(), new Date().getMinutes()+60)
  }

  public goToHome: any = () => {
    this.view = CalendarView.Month;
    this.viewDate = new Date()
    this.router.navigate(['/admin/home'])
  }

  public dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): any {
    this.viewDate = date;
    this.startTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), new Date().getHours(), new Date().getMinutes())
    this.endTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), new Date().getHours() + 1, new Date().getMinutes())
  }

  public createMeetingFunction: any = () => {
    let meeting:Meeting = {
      adminId: this.userInfo.userId,
      adminFullName: this.userInfo.fullName,
      adminUserName: this.userInfo.userName,
      userId: this.activatedRoute.snapshot.paramMap.get('userId'),
      userFullName : (this.user.firstName + ' ' + this.user.lastName).trim(),
      userEmail : this.user.email,
      start: new Date(this.startTime.getFullYear(), this.startTime.getMonth(), this.startTime.getDate(), this.startTime.getHours(), this.startTime.getMinutes(), this.startTime.getSeconds()),
      end: new Date(this.endTime.getFullYear(), this.endTime.getMonth(), this.endTime.getDate(), this.endTime.getHours(), this.endTime.getMinutes(), this.endTime.getSeconds()),
      place: this.meetingVenue,
      title: this.meetingTitle
    }
    $('#createMeetingModal .cancel').click();
    if (Math.floor((this.endTime.getTime() - this.startTime.getTime())) / 60000 > 0) {
      this.socketService.createMeeting(meeting)
    } else {
      this.toastrService.error('End time must be greater than the start time')
    }
  }

  public updateMeetingToDashboard: any = () => {
    this.socketService.updateMeetingDashboard().subscribe(
      apiResponse => {
        if (apiResponse.status === 200) {
          //check if array exists
          if (!Array.isArray(this.events)) {
            this.events = []
          }
          let foundEvent = this.events.map(function (event) { return event.meetingId }).indexOf(apiResponse.data.meetingId)
          if (foundEvent === -1) {
            this.events.push(apiResponse.data)
            if (apiResponse.data.adminId == this.userInfo.userId) {
              this.toastrService.success('Meeting successfully created for ' + (this.user.firstName + ' ' + this.user.lastName).trim())
            } else {
              this.toastrService.success(`<b>Title: </b>${apiResponse.data.title}<br><b>Venue: </b>${apiResponse.data.place}<br><b>Start: </b>${formatDate(apiResponse.data.start, 'd MMM hh:mm a', 'en')}<br><b>End: </b>${formatDate(apiResponse.data.end, 'd MMM hh:mm a', 'en')}`,'A meeting is CREATED by ' + apiResponse.data.adminFullName,{enableHtml:true,disableTimeOut:true,closeButton:true})
            }
          } else {
            this.events[foundEvent] = apiResponse.data
            if (apiResponse.data.adminId == this.userInfo.userId) {
              this.toastrService.success('Meeting successfully updated for '+(this.user.firstName + ' ' + this.user.lastName).trim())
            } else {
              this.toastrService.success(`<b>Title: </b>${apiResponse.data.title}<br><b>Venue: </b>${apiResponse.data.place}<br><b>Start: </b>${formatDate(apiResponse.data.start, 'd MMM hh:mm a', 'en')}<br><b>End: </b>${formatDate(apiResponse.data.end, 'd MMM hh:mm a', 'en')}`,'Meeting UPDATED',{enableHtml:true,disableTimeOut:true, closeButton:true})
            }
          }
          this.refresh.next()
        } else {
          this.toastrService.error(apiResponse.message)
        }
      }
    )
  }

  public deleteMeetingFromDashboard: any = () => {
    this.socketService.deleteMeetingDashboard().subscribe(
      apiResponse => {
        if (apiResponse.status === 200) {
          //check if array exists
          if (!Array.isArray(this.events)) {
            this.events = []
          }
          let foundEvent = this.events.map(function (event) { return event.meetingId }).indexOf(apiResponse.data.meetingId)
          if (foundEvent !== -1) {
            this.events.splice(foundEvent, 1)
            if (apiResponse.data.adminId == this.userInfo.userId) {
              this.toastrService.success('Meeting successfully deleted')
            } else {
              this.toastrService.success(`<b>Title: </b>${apiResponse.data.title}<br><b>Venue: </b>${apiResponse.data.place}<br><b>Start: </b>${formatDate(apiResponse.data.start, 'd MMM hh:mm a', 'en')}<br><b>End: </b>${formatDate(apiResponse.data.end, 'd MMM hh:mm a', 'en')}`,'Meeting DELETED',{enableHtml:true,disableTimeOut:true, closeButton:true})
            }
          }
          this.refresh.next()
        } else {
          this.toastrService.error(apiResponse.message)
        }
      }
    )
  }

  public validateCreateMeeting: any = () => {
    if (new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), this.viewDate.getDate()) >= new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())) {
      return true
    }
    return false
  }

  public changeStartEndOnDayChange: any = () => {
    this.startTime = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), this.viewDate.getDate(), new Date().getHours(), new Date().getMinutes())
    this.endTime = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), this.viewDate.getDate(), new Date().getHours() + 1, new Date().getMinutes())
  }

  public getUserMeetings: any = () => {
    this.meetingService.getAllUserMeetings(this.activatedRoute.snapshot.paramMap.get('userId')).subscribe(
      apiResponse => {
        if (apiResponse.status === 200) {
          this.events = apiResponse.data
        } else {
          this.toastrService.warning('No Meeting is scheduled yet for this user')
        }
      }
    )
  }

  public handleEvent(action: string, event: any): void {
    this.meetingData = { action, event }
    this.startTime = this.meetingData.event.start
    this.endTime = this.meetingData.event.end
    this.meetingTitle = this.meetingData.event.title
    this.meetingVenue = this.meetingData.event.place
    this.readOnly = true;
    this.modal.open(this.modalContent, { centered: true });
  }

  public deleteMeeting: any = (meeting) => {
    this.socketService.deleteMeeting(meeting)
    $('#deleteMeetingModal .cancel').click();
  }

  public editMeeting: any = () => {
    if (Math.floor((this.endTime.getTime() - this.startTime.getTime())) / 60000 > 0) {
      this.meetingData.event.start = this.startTime
    this.meetingData.event.end = this.endTime
    this.meetingData.event.title = this.meetingTitle
    this.meetingData.event.place = this.meetingVenue
      this.socketService.updateMeeting(this.meetingData.event)
    $('#deleteMeetingModal .cancel').click();
    } else {
      this.toastrService.error('End time must be greater than the start time')
    }
  }

  public logout: any = () => {
    this.userService.logout(this.userInfo).subscribe(
      data => {
        if (data.status == 200) {
          Cookie.delete('authToken', '/')
          Cookie.delete('authToken', '/admin')
          Cookie.delete('authToken', '/admin/meeting')
          localStorage.clear()
          this.socketService.disconnect();
          this.router.navigate(['/login'])
        } else {
          this.toastrService.warning(data.message)
        }
      }, err => {
        this.toastrService.error(err.message)
      }
    )
  }

  // logs out the user if user tries to manipulate the username or non access of the page
  public authError: any = () => {
    this.socketService.authError().subscribe(
      data => {
        Cookie.delete('authToken', '/')
        Cookie.delete('authToken', '/admin')
        Cookie.delete('authToken', '/admin/meeting')
        this.router.navigate(['/login'])
      }
    )
  }

  ngOnDestroy() {
    this.socketService.disconnect()
  }

}
