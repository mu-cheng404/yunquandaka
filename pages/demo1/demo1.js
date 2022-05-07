Page({
  data: {
    current:1,
  },
  onTabsChange(e) {
    console.log(e)
    let key = e.detail.key
    this.setData({
      current:key
    })
  },
})
