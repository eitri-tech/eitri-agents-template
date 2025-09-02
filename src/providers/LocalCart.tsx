import { createContext, useContext, useEffect, useState } from "react";
import {
  getCart,
  addItemToCart,
  removeCartItem,
  changeItemQuantity,
} from "../services/CartService";
import { App } from "eitri-shopping-vtex-shared";
import Eitri from "eitri-bifrost";

type CartContextType = {
  setCart: React.Dispatch<React.SetStateAction<any>>;
  startCart: () => Promise<any>;
  cart: any;
  cartIsLoading: boolean;
  addItem: (payload: any) => Promise<any>;
  removeItem: (itemId: string) => Promise<any>;
  updateItemQuantity: (index: number, newQuantity: number) => Promise<any>;
};

const LocalCart = createContext({} as CartContextType);

export default function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [cartIsLoading, setCartInLoading] = useState(false);
  const [configured, setConfigured] = useState(false);

  useEffect(() => {
    if (configured) return;

    App.tryAutoConfigure({ verbose: false }).then(() => {
      setConfigured(true);
      startCart();
    });
  }, []);

  useEffect(() => {
    Eitri.eventBus.subscribe(
      {
        channel: "cartListen",
        callback: (data) => {
          // Handle the received data here
          console.log("Receiving event");
          setCart(data);
        },
      },
    );

    return () => {
      Eitri.eventBus.clearChannel("cartListen");
    };
  }, []);

  const executeCartOperation = async (operation, ...args) => {
    setCartInLoading(true);
    const newCart = await operation(...args);
    setCart(newCart);
    setCartInLoading(false);
    return newCart;
  };

  const startCart = async () => {
    console.log("startCart");
    return executeCartOperation(getCart);
  };

  const addItem = async (payload) => {
    return executeCartOperation(addItemToCart, payload);
  };

  const removeItem = async (itemId) => {
    return executeCartOperation(removeCartItem, itemId);
  };

  const updateItemQuantity = async (index, newQuantity) => {
    return executeCartOperation(changeItemQuantity, index, newQuantity);
  };

  return (
    <LocalCart.Provider
      value={{
        setCart,
        startCart,
        cart,
        cartIsLoading,
        addItem,
        removeItem,
        updateItemQuantity,
      }}
    >
      {children}
    </LocalCart.Provider>
  );
}

export function useLocalShoppingCart() {
  const context = useContext(LocalCart);

  return context;
}
