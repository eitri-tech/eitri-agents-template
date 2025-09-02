import { Vtex } from "eitri-shopping-vtex-shared";

interface GetProductArgsType {
  text: string;
  options?: unknown;
}

export default async function getProducts(args: GetProductArgsType) {
  const query = args.text;

  try {
    const data = await Vtex.catalog.searchProduct(query, {
      hideUnavailableItems: true,
    });

    return data.products.slice(0, 5).map((product) => ({
      productId: product.productId || product.id || product.productI,
      productName: product.productName,
      images: product.items?.[0]?.images,
      price: product.items?.[0]?.sellers?.[0]?.commertialOffer?.Price,
      description: product?.description?.substring(0, 300),
    }));
  } catch (error) {
    console.error("Error fetching products from VTEX API:", error);
    return []; // Return an empty array in case of an error
  }
}
