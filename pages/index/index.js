Page({
  data: {
    start: "",
    stop: "",
    theme: null,
    themes: {
      green: {
        bg: "#67C23A",
        fontColor: "#fff",
        rangeStartColor: "#F56C6C",
        rangeColor: "#fde2f2",
        rangeEndColor: "#F56C6C"
      },
      pink: {
        bg: "#F56C6C",
        fontColor: "#fff",
        rangeStartColor: "#67C23A",
        rangeColor: "#e1f3d8",
        rangeEndColor: "#67C23A"
      },
      blue: {
        bg: "#409efe",
        fontColor: "#fff",
        rangeStartColor: "#79bbff",
        rangeColor: "#b3d8ff",
        rangeEndColor: "#79bbff"
      }
    },
    items: [
      { name: 'green', value: '绿色', checked: true },
      { name: 'pink', value: '粉色' },
      { name: 'blue', value: '蓝色' }
    ]
  },
  onLoad () {
    this.setData({
      theme: this.data.themes.green
    });
  },

  radioChange: function (e) {
    this.setData({
      theme: this.data.themes[e.detail.value]
    });
  },

  select ({detail: {begin: {text: brgin}, over: {text: over}}}) {
    this.setData({
      start: begin,
      stop: over
    });
  }
})