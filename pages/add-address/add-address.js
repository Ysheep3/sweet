Page({
  data: {
    isEdit: false,
    form: {
      consignee: "",
      phone: "",
      province: "",
      city: "",
      district: "",
      detailAddress: "",
      isDefault: 0,
    },
    addressId: null,
    isLoading: false,
  },

  onLoad(query) {
    // 检查是否是编辑模式
    if (query.id) {
      this.setData({
        isEdit: true,
        "form.id": query.id
      })
      this.loadAddressData(query.id)
    } else {
      // 非编辑模式，自动获取地址
      this.autoGetAddress()
    }
  },

  // 自动获取地址信息
  autoGetAddress() {
    this.setData({
      isLoading: true
    })

    my.chooseLocation({
      success: (res) => {
        console.log('地址选择成功:', res)
        this.setData({
          isLoading: false
        })

        // 解析并填充地址信息
        this.fillAddressForm(res)
      },
      fail: (err) => {
        console.log('地址选择失败:', err)
        this.setData({
          isLoading: false
        })

        my.showToast({
          type: 'fail',
          content: '获取地址失败，请手动填写'
        })
      }
    })
  },

  // 填充地址表单
  fillAddressForm(locationData) {
    console.log('地址选择成功，接收到的数据:', locationData)

    // 根据实际返回的数据结构提取信息（不保存经纬度，由后端处理）
    const {
      provinceName,
      cityName,
      adName,
      address,
      name
    } = locationData

    console.log('解析出的字段:', {
      provinceName,
      cityName,
      adName,
      address,
      name
    })

    // 只保存地址文本信息，经纬度由后端通过地理编码API获取
    this.setData({
      'form.province': provinceName || '',
      'form.city': cityName || '',
      'form.district': adName || '',
      'form.detailAddress': address || name || '',
    })

    // 显示成功提示
    my.showToast({
      type: 'success',
      content: '地址已自动填充'
    })
  },

  loadAddressData(addressId) {
    const app = getApp()
    const apiBaseUrl = (app.globalData && app.globalData.apiBaseUrl) || "http://localhost:8080/"
    const id = addressId;
    console.log(id);
    my.request({
      url: `${apiBaseUrl}address/${id}`,
      method: 'GET',
      headers: {
        authentication: app.globalData.authentication
      },
      success: (res) => {
        if (res.data && res.data.code === 1) {
          console.log(res.data.data);
          const addressData = res.data.data
          this.setData({
            form: {
              ...this.data.form,
              ...addressData,
            },
          })
        }
      },
      fail: () => {
        my.showToast({
          type: 'fail',
          content: '加载地址失败'
        })
      }
    })
  },

  handleInput(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    this.setData({
      [`form.${field}`]: value,
    })
  },

  handleSwitchChange(e) {
    this.setData({
      "form.isDefault": e.detail.value ? 1 : 0,
    })
  },

  // 重新获取地址
  rechooseAddress() {
    this.autoGetAddress()
  },

  validateForm() {
    const form = this.data.form

    if (!form.consignee) {
      my.showToast({
        type: "fail",
        content: "请输入收货人姓名",
      })
      return false
    }

    if (!form.phone.trim() || form.phone.length !== 11) {
      my.showToast({
        type: "fail",
        content: "请输入有效的手机号码",
      })
      return false
    }

    if (!form.province) {
      my.showToast({
        type: "fail",
        content: "请填写省份",
      })
      return false
    }

    if (!form.city) {
      my.showToast({
        type: "fail",
        content: "请填写城市",
      })
      return false
    }

    if (!form.district) {
      my.showToast({
        type: "fail",
        content: "请填写区县",
      })
      return false
    }

    if (!form.detailAddress.trim()) {
      my.showToast({
        type: "fail",
        content: "请输入详细地址",
      })
      return false
    }

    return true
  },

  saveAddress() {
    if (!this.validateForm()) {
      return
    }
  
    const app = getApp()
    const apiBaseUrl =
      (app.globalData && app.globalData.apiBaseUrl) ||
      "http://localhost:8080/"
  
    const form = this.data.form
  
    // 和后端 AddressDTO 对齐
    const addressDTO = {
      id: form.id || null,
      consignee: form.consignee,
      phone: form.phone,
      province: form.province,
      city: form.city,
      district: form.district,
      detailAddress: form.detailAddress,
      isDefault: form.isDefault,
      // 经纬度不传，由后端地理编码
    }
  
    this.setData({ isLoading: true })
  
    my.request({
      url: this.data.isEdit
        ? `${apiBaseUrl}address`
        : `${apiBaseUrl}address`,
      method: this.data.isEdit ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        authentication: app.globalData.authentication,
      },
      data: addressDTO,
      success: (res) => {
        if (res.data && res.data.code === 1) {
          my.showToast({
            type: "success",
            content: this.data.isEdit ? "地址已更新" : "地址已保存",
          })
  
          setTimeout(() => {
            my.navigateBack()
          }, 1200)
        } else {
          my.showToast({
            type: "fail",
            content: res.data.msg || "保存失败",
          })
        }
      },
      fail: () => {
        my.showToast({
          type: "fail",
          content: "网络异常，请稍后重试",
        })
      },
      complete: () => {
        this.setData({ isLoading: false })
      },
    })
  },

  goBack() {
    my.navigateBack()
  },
})