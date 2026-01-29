Page({
  data: {
    rangeType: '7',

    todayFinished: 0,
    weekFinished: 0,
    totalFinished: 0,

    todayIncome: 0,
    weekIncome: 0,
    totalIncome: 0,

    labels: [],
    orderCounts: [],
    incomes: []
  },

  onReady() {
    this.loadTrendData()
  },

  /* ================== F2 初始化 ================== */

  initOrderChart(F2, config) {
    const chart = new F2.Chart({
      ...config,
      animate: false // 是否动画，后面动态控制
    })
  
    chart.source([], {
      date: {
        type: 'cat',
        range: [0, 1]
      },
      value: {
        min: 0
      }
    })
  
    // ⚠️ 这里只注册 line，不决定 smooth
    this.orderLine = chart.line()
      .position('date*value')
  
    chart.render()
  
    this.orderChart = chart
    return chart
  },
  

  initIncomeChart(F2, config) {
    const chart = new F2.Chart({
      ...config,
      animate: false
    })
  
    chart.source([], {
      date: {
        type: 'cat'
      },
      value: {
        min: 0
      }
    })
  
    chart.interval()
      .position('date*value')
      .color('#5B8FF9')
      .style({
        radius: [4, 4, 0, 0]
      })
  
    chart.render()
  
    this.incomeChart = chart
    return chart
  },
  
  

  /* ================== 更新图表数据 ================== */

  updateCharts() {
    if (!this.orderChart || !this.incomeChart) return
  
    const is30Days = this.data.rangeType === '30'
  
    /* ========= 1️⃣ 控制动画 ========= */
    this.orderChart.animate(!is30Days)
    this.incomeChart.animate(!is30Days)
  
    /* ========= 2️⃣ 控制 X 轴刻度数量 ========= */
    this.orderChart.scale('date', {
      tickCount: is30Days ? 6 : this.data.labels.length
    })
  
    this.incomeChart.scale('date', {
      tickCount: is30Days ? 6 : this.data.labels.length
    })
  
    /* ========= 3️⃣ 控制折线是否 smooth ========= */
    this.orderLine.shape(is30Days ? 'line' : 'smooth')
  
    /* ========= 4️⃣ 组装数据 ========= */
    const labels = this.data.labels || []
  
    const orderData = labels.map((d, i) => ({
      date: d,
      value: Number(this.data.orderCounts[i] || 0)
    }))
  
    const incomeData = labels.map((d, i) => ({
      date: d,
      value: Number(this.data.incomes[i] || 0)
    }))
  
    /* ========= 5️⃣ 更新数据（F2 自动过渡） ========= */
    this.orderChart.changeData(orderData)
    this.incomeChart.changeData(incomeData)
  },
  
  
  
  switchRange(e) {
    const type = e.currentTarget.dataset.type
    if (type === this.data.rangeType) return
  
    this.setData({
      rangeType: type
    }, () => {
      this.loadTrendData()
    })
  },
  

  /* ================== 接口 ================== */

  loadTrendData(isRefresh = false) {
    const app = getApp()
    const days = this.data.rangeType

    my.request({
      url: `${app.globalData.apiBaseUrl}order/rider/trend/${days}`,
      method: 'GET',
      headers: {
        riderToken: app.globalData.riderToken
      },
      success: (res) => {
        if (res.data.code === 1) {
          const d = res.data.data || {}

          this.setData({
            todayFinished: d.todayFinished || 0,
            weekFinished: d.weekFinished || 0,
            totalFinished: d.totalFinished || 0,

            todayIncome: d.todayIncome || 0,
            weekIncome: d.weekIncome || 0,
            totalIncome: d.totalIncome || 0,

            labels: d.dateList || [],
            orderCounts: d.orderFinishCountList || [],
            incomes: d.incomeList || []
          }, () => {
            this.updateCharts()
          })
        } else {
          my.showToast({
            type: 'fail',
            content: res.data.msg
          })
        }
      },
      complete: () => {
        if (isRefresh) {
          my.stopPullDownRefresh()
        }
      }
    })
  },

  onPullDownRefresh() {
    this.loadTrendData(true)
  }
})
