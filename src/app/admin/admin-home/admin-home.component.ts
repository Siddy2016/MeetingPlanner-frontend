import { Component, OnInit, OnDestroy } from '@angular/core';
import { Cookie } from 'ng2-cookies';
import { SocketService } from '../../socket.service';
import { Router } from '@angular/router';
import { UserService } from '../../user.service';
import { MeetingService } from '../../meeting.service';
import { ToastrService } from 'ngx-toastr';
import { CheckUser } from '../../models/checkUser';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css'],
  providers : [SocketService]
})
export class AdminHomeComponent implements OnInit, OnDestroy, CheckUser {

  public authToken:any;
  public userInfo: any;
  public allUsers:any;
  public pageValue:any=0;
  public loadingMoreUsers:boolean = false;
  constructor(private userService: UserService,private meetingService:MeetingService, private socketService: SocketService,private router: Router,private toastrService: ToastrService) { }

  ngOnInit() {
    if(this.checkStatus()){
      this.userInfo = this.userService.getUserInfoInLocalStorage()
      //check if username has -admin in its name then keep the user on the page else redirect to user page
      if (!/\w*-admin\b/.test(this.userInfo.userName)) {
        this.router.navigate(['/home'])
      } else {
        this.authToken = Cookie.get('authToken')
        this.verifyUserConfirmation()
        this.pageValue = 0
        this.getAllUsers()
        this.authError()
      }
    } else {
      this.router.navigate(['/login'])
    }
  }

  public checkStatus: any = () => {
    if(Cookie.get('authToken')===undefined || Cookie.get('authToken')===null || Cookie.get('authToken')===''){
      return false
    } else {
      return true
    }
  }

  public verifyUserConfirmation: any = () => {
    this.socketService.verifyUser().subscribe(
      data=>{
        this.socketService.setAdmin(this.authToken)
      }
    )
  }

  public getAllUsers:any = () =>{
    this.meetingService.getAllUsers(this.pageValue).subscribe(
      data=>{
        this.allUsers = data['data']
      }
    )
  }

  public loadMoreUsers: any = () => {
    this.loadingMoreUsers = true;
    this.pageValue++;
    this.getMoreUsers()
  }

  public getMoreUsers: any = () => {
    this.meetingService.getAllUsers(this.pageValue * 10).subscribe(
      apiResponse => {
        if (apiResponse.status == 200) {
          this.allUsers = this.allUsers.concat(apiResponse.data)
        } else {
          this.toastrService.warning('No more Users left')
        }

      }, err => {
        console.log(err.message)
      }
    )
    this.loadingMoreUsers = false;
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

  // logs out the user if user tries to manipulate the username or non access of the page
  public authError:any = () =>{
    this.socketService.authError().subscribe(
      data=>{
        Cookie.delete('authToken','/')
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
