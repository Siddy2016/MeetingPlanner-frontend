export interface Meeting {
    meetingId?: string,
    adminId: string,
      adminFullName: string,
      adminUserName: string,
      userId: string,
      userFullName : string,
      userEmail : string,
      start: Date,
      end: Date,
      place: string,
      title: string
}