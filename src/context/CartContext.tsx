
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  emoji: string;
  quantity: number;
  stock: number;
  category?: string;
  size?: string;
};

type NewCartItem = Omit<CartItem, 'quantity'>;

type AddToCartOptions = {
  /**
   * Used by Buy Again.
   *
   * When true, the product can be restored
   * to the cart even if the stock value stored
   * with the old order is no longer available.
   *
   * Normal product adding should NOT use this.
   */
  ignoreStockLimit?: boolean;
};

type CartContextType = {
  items: CartItem[];

  addToCart: (
    product: NewCartItem,
    options?: AddToCartOptions
  ) => void;

  changeQuantity: (
    id: string,
    change: number
  ) => void;

  clearCart: () => void;
};

const CartContext =
  createContext<CartContextType | undefined>(
    undefined
  );

type CartProviderProps = {
  children: ReactNode;
};

export function CartProvider({
  children,
}: CartProviderProps) {
  const [items, setItems] =
    useState<CartItem[]>([]);

  /* =========================
     ADD TO CART
  ========================= */

  const addToCart = (
    product: NewCartItem,
    options?: AddToCartOptions
  ) => {
    setItems((currentItems) => {
      const existingItem =
        currentItems.find(
          (item) =>
            item.id === product.id
        );

      const ignoreStockLimit =
        options?.ignoreStockLimit === true;

      /* =========================
         PRODUCT ALREADY EXISTS
      ========================= */

      if (existingItem) {
        /*
         * Buy Again / special restore mode
         *
         * Don't block the item because
         * of an old stock value.
         */
        if (ignoreStockLimit) {
          return currentItems.map(
            (item) =>
              item.id === product.id
                ? {
                    ...item,
                    quantity:
                      item.quantity + 1,
                    price: product.price,
                    stock: Math.max(
                      item.stock,
                      product.stock,
                      item.quantity + 1
                    ),
                    emoji:
                      product.emoji ||
                      item.emoji,
                  }
                : item
          );
        }

        /*
         * Normal shopping:
         * respect current stock.
         */
        if (
          existingItem.quantity >=
          product.stock
        ) {
          return currentItems;
        }

        return currentItems.map(
          (item) =>
            item.id === product.id
              ? {
                  ...item,
                  quantity:
                    item.quantity + 1,
                  price: product.price,
                  stock: product.stock,
                  emoji:
                    product.emoji ||
                    item.emoji,
                }
              : item
        );
      }

      /* =========================
         NEW PRODUCT
      ========================= */

      /*
       * Buy Again mode:
       * restore the product even when
       * the old stock value is 0.
       */
      if (ignoreStockLimit) {
        return [
          ...currentItems,
          {
            ...product,
            quantity: 1,

            /*
             * Make sure the restored
             * product has enough stock
             * for the first cart unit.
             */
            stock: Math.max(
              1,
              product.stock
            ),
          },
        ];
      }

      /*
       * Normal shopping:
       * don't add an out-of-stock product.
       */
      if (product.stock <= 0) {
        return currentItems;
      }

      return [
        ...currentItems,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  };

  /* =========================
     CHANGE QUANTITY
  ========================= */

  const changeQuantity = (
    id: string,
    change: number
  ) => {
    setItems((currentItems) =>
      currentItems
        .map((item) => {
          if (item.id !== id) {
            return item;
          }

          const newQuantity =
            item.quantity + change;

          /*
           * Remove product when
           * quantity reaches 0.
           */
          if (newQuantity <= 0) {
            return {
              ...item,
              quantity: 0,
            };
          }

          /*
           * Never allow quantity
           * above available stock.
           */
          if (
            newQuantity > item.stock
          ) {
            return item;
          }

          return {
            ...item,
            quantity: newQuantity,
          };
        })
        .filter(
          (item) => item.quantity > 0
        )
    );
  };

  /* =========================
     CLEAR CART
  ========================= */

  const clearCart = () => {
    setItems([]);
  };

  /* =========================
     PROVIDER
  ========================= */

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        changeQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/* =========================
   HOOK
========================= */

export function useCart(): CartContextType {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      'useCart must be used inside a CartProvider'
    );
  }

  return context;
}
