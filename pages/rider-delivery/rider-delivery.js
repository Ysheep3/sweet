Page({
  data: {
    order: {},
    riderLocation: null, // 骑手当前位置
    customerLocation: null, // 客户位置
    markers: [],
    mapCenter: { latitude: 22.746672, longitude: 114.387411 }, // 地图中心点
    includePoints: [] // 用于自动调整地图视野，包含所有标记点
  },

  onLoad(query) {
    const id = query.id;
    // 先加载订单，再获取骑手位置（确保顺序）
    this.loadOrder(id);
    // 延迟一点获取位置，确保订单数据已加载
    setTimeout(() => {
      this.getRiderLocation();
    }, 100);
  },

  // 获取骑手当前位置
  getRiderLocation() {
    my.getLocation({
      type: 'gcj02', // 返回可以用于my.openLocation的经纬度
      success: (res) => {
        console.log('骑手位置获取成功:', res);
        const riderLocation = {
          latitude: res.latitude,
          longitude: res.longitude
        };
        
        this.setData({ riderLocation }, () => {
          this.updateMarkers();
          this.updateMapCenter();
        });
      },
      fail: (err) => {
        console.error('获取骑手位置失败:', err);
        my.showToast({
          content: '获取位置失败，请检查定位权限',
          type: 'fail'
        });
        // 如果获取失败，使用默认位置（店铺位置）
        this.setData({
          riderLocation: { latitude: 23.128, longitude: 113.262 }
        }, () => {
          this.updateMarkers();
          this.updateMapCenter(); // 也要更新中心点
        });
      }
    });
  },

  loadOrder(id) {
    const orders = my.getStorageSync({ key: 'riderOrders' }).data || [];
    const order = orders.find(o => o.id === id) || {};

    const customerLocation = order.customerLocation || null;

    console.log("客户位置：",customerLocation);

    this.setData({
      order,
      customerLocation
    }, () => {
      this.updateMarkers();
      this.updateMapCenter();
    });
  },

  // 更新地图标记点
  updateMarkers() {
    const { riderLocation, customerLocation } = this.data;
    const markers = [];
    const includePoints = []; // 用于自动调整地图视野

    // 骑手位置标记
    if (riderLocation) {
      markers.push({
        id: 1,
        latitude: riderLocation.latitude,
        longitude: riderLocation.longitude,
        iconPath: '/assets/image/waimai.png', // 如果没有图标，可以用文字标记
        width: 30,
        height: 30,
        callout: {
          content: '我的位置',
          color: '#333',
          fontSize: 12,
          borderRadius: 4,
          bgColor: '#fff',
          padding: 5,
          display: 'BYCLICK'
        }
      });
      includePoints.push({
        latitude: riderLocation.latitude,
        longitude: riderLocation.longitude
      });
    }

    // 客户位置标记
    if (customerLocation) {
      markers.push({
        id: 2,
        latitude: customerLocation.latitude,
        longitude: customerLocation.longitude,
        iconPath: '/assets/image/touxaing.jpg',
        width: 30,
        height: 30,
        callout: {
          content: '送达地址',
          color: '#333',
          fontSize: 12,
          borderRadius: 4,
          bgColor: '#fff',
          padding: 5,
          display: 'BYCLICK'
        }
      });
      includePoints.push({
        latitude: customerLocation.latitude,
        longitude: customerLocation.longitude
      });
    }

    this.setData({ 
      markers,
      includePoints // 设置包含点，地图会自动调整视野包含所有点
    });
  },

  // 更新地图中心点（骑手和客户的中点）
  updateMapCenter() {
    const { riderLocation, customerLocation } = this.data;
    
    let newCenter = null;
    
    if (riderLocation && customerLocation) {
      // 计算中点，并稍微调整视野范围
      const centerLat = (riderLocation.latitude + customerLocation.latitude) / 2;
      const centerLng = (riderLocation.longitude + customerLocation.longitude) / 2;
      newCenter = { latitude: centerLat, longitude: centerLng };
    } else if (riderLocation) {
      // 只有骑手位置，以骑手位置为中心
      newCenter = { latitude: riderLocation.latitude, longitude: riderLocation.longitude };
    } else if (customerLocation) {
      // 只有客户位置，以客户位置为中心
      newCenter = { latitude: customerLocation.latitude, longitude: customerLocation.longitude };
    }
    
    // 只有当中心点发生变化时才更新
    if (newCenter && (
      !this.data.mapCenter ||
      Math.abs(this.data.mapCenter.latitude - newCenter.latitude) > 0.0001 ||
      Math.abs(this.data.mapCenter.longitude - newCenter.longitude) > 0.0001
    )) {
      console.log('更新地图中心点:', newCenter);
      this.setData({
        mapCenter: newCenter
      });
    }
  },

  // 打开高德导航（示意：通过调起外部地图应用）
  startNavi() {
    const { customerLocation } = this.data;
    if (!customerLocation) {
      my.showToast({
        content: '缺少顾客位置信息',
        type: 'fail'
      });
      return;
    }

    my.openLocation({
      longitude: customerLocation.longitude,
      latitude: customerLocation.latitude,
      name: '送达地址',
      address: this.data.order.customerAddress
    });
  },

  // 标记订单已送达
  markDelivered() {
    const orders = my.getStorageSync({ key: 'riderOrders' }).data || [];
    const idx = orders.findIndex(o => o.id === this.data.order.id);
    if (idx > -1) {
      orders[idx].status = 'finished';
      orders[idx].statusText = '已完成';
      my.setStorageSync({ key: 'riderOrders', data: orders });
    }

    my.showToast({
      content: '已标记送达',
      type: 'success'
    });

    // 返回骑手首页刷新列表
    setTimeout(() => {
      my.navigateBack();
    }, 1000);
  }
});


