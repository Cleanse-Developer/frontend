import { create } from "zustand";

export const useCartStore = create((set, get) => ({
  cartItems: [],

  addToCart: (product) => {
    set((state) => {
      const existingItem = state.cartItems.find(
        (item) => item.name === product.name
      );
      if (existingItem) {
        const updatedItems = state.cartItems.map((item) => {
          if (item.name === product.name) {
            const currentQuantity = Number(item.quantity) || 1;
            const newQuantity = currentQuantity + 1;

            return { ...item, quantity: newQuantity };
          }
          return item;
        });
        return { cartItems: updatedItems };
      }

      const newItem = { ...product, quantity: 1 };

      return {
        cartItems: [...state.cartItems, newItem],
      };
    });
  },

  removeFromCart: (productName) => {
    set((state) => ({
      cartItems: state.cartItems.filter((item) => item.name !== productName),
    }));
  },

  updateQuantity: (productName, newQuantity) => {
    set((state) => ({
      cartItems: state.cartItems.map((item) =>
        item.name === productName
          ? { ...item, quantity: Math.max(1, newQuantity) }
          : item
      ),
    }));
  },

  clearCart: () => set({ cartItems: [] }),
}));

export const useCartCount = () =>
  useCartStore((state) =>
    state.cartItems.reduce((total, item) => total + (item.quantity || 1), 0)
  );

export const useCartSubtotal = () =>
  useCartStore((state) =>
    state.cartItems.reduce(
      (total, item) => total + parseFloat(item.price) * (item.quantity || 1),
      0
    )
  );
