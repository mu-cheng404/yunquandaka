"use strict";
var _baseComponent = _interopRequireDefault(require("../helpers/baseComponent")),
  _classNames2 = _interopRequireDefault(require("../helpers/classNames"));

function _interopRequireDefault(e) {
  return e && e.__esModule ? e : {
    default: e
  }
}

function _toConsumableArray(e) {
  return _arrayWithoutHoles(e) || _iterableToArray(e) || _nonIterableSpread()
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance")
}

function _iterableToArray(e) {
  if (Symbol.iterator in Object(e) || "[object Arguments]" === Object.prototype.toString.call(e)) return Array.from(e)
}

function _arrayWithoutHoles(e) {
  if (Array.isArray(e)) {
    for (var t = 0, a = new Array(e.length); t < e.length; t++) a[t] = e[t];
    return a
  }
}

function ownKeys(t, e) {
  var a = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function (e) {
      return Object.getOwnPropertyDescriptor(t, e).enumerable
    })), a.push.apply(a, r)
  }
  return a
}

function _objectSpread(t) {
  for (var e = 1; e < arguments.length; e++) {
    var a = null != arguments[e] ? arguments[e] : {};
    e % 2 ? ownKeys(a, !0).forEach(function (e) {
      _defineProperty(t, e, a[e])
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(a)) : ownKeys(a).forEach(function (e) {
      Object.defineProperty(t, e, Object.getOwnPropertyDescriptor(a, e))
    })
  }
  return t
}

function _defineProperty(e, t, a) {
  return t in e ? Object.defineProperty(e, t, {
    value: a,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : e[t] = a, e
}(0, _baseComponent.default)({
  properties: {
    prefixCls: {
      type: String,
      value: "wux-upload"
    },
    max: {
      type: Number,
      value: -1,
      observer: "updated"
    },
    count: {
      type: Number,
      value: 9,
      observer: "updated"
    },
    defaultFileType: {
      type: String,
      value: "image"
    },
    compressed: {
      type: Boolean,
      value: !0
    },
    maxDuration: {
      type: Number,
      value: 60
    },
    camera: {
      type: String,
      value: "back"
    },
    sizeType: {
      type: Array,
      value: ["original", "compressed"]
    },
    sourceType: {
      type: Array,
      value: ["album", "camera"]
    },
    url: {
      type: String,
      value: ""
    },
    name: {
      type: String,
      value: "file"
    },
    header: {
      type: Object,
      value: {}
    },
    formData: {
      type: Object,
      value: {}
    },
    uploaded: {
      type: Boolean,
      value: !0
    },
    disabled: {
      type: Boolean,
      value: !1
    },
    progress: {
      type: Boolean,
      value: !1
    },
    listType: {
      type: String,
      value: "text"
    },
    defaultFileList: {
      type: Array,
      value: []
    },
    fileList: {
      type: Array,
      value: [],
      observer: function (e) {
        this.data.controlled && this.setData({
          uploadFileList: e
        })
      }
    },
    controlled: {
      type: Boolean,
      value: !1
    },
    showUploadList: {
      type: Boolean,
      value: !0
    },
    showRemoveIcon: {
      type: Boolean,
      value: !0
    }
  },
  data: {
    uploadMax: -1,
    uploadCount: 9,
    uploadFileList: [],
    isVideo: !1
  },
  computed: {
    classes: ["prefixCls, disabled, listType", function (e, t, a) {
      var r;
      return {
        wrap: (0, _classNames2.default)(e, (_defineProperty(r = {}, "".concat(e, "--").concat(a), a), _defineProperty(r, "".concat(e, "--disabled"), t), r)),
        files: "".concat(e, "__files"),
        file: "".concat(e, "__file"),
        thumb: "".concat(e, "__thumb"),
        remove: "".concat(e, "__remove"),
        select: "".concat(e, "__select"),
        button: "".concat(e, "__button")
      }
    }]
  },
  methods: {
    updated: function () {
      var e = this.data,
        t = e.count,
        a = e.max,
        r = this.calcValue(t, a),
        o = r.uploadMax,
        i = r.uploadCount;
      this.data.uploadMax === o && this.data.uploadCount === i || this.setData({
        uploadMax: o,
        uploadCount: i
      })
    },
    calcValue: function (e, t) {
      var a = parseInt(e),
        r = -1 < parseInt(t) ? parseInt(t) : -1,
        o = a;
      return -1 !== r && r <= 9 && r < a && (o = r), {
        uploadMax: r,
        uploadCount: o
      }
    },
    onSelect: function () {
      function e(e) {
        e.tempFilePaths = e.tempFilePaths || [e.tempFilePath], t.tempFilePaths = e.tempFilePaths.map(function (e) {
          return {
            url: e,
            uid: t.getUid()
          }
        }), t.triggerEvent("before", _objectSpread({}, e, {
          fileList: u
        })), s && t.uploadFile()
      }
      var t = this,
        a = this.data,
        r = a.uploadCount,
        o = a.uploadMax,
        i = a.sizeType,
        n = a.sourceType,
        s = a.uploaded,
        l = a.disabled,
        u = a.uploadFileList,
        c = a.isVideo,
        p = a.compressed,
        d = a.maxDuration,
        f = a.camera,
        h = this.calcValue(r, o - u.length).uploadCount;
      l || (c ? wx.chooseVideo({
        sourceType: n,
        compressed: p,
        maxDuration: d,
        camera: f,
        success: e
      }) : wx.chooseImage({
        count: h,
        sizeType: i,
        sourceType: n,
        success: e
      }))
    },
    onChange: function (e) {
      var t = 0 < arguments.length && void 0 !== e ? e : {};
      this.data.controlled || this.setData({
        uploadFileList: t.fileList
      }), this.triggerEvent("change", t)
    },
    onStart: function (e) {
      var t = _objectSpread({}, e, {
        status: "uploading"
      });
      this.onChange({
        file: t,
        fileList: [].concat(_toConsumableArray(this.data.uploadFileList), [t])
      })
    },
    onSuccess: function (e, t) {
      var a = _toConsumableArray(this.data.uploadFileList),
        r = a.map(function (e) {
          return e.uid
        }).indexOf(e.uid);
      if (-1 !== r) {
        var o = _objectSpread({}, e, {
            status: "done",
            res: t
          }),
          i = {
            file: o,
            fileList: a
          };
        a.splice(r, 1, o), this.triggerEvent("success", i), this.onChange(i)
      }
    },
    onFail: function (e, t) {
      var a = _toConsumableArray(this.data.uploadFileList),
        r = a.map(function (e) {
          return e.uid
        }).indexOf(e.uid);
      if (-1 !== r) {
        var o = _objectSpread({}, e, {
            status: "error",
            res: t
          }),
          i = {
            file: o,
            fileList: a
          };
        a.splice(r, 1, o), this.triggerEvent("fail", i), this.onChange(i)
      }
    },
    onProgress: function (e, t) {
      var a = _toConsumableArray(this.data.uploadFileList),
        r = a.map(function (e) {
          return e.uid
        }).indexOf(e.uid);
      if (-1 !== r) {
        var o = _objectSpread({}, e, {
            progress: t.progress,
            res: t
          }),
          i = {
            file: o,
            fileList: a
          };
        a.splice(r, 1, o), this.triggerEvent("progress", i), this.onChange(i)
      }
    },
    uploadFile: function () {
      var t = this;
      if (this.tempFilePaths.length) {
        var e = this.data,
          a = e.url,
          r = e.name,
          o = e.header,
          i = e.formData,
          n = e.disabled,
          s = e.progress,
          l = this.tempFilePaths.shift(),
          u = l.uid,
          c = l.url;
        a && c && !n && (this.onStart(l), this.uploadTask[u] = wx.uploadFile({
          url: a,
          filePath: c,
          name: r,
          header: o,
          formData: i,
          success: function (e) {
            return t.onSuccess(l, e)
          },
          fail: function (e) {
            return t.onFail(l, e)
          },
          complete: function (e) {
            delete t.uploadTask[u], t.triggerEvent("complete", e), t.uploadFile()
          }
        }), s && this.uploadTask[u].onProgressUpdate(function (e) {
          return t.onProgress(l, e)
        }))
      }
    },
    onPreview: function (e) {
      this.triggerEvent("preview", _objectSpread({}, e.currentTarget.dataset, {
        fileList: this.data.uploadFileList
      }))
    },
    onRemove: function (e) {
      var t = e.currentTarget.dataset.file,
        a = _toConsumableArray(this.data.uploadFileList),
        r = a.map(function (e) {
          return e.uid
        }).indexOf(t.uid);
      if (-1 !== r) {
        var o = {
          file: _objectSpread({}, t, {
            status: "remove"
          }),
          fileList: a
        };
        a.splice(r, 1), this.triggerEvent("remove", _objectSpread({}, e.currentTarget.dataset, {}, o)), this.onChange(o)
      }
    },
    abort: function (e) {
      var t = this.uploadTask;
      e ? t[e] && (t[e].abort(), delete t[e]) : Object.keys(t).forEach(function (e) {
        t[e] && (t[e].abort(), delete t[e])
      })
    }
  },
  created: function () {
    var e = this;
    this.index = 0, this.createdAt = Date.now(), this.getUid = function () {
      return "wux-upload--".concat(e.createdAt, "-").concat(++e.index)
    }, this.uploadTask = {}, this.tempFilePaths = []
  },
  attached: function () {
    var e = this.data,
      t = e.defaultFileType,
      a = e.defaultFileList,
      r = e.fileList,
      o = e.controlled ? r : a,
      i = "video" === t;
    this.setData({
      uploadFileList: o,
      isVideo: i
    })
  },
  detached: function () {
    this.abort()
  }
});