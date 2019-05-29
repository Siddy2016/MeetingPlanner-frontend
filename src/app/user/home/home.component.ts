import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { formatDate } from '@angular/common'
import { SocketService } from '../../socket.service';
import { UserService } from '../../user.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Cookie } from 'ng2-cookies';
import { CalendarEvent, CalendarView } from 'angular-calendar';
import { MeetingService } from '../../meeting.service';
import { Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CheckUser } from '../../models/checkUser';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers : [SocketService]
})
export class HomeComponent implements OnInit, CheckUser {
  @ViewChild('modalContent')
  public modalContent: TemplateRef<any>;
  @ViewChild('modalReminder')
  public modalReminder: TemplateRef<any>;
  public reminderContent:any;
  public authToken: any;
  public userInfo: any;
  public meetingData:any;
  public refresh: Subject<any> = new Subject();
  public viewDate: Date = new Date(); // setting current date tab in calendar
  public events:any=[]; // declaring array of events
  public view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView
  constructor(private socketService: SocketService, private userService: UserService,private meetingService:MeetingService, private router: Router, private toastrService: ToastrService, private modal:NgbModal) { }
  ngOnInit() {
    if (this.checkStatus()) {
      this.userInfo = this.userService.getUserInfoInLocalStorage()
      if (/\w*-admin\b/.test(this.userInfo.userName)) {
        this.router.navigate(['/admin/home'])
      } else {
        this.authToken = Cookie.get('authToken')
        this.verifyUserConfirmation()
        this.getUserMeetings()
        this.updateMeetingOnDashboard()
        this.deleteMeetingFromDashboard()
        this.meetingReminder()
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
        this.socketService.setUser(this.authToken)
      }
    )
  }

  public goToHome:any = () =>{
    this.view = CalendarView.Month;
    this.viewDate = new Date()
    this.router.navigate(['/home'])
  }

  public dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
      this.viewDate = date;
  }

  public handleEvent(action: string, event: any): void {
    this.meetingData = { action, event }
    this.modal.open(this.modalContent, { centered: true });
  }

  public getUserMeetings:any = () =>{
    this.meetingService.getAllUserMeetings(this.userInfo.userId).subscribe(
      apiResponse =>{
        if(apiResponse.status === 200){
          this.events = apiResponse.data
        } else {
          this.toastrService.warning('No meeting is scheduled yet by admin')
        }
      }
    )
  }

  public updateMeetingOnDashboard:any = () =>{
    this.socketService.updateMeetingDashboard().subscribe(
      apiResponse=>{
        if(apiResponse.status === 200){
          //check if array exists
          if(!Array.isArray(this.events)){
            this.events=[]
          }
          let foundEvent = this.events.map(function (event) { return event.meetingId }).indexOf(apiResponse.data.meetingId)
          if(foundEvent===-1){
            this.events.push(apiResponse.data)
            this.toastrService.success(`<b>Title: </b>${apiResponse.data.title}<br><b>Venue: </b>${apiResponse.data.place}<br><b>Start: </b>${formatDate(apiResponse.data.start, 'd MMM hh:mm a', 'en')}<br><b>End: </b>${formatDate(apiResponse.data.end, 'd MMM hh:mm a', 'en')}`,'A meeting is CREATED by ' + apiResponse.data.adminFullName,{enableHtml:true,disableTimeOut:true, closeButton:true})
          } else {
            this.events[foundEvent] = apiResponse.data
            this.toastrService.success(`<b>Title: </b>${apiResponse.data.title}<br><b>Venue: </b>${apiResponse.data.place}<br><b>Start: </b>${formatDate(apiResponse.data.start, 'd MMM hh:mm a', 'en')}<br><b>End: </b>${formatDate(apiResponse.data.end, 'd MMM hh:mm a', 'en')}`,'Meeting UPDATED',{enableHtml:true,disableTimeOut:true,closeButton:true})
          }
          this.refresh.next()
        } else {
          this.toastrService.error(apiResponse.message)
        }
      }
    )
  }

  public deleteMeetingFromDashboard:any = () =>{
    this.socketService.deleteMeetingDashboard().subscribe(
      apiResponse=>{
        if(apiResponse.status === 200){
          //check if array exists
          if(!Array.isArray(this.events)){
            this.events=[]
          }
          let foundEvent = this.events.map(function (event) { return event.meetingId }).indexOf(apiResponse.data.meetingId)
          if(foundEvent!==-1){
            this.events.splice(foundEvent,1)
            this.toastrService.success(`<b>Title: </b>${apiResponse.data.title}<br><b>Venue: </b>${apiResponse.data.place}<br><b>Start: </b>${formatDate(apiResponse.data.start, 'd MMM hh:mm a', 'en')}<br><b>End: </b>${formatDate(apiResponse.data.end, 'd MMM hh:mm a', 'en')}`,'Meeting DELETED',{enableHtml:true,disableTimeOut:true, closeButton:true})
          }
          this.refresh.next()
        } else {
          this.toastrService.error(apiResponse.message)
        }
      }
    )
  }

  public meetingReminder:any = () =>{
    this.socketService.meetingReminder(this.userInfo.userId).subscribe(
      data=>{
        this.reminderContent = data;
        this.modal.open(this.modalReminder, { centered: true });
      }
    )
  }

  public recallReminderModal:any = () =>{
    this.toastrService.success('Reminder is snoozed for 5 seconds')
    setTimeout(()=>{
      this.modal.open(this.modalReminder, { centered: true });
    },5000)
  }

  public logout: any = () => {
    this.userService.logout(this.userInfo).subscribe(
      data => {
        if (data.status == 200) {
          Cookie.delete('authToken','/')
          Cookie.delete('authToken','/admin')
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
