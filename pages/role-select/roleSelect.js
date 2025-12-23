const ALLOWED_RIDER_PHONES = ["18924625116", "13900000001"]

Page({
  data: {
    riderPhone: "",
  },

  // 顾客授权成功回调（由 button 直接触发）
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

    // 记录角色为顾客
    getApp().setUserRole && getApp().setUserRole("customer")

    // 授权通过，获取用户信息并进入首页
    this.fetchUserInfoAndEnterApp("customer")
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

  // 骑手登录：先校验手机号，再获取支付宝信息
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
    getApp().setUserRole && getApp().setUserRole("rider")

    this.fetchUserInfoAndEnterApp("rider", phone)
  },

  // 公共：获取支付宝用户信息并进入应用
  fetchUserInfoAndEnterApp(role, riderPhone) {
    my.getOpenUserInfo({
      success: (res) => {
        try {
          console.log("getOpenUserInfo 返回:", res)

          let userInfo
          if (typeof res.response === "string") {
            const parsed = JSON.parse(res.response)
            userInfo = parsed.response || parsed
          } else {
            userInfo = res.response
          }

          if (!userInfo) {
            my.showToast({
              content: "获取用户信息失败，数据为空",
              type: "fail",
            })
            return
          }

          const nickname = userInfo.nickName || userInfo.nickname || userInfo.nick_name || "支付宝用户"
          const avatar = userInfo.avatar || userInfo.avatarUrl || "/image/default-avatar.png"

          const userData = {
            avatar,
            nickname,
            userId: userInfo.userId || userInfo.user_id || "",
            userType: userInfo.userType || userInfo.user_type || "",
            isLoggedIn: true,
            role,
            riderPhone: riderPhone || null,
            authTime: Date.now(),
          }

          my.setStorageSync({
            key: "userInfo",
            data: userData,
          })
          getApp().setUserRole && getApp().setUserRole(role)

          my.showToast({
            content: (role === "customer" ? "顾客" : "骑手") + "登录成功",
            type: "success",
          })

          // 不同角色进入不同首页
          my.reLaunch({
            url: role === "rider" ? "/pages/rider-home/rider-home" : "/pages/index/index",
          })
        } catch (err) {
          console.error("解析用户信息失败:", err)
          my.showToast({
            content: "解析用户信息失败，请重试",
            type: "fail",
          })
        }
      },
      fail: (err) => {
        console.error("getOpenUserInfo 调用失败:", err)
        my.showToast({
          content: "获取支付宝用户信息失败，请重试",
          type: "fail",
        })
      },
    })
  },
})
