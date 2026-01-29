const User = require('../../models/User')
const Employee = require('../../models/Employee')

Page({
  data: {
    username: "",
    password: "",
  },

  // 顾客授权成功回调（由 button open-type="getAuthorize" 触发）
  handleCustomerAuthorize(e) {
    my.showToast({
      content: "授权回调已触发",
      type: "success",
      duration: 1500,
    })

    console.log("顾客授权事件:", e)

    if (e && e.detail && e.detail.authErrorScope) {
      my.showToast({
        content: "需要授权才能登录，请重新授权",
        type: "fail",
      })
      return
    }

    // 直接获取授权码并登录（顾客专用）
    this.fetchAuthCodeAndLogin();
  },

  handleCustomerAuthError(e) {
    console.error("顾客授权失败:", e)
    my.showToast({
      content: "授权失败，请重试",
      type: "fail",
    })
  },

  // 公共：获取支付宝授权码并发送到后端
  fetchAuthCodeAndLogin() {
    my.getAuthCode({
      scopes: ['auth_user'], // 需要用户信息授权
      success: (res) => {
        console.log("getAuthCode 返回:", res)

        if (!res.authCode) {
          my.showToast({
            content: "获取授权码失败",
            type: "fail",
          })
          return
        }

        // 发送到对应后端接口
        this.sendLoginRequest({
          authCode: res.authCode,
        })
      },
      fail: (err) => {
        console.error("getAuthCode 调用失败:", err)
        my.showToast({
          content: "获取授权码失败，请重试",
          type: "fail",
        })
      },
    })
  },

  // 用户登录
  sendLoginRequest(userInfo) {
    const app = getApp()
    const apiBaseUrl = (app.globalData && app.globalData.apiBaseUrl) || 'http://localhost:8080/'

    let loginData = {}
    let apiUrl = ''

    // 顾客登录
    loginData = {
      code: userInfo.authCode
    }
    apiUrl = `${apiBaseUrl}user/login`


    my.showLoading({
      content: '登录中...',
    })

    my.request({
      url: apiUrl,
      method: 'POST',
      data: loginData,
      headers: {
        'Content-Type': 'application/json'
      },
      dataType: 'json',
      success: (res) => {
        my.hideLoading()
        console.log('登录API响应:', res)

        if (res.statusCode === 200 && res.data) {
          const app = getApp();
          console.log("res：", res.data.data)

          app.globalData.userInfo = User.fromApi(res.data.data)
          console.log("用户token：", res.data.data.token)
          app.globalData.authentication = res.data.data.token

          my.showToast({
            content: '顾客登录成功',
            type: 'success',
          })

          // 跳转对应首页
          my.reLaunch({
            url: '/pages/index/index',
          })
        } else {
          my.showToast({
            content: res.data.message || '登录失败，请重试',
            type: 'fail',
          })
        }
      },
      fail: (err) => {
        my.hideLoading()
        console.error('登录请求失败:', err)
        my.showToast({
          content: '登录失败，请检查网络连接后重试',
          type: 'fail',
        })
      },
    })
  },

  // 骑手账密输入
  onUsernameInput(e) {
    this.setData({
      username: e.detail.value,
    })
  },

  onPasswordInput(e) {
    this.setData({
      password: e.detail.value,
    })
  },

  // 骑手登录：先校验手机号，再获取授权码登录
  submitRiderLogin() {
    const username = (this.data.username || "").trim()
    const password = (this.data.password || "").trim()

    if (!username) {
      my.showToast({
        content: "请输入账号",
        type: "fail",
      })
      return
    }

    if (!password) {
      my.showToast({
        content: "请输入密码",
        type: "fail",
      })
      return
    }

    const app = getApp()
    const apiBaseUrl =
      (app.globalData && app.globalData.apiBaseUrl) || 'http://localhost:8080/'

    my.showLoading({
      content: '登录中...'
    })

    my.request({
      url: `${apiBaseUrl}rider/login`,
      method: 'POST',
      data: {
        username,
        password,
      },
      headers: {
        'Content-Type': 'application/json'
      },
      dataType: 'json',
      success: (res) => {
        my.hideLoading()
        if (res.data && res.data.code === 1) {
          app.globalData.riderInfo = res.data.data
          app.globalData.riderToken = res.data.data.token

          my.showToast({
            content: '骑手登录成功',
            type: 'success',
          })

          my.reLaunch({
            url: '/pages/rider-home/rider-home',
          })
        } else {
          my.showToast({
            content: res.data.msg || '登录失败',
            type: 'fail',
          })
        }
      },
      fail: () => {
        my.hideLoading()
        my.showToast({
          content: '网络异常，请重试',
          type: 'fail',
        })
      },
    })
  },
})