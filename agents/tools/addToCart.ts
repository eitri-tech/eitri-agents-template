import { Vtex } from "eitri-shopping-vtex-shared";
import Eitri from "eitri-bifrost";

interface ArgumentsType {
  productId: string;
}

export default async function addToCart(args: ArgumentsType): Promise<any> {
  console.log("Find product", args.productId);
  const product = await Vtex.catalog.getProductById(args.productId);
  console.log("Product found", { id: args.productId });

  console.log("Adding item to cart", { id: args.productId });
  await Vtex.cart.addItem(product.items[0]);
  console.log("Item added to cart");

  const cart = await Vtex.cart.getCartIfExists();

  if (!cart) {
    console.warn("Cart not found");
    return;
  }
  Eitri.eventBus.publish({
    channel: "cartListen",
    data: cart,
  });

  return {
    productId: args.productId,
    quantity: 1,
    inserted: true,
  };
}
