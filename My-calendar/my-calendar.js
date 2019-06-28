Component({

  properties: {
    /**
     * @description 背景颜色
     */
    background:{
      type: String,
      value: "#fff",
    },
    /**
     * @description 是否需要阴影 
     */
    isShadow: {
      type: Boolean,
      value: true,
    },
    /**
     * @description 是否圆角
     */
    isRound: {
      type: Boolean,
      value: true
    },
    /**
     * @description 字体颜色
     */
    fontColor: {
      type: String,
      value: "#000"
    },
    /**
     * @description 日期单选模式下选中的日期颜色
     */
    touchColor: {
      type: String,
      value: "#409efe"
    },
    /**
     * @description 日期范围选择模式下，范围开始日期的颜色
     */
    rangeStartColor: {
      type: String,
      value: "#409efe"
    },
    /**
     * @description 日期范围选择模式下，处于范围之间的日期颜色
     */
    rangeColor: {
      type: String,
      value: "#a0cfff"
    },
    /**
     * @description 日期范围选择模式下，范围结束的日期颜色
     */
    rangeEndColor: {
      type: String,
      value: "#409efe"
    },
    /**
     * @deacription 标题
     */
    title: {
      type: String,
      value: "标题"
    },
    /**
     * @description 使用类型（范围选择还是仅选择日期） [ "touch" | "range" ]
     */
    useType: {
      type: String,
      value: "range",
      observer: function(newV, oldV){
        if(oldV != ""){
          this.init();
        }
      }
    },
    /**
     * @description 是否启用年份切换 
     */
    isChangeYear: {
      type: Boolean,
      value: false
    },
    /**
     * @description  确定按钮文字
     */
    confirmText: {
      type: String,
      value: "确定"
    },
    /**
     * @description  完成类型，分为选择出发完成 和 点击按钮出发完成
     */
    confirmType: {
      type: String,
      value: "button",//可选button和end
    },
    /**
     * @description  起始日期(useType === 'range'时可用)
     */
    start: {
      type: String,
      value: "",
      observer: function(newV, oldV){
        if(oldV != ""){//判断不让第一次初始化时候触发更新动作
          this.initRange();
        }
      }
    },
    /**
     * @description  结束日期(useType === 'range'时可用)
     */
    stop: {
      type: String,
      value: "",
      observer: function(newV, oldV){
        if(oldV != ""){//判断不让第一次初始化时候触发更新动作
          this.initRange();
        }
      }
    },
    /**
     * @description 最小选择日期 
     */
    min: {
      type: String,
      value: ""
    },
    /**
     * @description 最大选择日期 
     */
    max: {
      type: String,
      value: ""
    },
    /**
     * @description 指定可选日期（单选多选都可用）
     */
    actives: {
      type: Array,
      value: null
    },
    /**
     * @description 单选模式日期
     */
    date: {
      type: String,
      value: "",
      observer: function(newV, oldV) {
        if (oldV != "" && this.properties.useType === "touch") {
          this.initTouch();
        }
      }
    }

  },

  data: {

    begin: 0,//选择开始日期时间戳
    over: 0,//选择结束日期时间戳
    touch: 0,//为单选模式时候选择的日期
    spacingNum: 0,//日历开头空格数量
    days: [],//当月日期数据
    nowDate: {
      text: "",
      Y: 0,
      M: 0
    },
    activesChildType: null//单选模式下，actives传值子元素类型标记

  },

  ready () {
    this.init();
  },

  methods: {
    
    /**
     * @description 初始化 
     */
    init () {
      //单选模式
      if(this.properties.useType === "touch"){
        this.setData({type: "touch"});
        this.initTouch();
      }
      //范围选择模式
      if(this.properties.useType === "range"){
        this.setData({ type: "range" });
        this.initRange();
      }
    },

    /**
     * @description 单选初始化 
     */
    initTouch () {
      if(this.properties.date === ""){
        this.setData({touch: ""});
        this.setMonth();
      }else{
        if(!/^\d{4}-\d{2}-\d{2}$/.test(this.properties.date)){
          console.warn("[日历组件警告] 要使date传参生效，其值必须为xxxx-xx-xx日期字符串");
          this.setMonth();
          this.getMonthData();
          return;
        }
        const arr = this.properties.date.split("-"),
        date = new Date(arr[0], arr[1] - 1, arr[2]);
        this.setData({touch: date.getTime()});
        this.setMonth(date.getFullYear(), date.getMonth());
      }
      this.getMonthData();
    },

    /**
     * @description 范围选择初始化
     */
    initRange () {
      //显示开始日期
      if(this.properties.start === ""){
        this.setData({begin: 0});
        this.setMonth();
      }else{
        if (!/^\d{4}-\d{2}-\d{2}$/.test(this.properties.start)) {
          throw new Error("[日历组件报错] start传参错误，必须为xxxx-xx-xx日期字符串");
        }
        const arr = this.properties.start.split("-"),
        date = new Date(arr[0], arr[1] - 1, arr[2]);
        this.setData({begin: date.getTime()});
        this.setMonth(date.getFullYear(), date.getMonth());
      }
      //显示结束日期
      if(this.properties.stop === ""){
        this.setData({over: 0});
      }else{
        if (!/^\d{4}-\d{2}-\d{2}$/.test(this.properties.stop)) {
          throw new Error("[日历组件报错] stop传参错误，必须为xxxx-xx-xx日期字符串");
        }
        const arr = this.properties.stop.split("-"),
          date = new Date(arr[0], arr[1] - 1, arr[2]);
        if(date.getTime() <= this.data.begin){//结束小于等于开始
          this.setData({over: 0 });
        }else{
          this.setData({over: date.getTime() });
        }
      }
      this.getMonthData();
    },

    /**
     * @description 设置当前显示月份
     * @param {Number} y 年份
     * @param {Number} m 月份
     */
    setMonth (y, m) {
      if(y && m){
        const
          obj = new Date(y, m, 1),
          Y = obj.getFullYear(),
          M = obj.getMonth() + 1 < 10 ? "0" + (obj.getMonth() + 1) : obj.getMonth() + 1;
        this.setData({
          ["nowDate.text"]: `${Y}-${M}`,
          ["nowDate.Y"]: obj.getFullYear(),
          ["nowDate.M"]: obj.getMonth() + 1,
        });
      }else{
        const
          obj = new Date(),
          Y = obj.getFullYear(),
          M = obj.getMonth() + 1 < 10 ? "0" + (obj.getMonth() + 1) : obj.getMonth() + 1;
        this.setData({
          ["nowDate.text"]: `${Y}-${M}`,
          ["nowDate.Y"]: obj.getFullYear(),
          ["nowDate.M"]: obj.getMonth() + 1,
        });
      }
    },

    /**
     * @description 月份切换 
     */
    addOrSubMonth ({target:{dataset:{status}}}) {
      const 
      Y = this.data.nowDate.Y,
      M = this.data.nowDate.M;
      if(status === "+"){
        if(M === 12){
          this.setData({
            ["nowDate.Y"]: Y + 1,
            ["nowDate.M"]: 1,
            ["nowDate.text"]: `${Y + 1}-${1}`
          });
        }else{
          this.setData({
            ["nowDate.M"]: M + 1,
            ["nowDate.text"]: `${Y}-${M + 1}`
          });
        }
      }
      if(status === "-"){ 
        if(M === 1){
          this.setData({
            ["nowDate.Y"]: Y - 1,
            ["nowDate.M"]: 12,
            ["nowDate.text"]: `${Y - 1}-${12}`
          });
        }else{
          this.setData({
            ["nowDate.M"]: M - 1,
            ["nowDate.text"]: `${Y}-${M - 1}`
          });
        }
      }
      //执行获取天数的函数
      this.getMonthData();
    },

    /**
     * @description 年份切换 
     */
    addOrSubYear ({target:{dataset:{status}}}) {
      const 
      Y = this.data.nowDate.Y,
      M = this.data.nowDate.M;
      if (status === "-"){
        this.setData({
          ["nowDate.Y"]: Y - 1,
          ["nowDate.text"]: `${Y - 1}-${M}`
        });
      }
      if (status === "+"){
        this.setData({
          ["nowDate.Y"]: Y + 1,
          ["nowDate.text"]: `${Y + 1}-${M}`
        });
      }
      //执行获取天数的函数
      this.getMonthData();
    },

    /**
     * @description 获取月份里数据
     */
    getMonthData () {
      //获取当前选择的date对象
      const
      Y = this.data.nowDate.Y,
      M = this.data.nowDate.M,
      obj = new Date(Y, M - 1, 1);
      //获取并设置日历开头空格数量
      obj.setDate(1);
      const Day = obj.getDay();
      if(Day > 6){
        this.setData({spacingNum: 0});
      }else{
        this.setData({spacingNum: Day});
      }
      //获取该月每天对象
      obj.setMonth( M );//这里的M已经加过1了
      obj.setDate(0);
      const 
      dayNum = obj.getDate(),
      days = [];
      obj.setMonth(M - 1);
      for(let i = 0; i < dayNum; i++){
        obj.setDate(i + 1);
        const day = {
          date: i + 1,//号数
          day: obj.getDay(),//星期几
          time: obj.getTime(),//毫秒时间戳
          type: "",//选中类型
        }
        days.push(day);
      }
      this.setData({days: days});

      //执行设置min-max处理
      this.setMinMax();
      //执行设置actives处理
      this.setActives();
      //执行渲染样式
      this.renderStyle();
    },

    /**
     * @description 设置月份里mix-max选择范围 
     */
    setMinMax () {
      console.log(this.properties.actives);
      if (this.properties.actives && (this.properties.min || this.properties.max)) {
        this.throwErr("min、max属性不能跟actives属性同时使用");
        return;
      }
      if(!this.properties.min && !this.properties.max){
        return;
      }
      if(!/^\d{4}-\d{2}-\d{2}$/.test(this.properties.min) && this.properties.min != "now" && !this.properties.min != ""){
        console.warn("min属性只能为日期字符串或'now'");
        return;
      }
      if(!/^\d{4}-\d{2}-\d{2}$/.test(this.properties.max) && this.properties.max != ""){
        console.warn("max属性只能为日期字符串");
        return;
      }
      if(this.properties.min != "" && this.properties.max != ""){
        let minArr = this.properties.min.split("-"), maxArr = this.properties.max.split("-");
        if(new Date(minArr[0],minArr[1]-1, minArr[2]).getTime() >= new Date(maxArr[0], maxArr[1]-1, maxArr[2]).getTime() ){
          console.warn("max不能小于或等于min");
          return;
        }
      }
      let days = this.data.days;
      if(this.properties.min == "now"){
        let nowDate = new Date();
        nowDate.setHours(0);
        nowDate.setMinutes(0);
        nowDate.setSeconds(0);
        nowDate.setMilliseconds(0);
        let minTime = nowDate.getTime(), maxTime = "";
        if(this.properties.max != ""){
          let arr = this.properties.max.split("-");
          maxTime = new Date(arr[0], arr[1] - 1, arr[2]).getTime();
        }
        days.forEach(day=>{
          if(day.time < minTime){
            day.hide = true;
          }
          if(maxTime != ""){
            if(day.time > maxTime){
              day.hide = true;
            }
          }
        });
        this.setData({days: days});
      }else{
        let minTime = "", maxTime = "";
        if(this.properties.min != ""){
          let arr = this.properties.min.split("-");
          minTime = new Date(arr[0], arr[1] - 1, arr[2]).getTime();
        }
        if(this.properties.max != ""){
          let arr = this.properties.max.split("-");
          maxTime = new Date(arr[0], arr[1] - 1, arr[2]).getTime();
        }
        days.forEach(day=>{
          if(minTime != ""){
            if(day.time < minTime){
              day.hide = true;
            }
          }
          if(maxTime != ""){  
            if(day.time > maxTime){
              day.hide = true;
            }
          }
        });
        this.setData({days: days});//更新days
      }
    },

    /**
     * @description 设置月份里actives选择范围
     */
    setActives () {
      if (this.properties.useType === "range" && this.properties.actives) {
        this.throwErr("actives属性只能用于日期单选模式");
        return;
      }

      let actives = this.properties.actives;
      
      //检查参数，类型不对则退出执行，如果数组为空则全部不允许选择
      if (!(actives instanceof Array)) return;
      if (actives.length === 0) {
        let days = this.data.days;
        days.forEach(day=>{
          day.hide = true;
        });
        return;
      }

      //判断actives参数元素类型，并设置data中的标记； ‘xxxx-xx-xx’ or {date: xxxx-xx-xx, price: 123.00} 两种类型
      {
        let isString = true, isObj = true;
        for(let i of actives){
          if(typeof i === "string"){
            isObj = false;
          }
          if(typeof i === "object"){
            isString = false;
          }
        }
        if(!isString && !isObj) {
          this.throwErr("actives传参子元素只能为日期字符串或对象，请参阅相关说明");
          return;
        }
        if(isString) this.setData({activesChildType: "string"});
        if(isObj) this.setData({activesChildType: "object"});
      }
      
      //actives可能横跨多个月，截取当前所选择月份的actives元素,为后面的算法省时间
      let _actives = [];
      actives.forEach(date => {
        let _arr = [], _Y, _M, _D;
        if(this.data.activesChildType === "string"){
          _arr = date.split("-"), _Y = _arr[0], _M = _arr[1], _D = _arr[2];
        }
        if(this.data.activesChildType === "object"){
          _arr = date.date.split("-"), _Y = _arr[0], _M = _arr[1], _D = _arr[2];
        }
        if( (_Y == this.data.nowDate.Y) && (_M == this.data.nowDate.M) ){
          _actives.push({dayNum: _D, text: date.text || ""});
        }
      });
      
      //设置当月actives 设置当月那些天与actives里的数据匹配，则可以选择，反之不可以选择  
      let days = this.data.days, daysClone = JSON.parse(JSON.stringify(days));
      days.forEach(day=>{day.hide = true});//当月所有天都先初始化为不可选择
      for (let i = 0; i < daysClone.length; i++) {  // ！！！ 这个循环时间复杂度还可以优化，后面再考虑

        for (let j = 0; j < _actives.length; j++) {
          if (daysClone[i].date == _actives[j].dayNum) {//如果当月某天与_actives中的某天匹配，则将当月某天设置为可以选择，后续循环将不再匹配当月的这一天
            days[i].hide = false;
            this.data.activesChildType === "object" && (days[i].text = _actives[j].text);
            daysClone.splice(i, 1, null);
            break;
          }
        }

      }
      
      //更新days
      this.setData({days: days});
    },

    /**
     * @description 范围选择回调
     */
    select ({target:{dataset:{index}}}) {
      //选择起点
      if(this.data.begin == 0 || this.data.over != 0){
        this.setData({
          begin: this.data.days[index].time,
          over: 0
        });
        this.renderStyle();
      }
      //选择结束点
      else{
        //当选择的结束日期小于等于开始日期时，则重置开始日期为当前选择  
        if(this.data.days[index].time <= this.data.begin){
          this.setData({
            begin: this.data.days[index].time,
            over: 0
          });
          this.renderStyle();
          return;
        }
        this.setData({over: this.data.days[index].time});
        this.renderStyle();

        //confirmType为end时触发事件流程处理
        if(this.properties.confirmType == "end"){
          this.triggerEvent("confirm", { 
            begin:{
              text: this.timeToString(this.data.begin),
              time: this.data.begin
            },
            over: {
              text: this.timeToString(this.data.over),
              time: this.data.over
            }
          });
        }
      }
    },

    /**
     * @description 单选选择回调 
     */
    touch ({ currentTarget: {dataset: {index}} }) {
      const time = this.data.days[index].time;
      this.setData({touch: time});
      this.renderStyle();

      //confirmType为end时触发confirm事件
      if(this.properties.confirmType == "end"){
        this.triggerEvent("confirm", {
          text: this.timeToString(this.data.touch),
          time: this.data.touch
        });
      }
    },

    /**
     * @description confirm按钮回调
     */
    confirm () {
      if(this.properties.type == "range"){
        if(this.data.begin != 0 && this.data.over != 0){
          this.triggerEvent("confirm", {
            begin: {
              text: this.timeToString(this.data.begin),
              time: this.data.begin
            },
            over: {
              text: this.timeToString(this.data.over),
              time: this.data.over
            }
          });
        }
      }
      if(this.properties.type == "touch"){
        if(this.data.touch != 0){
          this.triggerEvent("confirm", {
              text: this.timeToString(this.data.touch),
              time: this.data.touch
          });
        }
      }
    },

    /**
     * @description cancel按钮回调 
     */
    cancel () {
      //防止重新选择后，取消，造成选中不跟随数据
      if(this.properties.useType == "touch"){
        this.initTouch();
      }
      if(this.properties.useType == "range"){
        this.initRange();
      }
      this.triggerEvent("cancel");
    },

    /**
     * @description 渲染日历选择后样式
     */
    renderStyle () {
      const 
      begin = this.data.begin,
      over = this.data.over,
      arr = this.data.days;

      //范围选择模式时
      if (this.properties.type == "range") {
        /*仅选择开始的时候*/
        if (begin != 0 && over == 0) {
          for (let i of arr) {
            i.type = "";
            if (i.time == begin) {
              i.type = "start-only";
            }
          }
          this.setData({ days: arr });
        }
        /*都选择的时候*/
        if (begin != 0 && over != 0) {
          for (let i of arr) {
            //每个日期在开始与结束范围之间的样式
            if (i.time < this.data.over && i.time > this.data.begin) {
              //日期框为星期6时（位置在最右侧）
              if (i.day === 6) {
                if (i.date === 1) {
                  i.type = "range-center";
                } else {
                  i.type = "range-right";
                }
              }
              //日期框为星期天时（位置在最左侧）
              else if (i.day === 0) {
                if(i.date === arr.length){
                  i.type = "range-center";
                }else{
                  i.type = "range-left";
                }
              }
              //日期为1号时
              else if(i.date === 1){
                i.type = "range-left";
              }
              //日期为该月随后一天时
              else if(i.date === arr.length){
                i.type = "range-right";
              }
              //以上都不是，则设置为range
              else{
                i.type = "range";
              }
            }
            //设置开头样式
            if (i.time == this.data.begin) {
              if(i.day === 6){//如果开始处于星期六（最后一个）
                i.type = "start-only";
              }
              else if (i.date == this.data.days.length) {//如果开始处于月末（月最后一个）
                i.type = "start-only";
              }else{
                i.type = "start";
              }
            }
            //设置结束样式
            if (i.time == this.data.over) {
              if(i.day === 0){//如果结束为星期天（第一个）
                i.type = "stop-only";
              }
              else if (i.day === 6 && i.date == 1) {//如果1号为星期六时
                i.type = "stop-only";
              }else{
                i.type = "stop";
              }
            }
          }
          this.setData({days: arr});
        }
      }
      //单选模式时候
      if (this.properties.type == "touch") { 
        arr.forEach(day=>{
          day.type = "";
          if(day.time == this.data.touch){
            //actives传参子元素为object的时候，就显示成方形样式（因为要显示价格参数）
            if(this.data.activesChildType === "object"){
              day.type = "actives-point";
            }
            //否则按照正常的单选选中样式处理
            else{
              day.type = "point";
            }
          }
        });
        this.setData({days: arr});
      }
    },

    /**
     * @description 时间戳转日期字符串
     * @param {String|Number} 时间戳
     * @return {String} 日期时间字符串；如：xxxx-xx-xx
     */
    timeToString (time) {
      const 
      date = new Date(Number(time)),
      Y = date.getFullYear(),
      M = date.getMonth()+1 < 10 ? "0"+(date.getMonth()+1) : date.getMonth()+1,
      D = date.getDate()<10 ? "0"+date.getDate() : date.getDate();
      return `${Y}-${M}-${D}`;
    },

    /**
     * @desciption 抛错函数
     * @param {String} msg 错误信息
     */
    throwErr (msg) {
      if (!msg) return;
      console.error("[my-calendar组件报错] " + msg);
    }

  }

});