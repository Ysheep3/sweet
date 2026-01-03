const ALLOWED_RIDER_PHONES = ["18924625116", "13900000001"]
const User = require('../../models/User')
const Employee = require('../../models/Employee')

Page({
  data: {
    riderPhone: "",
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
    this.fetchAuthCodeAndLogin('customer')
  },

  handleCustomerAuthError(e) {
    console.error("顾客授权失败:", e)
    my.showToast({
      content: "授权失败，请重试",
      type: "fail",
    })
  },

  // 骑手手机号输入
  onRiderPhoneInput(e) {
    this.setData({
      riderPhone: e.detail.value,
    })
  },

  // 骑手登录：先校验手机号，再获取授权码登录
  submitRiderLogin() {
    const phone = (this.data.riderPhone || "").trim()
    if (!phone || phone.length !== 11) {
      my.showToast({
        content: "请输入11位手机号",
        type: "fail",
      })
      return
    }

    if (!ALLOWED_RIDER_PHONES.includes(phone)) {
      my.showToast({
        content: "该手机号未在骑手名单中，请联系店铺",
        type: "fail",
      })
      return
    }

    console.log("骑手手机号校验通过:", phone)

    // 校验通过后，获取授权码并登录（带手机号）
    this.fetchAuthCodeAndLogin('rider', phone)
  },

  // 公共：获取支付宝授权码并发送到后端
  fetchAuthCodeAndLogin(role, riderPhone) {
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
        this.sendLoginRequest(role, {
          authCode: res.authCode,
          riderPhone: riderPhone || null,
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

  // 发送登录请求到后端
  sendLoginRequest(role, userInfo) {
    const app = getApp()
    const apiBaseUrl = (app.globalData && app.globalData.apiBaseUrl) || 'http://localhost:8080/'

    let loginData = {}
    let apiUrl = ''

    if (role === 'customer') {
      // 顾客登录
      loginData = { code: userInfo.authCode }
      apiUrl = `${apiBaseUrl}user/login`
    } else {
      // 骑手登录
      loginData = {
        code: userInfo.authCode,
        phone: userInfo.riderPhone,
      }
      apiUrl = `${apiBaseUrl}employee/rider/login`
    }

    my.showLoading({
      content: '登录中...',
    })

    my.request({
      url: apiUrl,
      method: 'POST',
      data: loginData,
      headers: { 'Content-Type': 'application/json' },
      dataType: 'json',
      success: (res) => {
        my.hideLoading()
        console.log('登录API响应:', res)

        if (res.statusCode === 200 && res.data) {
          const app = getApp();
          if (role === 'customer') {
            app.globalData.userInfo = User.fromApi(res.data.data)
            console.log("用户token：", res.data.data.token)
            app.globalData.authentication = res.data.data.token
          } else {
            app.globalData.riderInfo = Employee.fromApi(res.data.data)
          }

          my.showToast({
            content: (role === 'customer' ? '顾客' : '骑手') + '登录成功',
            type: 'success',
          })

          // 跳转对应首页
          my.reLaunch({
            url: role === 'rider' ? '/pages/rider-home/rider-home' : '/pages/index/index',
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
})