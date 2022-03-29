// component/demo/demo.js
Component({
  /**
   * 组件的对外属性，是属性名到属性设置的映射表
   */
  properties: {
    // myProperty: { // 属性名
    //   type: String,
    //   value: ''
    // },
    // myProperty2: String, // 简化的定义方式
    name:{
      type:String,
      value:"姓名" 
    }
  },
  /**
   * 生命周期函数，可以为函数，或一个在methods段中定义的方法名
   */
  lifetimes: {
    attached: function () { },
    moved: function () { },
    detached: function () { },
  },
  /**
   * 组件的内部数据，和 properties 一同用于组件的模板渲染
   */
  data: {
    text:"我是示例数据",
  },

  /**
   * 组件的方法，包括事件响应函数和任意的自定义方法
   */
  methods: {

  }
})