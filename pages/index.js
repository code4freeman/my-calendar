// pages/index.js
Page({


  data: {

    beginDate: "",
    endDate: "",

    calendarShow: false,//日历组件是否弹出
  },

  //日历组件点击确定回调
  calendarConfirm({detail:{begin:{text:begin},over:{text:end}}}){
    this.setData({
      calendarShow: false,
      beginDate: begin,
      endDate: end
    });
  },

  //日历组件点击取消回调
  calendarCancel(){
    this.setData({ calendarShow: false });
  },

  //日期显示框点击，弹出日历组件
  openCalendar(){
    this.setData({calendarShow: true});
  }

})