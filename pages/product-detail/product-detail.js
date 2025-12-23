Page({
  data: {
    product: {},
    sweet: '',
    temperature: '',
    isFavorite: false
  },

  onLoad(query) {
    const id = Number(query.id || 0);
    if (!id) {
      my.showToast({ content: '商品不存在', type: 'fail' });
      return;
    }
    this.initProduct(id);
  },

  // 初始化商品数据（与首页保持一致，并扩展材料等）
  initProduct(id) {
    const products = [
      {
        id: 1,
        name: '草莓蛋糕',
        price: 58,
        image: '/image/products/cake1.jpg',
        categoryId: 1,
        description: '新鲜草莓制作，口感香甜',
        materials: ['新鲜草莓', '淡奶油', '鸡蛋', '低筋面粉', '白砂糖'],
        tips: '当天食用口感最佳，可冷藏保存 1 天。',
        detail: '选用新西兰进口淡奶油与当季草莓，蛋糕体蓬松柔软，整体甜度适中，适合多人分享。',
        isNew: true,
        monthSales: 120,
        rate: 4.9
      },
      {
        id: 2,
        name: '巧克力蛋糕',
        price: 68,
        image: '/image/products/cake2.jpg',
        categoryId: 1,
        description: '浓郁巧克力，入口即化',
        materials: ['黑巧克力', '黄油', '鸡蛋', '低筋面粉', '可可粉'],
        tips: '微苦口感更接近纯正巧克力风味，适合配黑咖啡。',
        detail: '采用高纯度可可粉与黑巧克力，巧克力控必点，冷藏后口感更扎实。',
        isHot: true,
        monthSales: 96,
        rate: 4.8
      },
      {
        id: 3,
        name: '提拉米苏',
        price: 45,
        image: '/image/products/tiramisu.jpg',
        categoryId: 2,
        description: '经典意式甜品',
        materials: ['手指饼干', '马斯卡彭芝士', '咖啡液', '可可粉'],
        detail: '经典配方，酒味清浅，适合大多数人接受的软糯口感。',
        monthSales: 80,
        rate: 4.7
      },
      {
        id: 4,
        name: '芒果布丁',
        price: 28,
        image: '/image/products/pudding.jpg',
        categoryId: 2,
        description: '新鲜芒果制作',
        materials: ['新鲜芒果泥', '牛奶', '淡奶油', '吉利丁片'],
        detail: '果肉含量高，入口即化，清爽不腻，是夏日人气单品。',
        isNew: true,
        monthSales: 140,
        rate: 4.9
      },
      {
        id: 5,
        name: '拿铁咖啡',
        price: 32,
        image: '/image/products/coffee.jpg',
        categoryId: 3,
        description: '香醇浓郁',
        materials: ['阿拉比卡咖啡豆', '纯牛奶', '水'],
        detail: '采用自家拼配咖啡豆，中度烘焙，平衡酸度与香气，适合作为日常咖啡。',
        tempOptions: ['热', '冰'],
        sweetOptions: ['不加糖', '微糖', '半糖'],
        monthSales: 160,
        rate: 4.8
      },
      {
        id: 6,
        name: '珍珠奶茶',
        price: 25,
        image: '/image/products/tea.jpg',
        categoryId: 3,
        description: 'Q弹珍珠，丝滑奶茶',
        materials: ['红茶', '奶精基底', '黑糖珍珠'],
        detail: '现煮黑糖珍珠，保留嚼劲与焦糖香气，可根据喜好调节甜度与冰量。',
        tempOptions: ['热', '去冰', '少冰', '正常冰'],
        sweetOptions: ['三分糖', '五分糖', '七分糖', '全糖'],
        isHot: true,
        monthSales: 210,
        rate: 4.9
      },
      {
        id: 7,
        name: '法式面包',
        price: 18,
        image: '/image/products/bread1.jpg',
        categoryId: 4,
        description: '外酥内软',
        materials: ['高筋面粉', '酵母', '橄榄油', '盐'],
        detail: '长时间低温发酵，外皮微脆，内部组织均匀，有麦香与淡淡奶香。',
        monthSales: 70,
        rate: 4.6
      },
      {
        id: 8,
        name: '可颂',
        price: 22,
        image: '/image/products/croissant.jpg',
        categoryId: 4,
        description: '酥脆可口',
        materials: ['高筋面粉', '黄油', '酵母', '牛奶', '鸡蛋'],
        detail: '多层黄油折叠，撕开可以看到清晰分层，推荐搭配果酱或咖啡。',
        isHot: true,
        monthSales: 95,
        rate: 4.7
      },
      {
        id: 9,
        name: '鸡翅',
        price: 28,
        image: '/image/products/wings.jpg',
        categoryId: 5,
        description: '香辣鸡翅',
        materials: ['鸡中翅', '腌料', '辣椒', '蒜蓉'],
        detail: '先腌后烤，外皮焦香，肉质多汁，可选辣度搭配冰饮更爽口。',
        monthSales: 60,
        rate: 4.5
      },
      {
        id: 10,
        name: '薯条',
        price: 20,
        image: '/image/products/fries.jpg',
        categoryId: 5,
        description: '酥脆薯条',
        materials: ['土豆', '食用油', '盐'],
        detail: '现切现炸，表层酥脆内里绵软，建议趁热食用口感最佳。',
        monthSales: 85,
        rate: 4.6
      }
    ];

    const product = products.find(p => p.id === id);
    if (!product) {
      my.showToast({ content: '商品不存在', type: 'fail' });
      return;
    }

    const favorites = my.getStorageSync({ key: 'favorites' }).data || [];
    const isFavorite = favorites.some(item => item.id === id);

    this.setData({
      product,
      sweet: product.sweetOptions ? product.sweetOptions[0] : '',
      temperature: product.tempOptions ? product.tempOptions[0] : '',
      isFavorite
    });
  },

  onSweetChange(e) {
    this.setData({ sweet: e.currentTarget.dataset.value });
  },

  onTempChange(e) {
    this.setData({ temperature: e.currentTarget.dataset.value });
  },

  // 收藏/取消收藏
  toggleFavorite() {
    const { product, isFavorite } = this.data;
    let favorites = my.getStorageSync({ key: 'favorites' }).data || [];

    if (isFavorite) {
      favorites = favorites.filter(item => item.id !== product.id);
      my.showToast({ content: '已取消收藏', type: 'none' });
    } else {
      favorites.push(product);
      my.showToast({ content: '已加入收藏', type: 'success' });
    }

    my.setStorageSync({ key: 'favorites', data: favorites });
    this.setData({ isFavorite: !isFavorite });
  },

  // 加入购物车
  addToCart() {
    const { product, sweet, temperature } = this.data;
    if (!product.id) return;

    let cart = my.getStorageSync({ key: 'cart' }).data || [];
    const keyMatcher = item =>
      item.id === product.id &&
      item.sweet === sweet &&
      item.temperature === temperature;

    const existingItem = cart.find(keyMatcher);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        ...product,
        sweet,
        temperature,
        quantity: 1
      });
    }

    my.setStorageSync({ key: 'cart', data: cart });

    my.showToast({
      content: '已加入购物车',
      type: 'success'
    });
  }
});


