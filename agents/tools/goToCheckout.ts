import Eitri from "eitri-bifrost";
import { Vtex } from "eitri-shopping-vtex-shared";

interface CheckoutParams {
  orderFormId?: string;
}

export default async function goToCheckout(params: CheckoutParams) {
  if (!params?.orderFormId) {
    const cart = await Vtex.cart.getCartIfExists();
    params.orderFormId = cart?.orderFormId;
  }
  console.log("Navegando para checkout", { orderFormId: params.orderFormId });

  await Eitri.navigation.open({
    slug: "eitri-poc-ai-checkout",
    initParams: { orderFormId: params.orderFormId },
  });
}
