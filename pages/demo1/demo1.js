Page({
  data: {
    current: 'tab1',
    tabs: [
      {
        key: 'tab1',
        title: '已打卡',
      },
      {
        key: 'tab2',
        title: '未打卡',
      },
      {
        key: 'tab3',
        title: '其他',
      },
    ],
  },
  onTabsChange(e) {
    console.log('onTabsChange', e)
    const { key } = e.detail
    const index = this.data.tabs.map((n) => n.key).indexOf(key)

    this.setData({
      key,
      index,
    })
  },
  onSwiperChange(e) {
    console.log('onSwiperChange', e)
    const { current: index, source } = e.detail
    const { key } = this.data.tabs[index]

    if (!!source) {
      this.setData({
        key,
        index,
      })
    }
  },
})
