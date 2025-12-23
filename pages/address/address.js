Page({
  data: {
    addresses: [],
    isSelectMode: false,
  },

  onLoad(options) {
    if (options.select === "true") {
      this.setData({ isSelectMode: true })
    }
    this.loadAddresses()
  },

  // 加载地址列表
  loadAddresses() {
    // 从本地存储读取地址列表
    let addresses = my.getStorageSync({ key: "addresses" }).data || []
    
    // 如果没有地址列表，尝试从单个地址存储中读取（兼容旧数据）
    if (!addresses || addresses.length === 0) {
      // 这里可以尝试读取单个地址，但为了简化，我们直接使用空数组
      addresses = []
    }
    
    this.setData({ addresses })
  },

  // 添加地址
  addAddress() {
    my.navigateTo({
      url: "/pages/addAddress/addAddress",
    })
  },

  // 编辑地址
  editAddress(e) {
    const id = e.currentTarget.dataset.id
    my.navigateTo({
      url: `/pages/address-edit/address-edit?id=${id}`,
    })
  },

  // 删除地址
  deleteAddress(e) {
    const id = e.currentTarget.dataset.id
    my.confirm({
      content: "确定删除该地址吗？",
      success: (res) => {
        if (res.confirm) {
          const addresses = this.data.addresses.filter((addr) => addr.id !== id)
          my.setStorageSync({
            key: "addresses",
            data: addresses,
          })
          this.loadAddresses()
        }
      },
    })
  },

  // 选择地址（选择模式）
  selectAddress(e) {
    if (!this.data.isSelectMode) return

    const id = e.currentTarget.dataset.id
    const address = this.data.addresses.find((addr) => addr.id === id)

    if (address) {
      my.setStorageSync({
        key: "selectedAddress",
        data: address,
      })

      my.navigateBack()
    }
  },
})
