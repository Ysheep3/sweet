import Cart from '/utils/cart'

Component({
  properties: {
    visible: {
      type: Boolean,
      value: false
    }
  },

  data: {
    cartItems: []
  },

  observers: {
    visible(val) {
      if (val) {
        this.sync()
      }
    }
  },

  methods: {
    async sync() {
      const cartItems = await Cart.fetchCart()
      this.setData({ cartItems })
    },

    async increase(e) {
      const item = e.currentTarget.dataset.item
      const type = item.dishId ? 1 : 2
      const id = item.dishId || item.setmealId

      await Cart.add(type, id)
      this.sync()
      this.triggerEvent('change')
    },

    async decrease(e) {
      const item = e.currentTarget.dataset.item
      const type = item.dishId ? 1 : 2
      const id = item.dishId || item.setmealId

      await Cart.remove(type, id)
      const cartItems = await Cart.fetchCart()

      this.setData({ cartItems })
      this.triggerEvent('change')

      if (cartItems.length === 0) {
        this.triggerEvent('close')
      }
    },

    async onClear() {
      await Cart.clear()
      this.setData({ cartItems: [] })
      this.triggerEvent('change')
      this.triggerEvent('close')
    },

    onClose() {
      this.triggerEvent('close')
    }
  }
})
