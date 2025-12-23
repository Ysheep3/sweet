Page({
  data: {
    isEdit: false,
    form: {
      name: "",
      phone: "",
      province: "",
      city: "",
      district: "",
      detail: "",
      isDefault: false,
    },
    addressId: null,
    isLoading: false,
  },

  onLoad(query) {
    // 检查是否是编辑模式
    if (query.id) {
      this.setData({ isEdit: true, "form.id": query.id })
      this.loadAddressData(query.id)
    } else {
      // 非编辑模式，自动获取地址
      this.autoGetAddress()
    }
  },

  // 自动获取地址信息
  autoGetAddress() {
    this.setData({ isLoading: true })
    
    my.chooseLocation({
      success: (res) => {
        console.log('地址选择成功:', res)
        this.setData({ isLoading: false })
        
        // 解析并填充地址信息
        this.fillAddressForm(res)
      },
      fail: (err) => {
        console.log('地址选择失败:', err)
        this.setData({ isLoading: false })
        
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
    const { provinceName, cityName, adName, address, name } = locationData
    
    console.log('解析出的字段:', { provinceName, cityName, adName, address, name })
    
    // 只保存地址文本信息，经纬度由后端通过地理编码API获取
    this.setData({
      'form.province': provinceName || '',
      'form.city': cityName || '',
      'form.district': adName || '',
      'form.detail': address || name || '',
    })
    
    // 显示成功提示
    my.showToast({
      type: 'success',
      content: '地址已自动填充'
    })
  },

  loadAddressData(addressId) {
    // 从本地存储或API加载地址数据
    my.getStorage({
      key: `address_${addressId}`,
      success: (res) => {
        const addressData = res.data
        this.setData({
          form: {
            ...this.data.form,
            ...addressData,
          },
        })
      },
    })
  },

  handleInput(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    this.setData({
      [`form.${field}`]: value,
    })
  },

  handleCheckboxChange(e) {
    this.setData({
      "form.isDefault": e.detail.value,
    })
  },

  // 重新获取地址
  rechooseAddress() {
    this.autoGetAddress()
  },

  validateForm() {
    const form = this.data.form

    if (!form.name.trim()) {
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

    if (!form.detail.trim()) {
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

    const form = this.data.form
    const addressData = {
      id: form.id || Date.now().toString(),
      name: form.name,
      phone: form.phone,
      province: form.province,
      city: form.city,
      district: form.district,
      detail: form.detail,
      isDefault: form.isDefault,
      // 注意：经纬度由后端通过地理编码API获取，前端不保存
    }

    // 保存到本地存储（同时保存到地址列表）
    my.setStorage({
      key: `address_${addressData.id}`,
      data: addressData,
      success: () => {
        // 同时更新地址列表
        let addresses = my.getStorageSync({ key: "addresses" }).data || []
        if (this.data.isEdit) {
          // 更新现有地址
          const index = addresses.findIndex(addr => addr.id === addressData.id)
          if (index > -1) {
            addresses[index] = addressData
          } else {
            addresses.push(addressData)
          }
        } else {
          // 添加新地址
          addresses.push(addressData)
        }
        my.setStorageSync({ key: "addresses", data: addresses })

        my.showToast({
          type: "success",
          content: this.data.isEdit ? "地址已更新" : "地址已保存",
        })

        setTimeout(() => {
          my.navigateBack()
        }, 1500)
      },
    })
  },

  goBack() {
    my.navigateBack()
  },
})