Page({
  data: {
    addresses: [],
    isSelectMode: false,
  },

  onLoad(options) {
    if (options.select === "true") {
      this.setData({
        isSelectMode: true
      })
    }
    this.loadAddresses()
  },

  onShow() {
    this.loadAddresses();
  },
  
  // 加载地址列表
  loadAddresses() {
    const app = getApp()
    const apiBaseUrl = (app.globalData && app.globalData.apiBaseUrl) || "http://localhost:8080/"

    my.request({
      url: `${apiBaseUrl}address/list`,
      method: 'GET',
      headers: {
        authentication: app.globalData.authentication
      },
      success: (res) => {
        if (res.data && res.data.code === 1) {
          console.log(res.data.data)
          this.addresses = res.data.data;
          this.setData({
            addresses: this.addresses
          });
        }
      },
      fail: () => {
        my.showToast({
          type: "fail",
          content: "加载地址列表失败"
        })
      },
    })
  },

  // 添加地址
  addAddress() {
    my.navigateTo({
      url: "/pages/add-address/add-address",
    })
  },

  // 编辑地址
  editAddress(e) {
    const id = e.currentTarget.dataset.id
    my.navigateTo({
      // 复用添加地址页面，在其中通过 query.id 进入编辑模式
      url: `/pages/add-address/add-address?id=${id}`,
    })
  },

  // 删除地址
  deleteAddress(e) {
    const id = e.currentTarget.dataset.id
    const app = getApp()
    const apiBaseUrl = (app.globalData && app.globalData.apiBaseUrl) || "http://localhost:8080/"
    my.confirm({
      content: "确定删除该地址吗？",
      success: (res) => {
        if (res.confirm) {
          my.request({
            url: `${apiBaseUrl}address/${id}`,
            method: 'DELETE',
            headers: {
              authentication: app.globalData.authentication
            },
            success: (res) => {
              if (res.data && res.data.code === 1) {
                my.showToast({
                  type: "success",
                  content: "删除成功！"
                })
                this.loadAddresses();
              }
            },
            fail: () => {
              my.showToast({
                type: "fail",
                content: "加载地址列表失败"
              })
            },
          })
        }
      }
    })
  }
})