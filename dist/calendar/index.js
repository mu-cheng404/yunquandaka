"use strict";
var _baseComponent = _interopRequireDefault(require("../helpers/baseComponent")),
  _classNames4 = _interopRequireDefault(require("../helpers/classNames"));

function _interopRequireDefault(t) {
  return t && t.__esModule ? t : {
    default: t
  }
}

function _toConsumableArray(t) {
  return _arrayWithoutHoles(t) || _iterableToArray(t) || _nonIterableSpread()
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance")
}

function _iterableToArray(t) {
  if (Symbol.iterator in Object(t) || "[object Arguments]" === Object.prototype.toString.call(t)) return Array.from(t)
}

function _arrayWithoutHoles(t) {
  if (Array.isArray(t)) {
    for (var e = 0, n = new Array(t.length); e < t.length; e++) n[e] = t[e];
    return n
  }
}

function ownKeys(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    t && (a = a.filter(function (t) {
      return Object.getOwnPropertyDescriptor(e, t).enumerable
    })), n.push.apply(n, a)
  }
  return n
}

function _objectSpread(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = null != arguments[t] ? arguments[t] : {};
    t % 2 ? ownKeys(n, !0).forEach(function (t) {
      _defineProperty(e, t, n[t])
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : ownKeys(n).forEach(function (t) {
      Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t))
    })
  }
  return e
}

function _defineProperty(t, e, n) {
  return e in t ? Object.defineProperty(t, e, {
    value: n,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : t[e] = n, t
}
var defaults = {
    prefixCls: "wux-calendar",
    monthNames: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
    monthNamesShort: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
    dayNames: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
    dayNamesShort: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
    firstDay: 1,
    weekendDays: [0, 6],
    multiple: !1,
    dateFormat: "yyyy-mm-dd",
    direction: "horizontal",
    minDate: null,
    maxDate: null,
    touchMove: !0,
    animate: !0,
    closeOnSelect: !0,
    weekHeader: !0,
    toolbar: !0,
    value: [],
    onMonthAdd: function () {},
    onChange: function () {},
    onOpen: function () {},
    onClose: function () {},
    onDayClick: function () {},
    onMonthYearChangeStart: function () {},
    onMonthYearChangeEnd: function () {}
  },
  getTouchPosition = function (t) {
    var e = t.touches[0] || t.changedTouches[0];
    return {
      x: e.pageX,
      y: e.pageY
    }
  },
  getTransform = function (t, e) {
    return "transform: translate3d(".concat(e ? t : 0, "%, ").concat(e ? 0 : t, "%, 0)")
  },
  isSameDate = function (t, e) {
    var n = new Date(t),
      a = new Date(e);
    return n.getFullYear() === a.getFullYear() && n.getMonth() === a.getMonth() && n.getDate() === a.getDate()
  };
(0, _baseComponent.default)({
  useFunc: !0,
  data: defaults,
  computed: {
    classes: ["prefixCls, direction", function (t, e) {
      return {
        wrap: (0, _classNames4.default)(t, _defineProperty({}, "".concat(t, "--").concat(e), e)),
        content: "".concat(t, "__content"),
        hd: "".concat(t, "__hd"),
        toolbar: "".concat(t, "__toolbar"),
        picker: "".concat(t, "__picker"),
        link: "".concat(t, "__link"),
        prev: (0, _classNames4.default)("".concat(t, "__icon"), _defineProperty({}, "".concat(t, "__icon--prev"), !0)),
        next: (0, _classNames4.default)("".concat(t, "__icon"), _defineProperty({}, "".concat(t, "__icon--next"), !0)),
        value: "".concat(t, "__value"),
        bd: "".concat(t, "__bd"),
        weekdays: "".concat(t, "__weekdays"),
        weekday: "".concat(t, "__weekday"),
        months: "".concat(t, "__months"),
        monthsContent: "".concat(t, "__months-content"),
        month: "".concat(t, "__month"),
        days: "".concat(t, "__days"),
        day: "".concat(t, "__day"),
        text: "".concat(t, "__text")
      }
    }]
  },
  methods: {
    open: function (t) {
      var e = this,
        n = 0 < arguments.length && void 0 !== t ? t : {},
        a = this.$$mergeOptionsAndBindMethods(Object.assign({}, defaults, n));
      this.monthsTranslate = 0, this.isH = "horizontal" === a.direction, this.$$setData(_objectSpread({
        in: !0
      }, a)).then(function () {
        return e.init()
      }), this.setValue(a.value), "function" == typeof this.fns.onOpen && this.fns.onOpen.call(this)
    },
    close: function () {
      this.$$setData({
        in: !1
      }), "function" == typeof this.fns.onClose && this.fns.onClose.call(this)
    },
    init: function () {
      var e = this,
        t = this.setWeekHeader(),
        n = this.setMonthsHTML(),
        a = this.setMonthsTranslate();
      return "function" == typeof this.fns.onMonthAdd && n.forEach(function (t) {
        return e.fns.onMonthAdd.call(e, t)
      }), this.$$setData({
        weeks: t,
        months: n,
        monthsTranslate: a,
        wrapperTranslate: ""
      }).then(function () {
        return e.$$setData(_objectSpread({}, e.updateCurrentMonthYear()))
      })
    },
    setMonthsTranslate: function (t) {
      var e = 0 < arguments.length && void 0 !== t ? t : this.monthsTranslate,
        n = 100 * -e,
        a = 100 * -(e - 1);
      return [getTransform(100 * -(e + 1), this.isH), getTransform(n, this.isH), getTransform(a, this.isH)]
    },
    updateCurrentMonthYear: function (t) {
      var e = this.data,
        n = e.months,
        a = e.monthNames;
      if (void 0 === t) {
        var s = parseInt(n[1].month, 10);
        return {
          currentMonth: s,
          currentYear: parseInt(n[1].year, 10),
          currentMonthName: a[s]
        }
      }
      var o = parseInt(n["next" === t ? n.length - 1 : 0].month, 10);
      return {
        currentMonth: o,
        currentYear: parseInt(n["next" === t ? n.length - 1 : 0].year, 10),
        currentMonthName: a[o]
      }
    },
    onTouchStart: function (t) {
      !this.data.touchMove || this.isMoved || this.isRendered || (this.start = getTouchPosition(t), this.move = {}, this.touchesDiff = 0, this.allowItemClick = !0, this.isMoved = !1)
    },
    onTouchMove: function (r) {
      var i = this;
      if (this.data.touchMove && !this.isRendered) {
        this.allowItemClick = !1, this.isMoved || (this.isMoved = !0), this.$$setData({
          swiping: !0
        });
        var t = this.data.prefixCls,
          e = wx.createSelectorQuery().in(this);
        e.select(".".concat(t, "__months-content")).boundingClientRect(function (t) {
          if (t && i.isMoved) {
            i.move = getTouchPosition(r), i.touchesDiff = i.isH ? i.move.x - i.start.x : i.move.y - i.start.y;
            var e = t.width,
              n = t.height,
              a = i.touchesDiff / (i.isH ? e : n),
              s = 100 * (i.monthsTranslate + a),
              o = getTransform(s, i.isH);
            i.$$setData({
              wrapperTranslate: "transition-duration: 0s; ".concat(o)
            })
          }
        }), e.exec()
      }
    },
    onTouchEnd: function () {
      var t = this;
      this.data.touchMove && this.isMoved && !this.isRendered && (this.isMoved = !1, this.$$setData({
        swiping: !1
      }), Math.abs(this.touchesDiff) < 30 ? this.resetMonth() : 30 <= this.touchesDiff ? this.prevMonth() : this.nextMonth(), setTimeout(function () {
        return t.allowItemClick = !0
      }, 100))
    },
    onDayClick: function (t) {
      if (this.allowItemClick) {
        // var e = t.currentTarget.dataset,
        //   n = e.year,
        //   a = e.month,
        //   s = e.day,
        //   o = e.type;
        // if (o.selected && !this.data.multiple) return;
        // if (o.disabled) return;
        // o.next && this.nextMonth(), o.prev && this.prevMonth(), "function" == typeof this.fns.onDayClick && this.fns.onDayClick.call(this, n, a, s), this.addValue(new Date(n, a, s).getTime()), this.data.closeOnSelect && !this.data.multiple && this.close()
      }
    },
    // 
    resetMonth: function () {
      var t = 100 * this.monthsTranslate,
        e = getTransform(t, this.isH);
      this.$$setData({
        wrapperTranslate: "transition-duration: 0s; ".concat(e)
      })
    },
    setYearMonth: function (t, e) {
      var n = this,
        a = 0 < arguments.length && void 0 !== t ? t : this.data.currentYear,
        s = 1 < arguments.length && void 0 !== e ? e : this.data.currentMonth,
        o = this.data,
        r = o.months,
        i = o.monthsTranslate,
        h = o.maxDate,
        c = o.minDate,
        u = o.currentYear,
        l = o.currentMonth,
        d = a < u ? new Date(a, s + 1, -1).getTime() : new Date(a, s).getTime();
      if (!(h && d > new Date(h).getTime() || c && d < new Date(c).getTime())) {
        var f = new Date(u, l).getTime(),
          m = f < d ? "next" : "prev",
          p = this.monthHTML(new Date(a, s)),
          g = this.monthsTranslate = this.monthsTranslate || 0;
        if (f < d) {
          this.monthsTranslate = this.monthsTranslate - 1;
          var v = getTransform(100 * -(g - 1), this.isH);
          this.$$setData({
            months: [r[1], r[2], p],
            monthsTranslate: [i[1], i[2], v]
          })
        } else {
          this.monthsTranslate = this.monthsTranslate + 1;
          var y = getTransform(100 * -(g + 1), this.isH);
          this.$$setData({
            months: [p, r[0], r[1]],
            monthsTranslate: [y, i[0], i[1]]
          })
        }
        this.onMonthChangeStart(m);
        var D = getTransform(100 * this.monthsTranslate, this.isH),
          M = this.data.animate ? .3 : 0,
          T = "transition-duration: ".concat(M, "s; ").concat(D);
        this.$$setData({
          wrapperTranslate: T
        }), setTimeout(function () {
          return n.onMonthChangeEnd(m, !0)
        }, M)
      }
    },
    nextYear: function () {
      this.setYearMonth(this.data.currentYear + 1)
    },
    prevYear: function () {
      this.setYearMonth(this.data.currentYear - 1)
    },
    nextMonth: function () {
      var t = this,
        e = this.data,
        n = e.months,
        a = e.monthsTranslate,
        s = e.maxDate,
        o = e.currentMonth,
        r = parseInt(n[n.length - 1].month, 10),
        i = parseInt(n[n.length - 1].year, 10),
        h = new Date(i, r).getTime();
      if (s && h > new Date(s).getTime()) return this.resetMonth();
      if (this.monthsTranslate = this.monthsTranslate - 1, r === o) {
        var c = 100 * -this.monthsTranslate,
          u = this.monthHTML(h, "next"),
          l = getTransform(c, this.isH),
          d = [this.data.months[1], this.data.months[2], u];
        this.$$setData({
          months: d,
          monthsTranslate: [a[1], a[2], l]
        }), "function" == typeof this.fns.onMonthAdd && this.fns.onMonthAdd.call(this, d[d.length - 1])
      }
      this.onMonthChangeStart("next");
      var f = getTransform(100 * this.monthsTranslate, this.isH),
        m = this.data.animate ? .3 : 0,
        p = "transition-duration: ".concat(m, "s; ").concat(f);
      this.$$setData({
        wrapperTranslate: p
      }), setTimeout(function () {
        return t.onMonthChangeEnd("next")
      }, m)
    },
    prevMonth: function () {
      var t = this,
        e = this.data,
        n = e.months,
        a = e.monthsTranslate,
        s = e.minDate,
        o = e.currentMonth,
        r = parseInt(n[0].month, 10),
        i = parseInt(n[0].year, 10),
        h = new Date(i, r + 1, -1).getTime();
      if (s && h < new Date(s).getTime()) return this.resetMonth();
      if (this.monthsTranslate = this.monthsTranslate + 1, r === o) {
        var c = 100 * -this.monthsTranslate,
          u = this.monthHTML(h, "prev"),
          l = getTransform(c, this.isH),
          d = [u, this.data.months[0], this.data.months[1]];
        this.$$setData({
          months: d,
          monthsTranslate: [l, a[0], a[1]]
        }), "function" == typeof this.fns.onMonthAdd && this.fns.onMonthAdd.call(this, d[0])
      }
      this.onMonthChangeStart("prev");
      var f = getTransform(100 * this.monthsTranslate, this.isH),
        m = this.data.animate ? .3 : 0,
        p = "transition-duration: ".concat(m, "s; ").concat(f);
      this.$$setData({
        wrapperTranslate: p
      }), setTimeout(function () {
        return t.onMonthChangeEnd("prev")
      }, m)
    },
    onMonthChangeStart: function (t) {
      var e = this.updateCurrentMonthYear(t);
      this.$$setData(e), "function" == typeof this.fns.onMonthYearChangeStart && this.fns.onMonthYearChangeStart.call(this, e.currentYear, e.currentMonth)
    },
    onMonthChangeEnd: function (t, e) {
      var n, a, s, o = this,
        r = 0 < arguments.length && void 0 !== t ? t : "next",
        i = 1 < arguments.length && void 0 !== e && e,
        h = this.data,
        c = h.currentYear,
        u = h.currentMonth,
        l = _toConsumableArray(this.data.months);
      i ? (a = this.monthHTML(new Date(c, u), "prev"), n = this.monthHTML(new Date(c, u), "next"), l = [a, l["next" === r ? l.length - 1 : 0], n]) : (s = this.monthHTML(new Date(c, u), r), "next" === r ? l = [l[1], l[2], s] : "prev" === r && (l = [s, l[0], l[1]]));
      var d = this.setMonthsTranslate(this.monthsTranslate);
      this.isRendered = !0, this.$$setData({
        months: l,
        monthsTranslate: d
      }).then(function () {
        return o.isRendered = !1
      }), "function" == typeof this.fns.onMonthAdd && this.fns.onMonthAdd.call(this, "next" === r ? l[l.length - 1] : l[0]), "function" == typeof this.fns.onMonthYearChangeEnd && this.fns.onMonthYearChangeEnd.call(this, c, u)
    },
    setWeekHeader: function () {
      var t = this.data,
        e = t.weekHeader,
        n = t.firstDay,
        a = t.dayNamesShort,
        s = t.weekendDays,
        o = [];
      if (e)
        for (var r = 0; r < 7; r++) {
          var i = 6 < r + n ? r - 7 + n : r + n,
            h = a[i],
            c = 0 <= s.indexOf(i);
          o.push({
            weekend: c,
            dayName: h
          })
        }
      return o
    },
    daysInMonth: function (t) {
      var e = new Date(t);
      return new Date(e.getFullYear(), e.getMonth() + 1, 0).getDate()
    },
    monthHTML: function (t, e) {
      var n = (t = new Date(t)).getFullYear(),
        a = t.getMonth(),
        s = t.getTime(),
        o = {
          year: n,
          month: a,
          time: s,
          items: []
        };
      "next" === e && (t = 11 === a ? new Date(n + 1, 0) : new Date(n, a + 1, 1)), "prev" === e && (t = 0 === a ? new Date(n - 1, 11) : new Date(n, a - 1, 1)), "next" !== e && "prev" !== e || (a = t.getMonth(), n = t.getFullYear(), s = t.getTime());
      var r = this.daysInMonth(new Date(t.getFullYear(), t.getMonth()).getTime() - 864e6),
        i = this.daysInMonth(t),
        h = new Date(t.getFullYear(), t.getMonth()).getDay();
      0 === h && (h = 7);
      var c, u = [],
        l = this.data.firstDay - 1 + 0,
        d = (new Date).setHours(0, 0, 0, 0),
        f = this.data.minDate ? new Date(this.data.minDate).getTime() : null,
        m = this.data.maxDate ? new Date(this.data.maxDate).getTime() : null;
      if (this.data.value && this.data.value.length)
        for (var p = 0; p < this.data.value.length; p++) u.push(new Date(this.data.value[p]).setHours(0, 0, 0, 0));
      for (var g = 1; g <= 6; g++) {
        for (var v = [], y = 1; y <= 7; y++) {
          var D = y,
            M = ++l - h,
            T = {};
          (c = M < 0 ? (M = r + M + 1, T.prev = !0, new Date(a - 1 < 0 ? n - 1 : n, a - 1 < 0 ? 11 : a - 1, M).getTime()) : i < (M += 1) ? (M -= i, T.next = !0, new Date(11 < a + 1 ? n + 1 : n, 11 < a + 1 ? 0 : a + 1, M).getTime()) : new Date(n, a, M).getTime()) === d && (T.today = !0), 0 <= u.indexOf(c) && (T.selected = !0), 0 <= this.data.weekendDays.indexOf(D - 1) && (T.weekend = !0), (f && c < f || m && m < c) && (T.disabled = !0);
          var w = (c = new Date(c)).getFullYear(),
            _ = c.getMonth();
          v.push({
            type: T,
            year: w,
            month: _,
            day: M,
            date: "".concat(w, "-").concat(_ + 1, "-").concat(M)
          })
        }
        o.year = n, o.month = a, o.time = s, o.items.push(v)
      }
      return o
    },
    setMonthsHTML: function () {
      var t = this.data.value && this.data.value.length ? this.data.value[0] : (new Date).setHours(0, 0, 0, 0);
      return [this.monthHTML(t, "prev"), this.monthHTML(t), this.monthHTML(t, "next")]
    },
    formatDate: function (t) {
      var e = (t = new Date(t)).getFullYear(),
        n = t.getMonth(),
        a = n + 1,
        s = t.getDate(),
        o = t.getDay();
      return this.data.dateFormat.replace(/yyyy/g, e).replace(/yy/g, (e + "").substring(2)).replace(/mm/g, a < 10 ? "0" + a : a).replace(/m/g, a).replace(/MM/g, this.data.monthNames[n]).replace(/M/g, this.data.monthNamesShort[n]).replace(/dd/g, s < 10 ? "0" + s : s).replace(/d/g, s).replace(/DD/g, this.data.dayNames[o]).replace(/D/g, this.data.dayNamesShort[o])
    },
    addValue: function (t) {
      if (this.data.multiple) {
        for (var e = this.data.value || [], n = -1, a = 0; a < e.length; a++) isSameDate(t, e[a]) && (n = a); - 1 === n ? e.push(t) : e.splice(n, 1), this.setValue(e)
      } else this.setValue([t])
    },
    setValue: function (t) {
      var e = this;
      this.$$setData({
        value: t
      }).then(function () {
        return e.updateValue()
      })
    },
    updateValue: function () {
      // var n = this,
      //   i = {};
      // this.data.months.forEach(function (t, a) {
      //   t.items.forEach(function (t, n) {
      //     t.forEach(function (t, e) {
      //       t.type.selected && (i["months[".concat(a, "].items[").concat(n, "][").concat(e, "].type.selected")] = !1)
      //     })
      //   })
      // });
      // for (var t = function (t) {
      //     var e = new Date(n.data.value[t]),
      //       s = e.getFullYear(),
      //       o = e.getMonth(),
      //       r = e.getDate();
      //     n.data.months.forEach(function (t, a) {
      //       t.year === s && t.month === o && t.items.forEach(function (t, n) {
      //         t.forEach(function (t, e) {
      //           t.year === s && t.month === o && t.day === r && (i["months[".concat(a, "].items[").concat(n, "][").concat(e, "].type.selected")] = !0)
      //         })
      //       })
      //     })
      //   }, e = 0; e < this.data.value.length; e++) t(e);
      // this.$$setData(i), "function" == typeof this.fns.onChange && this.fns.onChange.call(this, this.data.value, this.data.value.map(function (t) {
      //   return n.formatDate(t)
      // }))
    },
    noop: function () {}
  }
});