import { CartType } from "eitri-poc-ai/src/types/cart";
import { Vtex } from "eitri-shopping-vtex-shared";

export default async function getCart(): Promise<CartType> {
  const cart = await Vtex.cart.getCartIfExists();

  return cart;
}
