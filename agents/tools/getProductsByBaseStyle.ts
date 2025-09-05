import { Vtex } from "eitri-shopping-vtex-shared";
import { Product } from "../../src/types/Product";
import {
  StyleSegmentation,
  StyleSegmentationItem,
} from "../../src/types/Recommendation";

const search = async (item: StyleSegmentationItem) => {
  let category = `C:/${item.categoryId}`;

  if (item.subcategoryId) {
    category = `${category}/${item.subcategoryId}`;
  }

  const data = (await Vtex.catalog.searchProduct(item.searchQuery, {
    hideUnavailableItems: true,
    fq: category,
  })) as { products: Product[] };

  return {
    name: item.name,
    products: data.products.map((product) => ({
      productId: product.productId,
      productName: product.productName,
      imageUrl: product.items?.[0]?.images[0]?.imageUrl,
      price: product.items?.[0]?.sellers?.[0]?.commertialOffer?.Price,
    })),
  };
};

export default async function getProductsByBaseStyle(
  args: StyleSegmentation
): Promise<Record<string, Partial<Product>[]>> {
  const promises = args.items.map((item) => search(item));

  const data = await Promise.all(promises);

  return data.reduce((acc, curr) => {
    acc[curr.name] = curr.products || [];
    return acc;
  }, {} as Record<string, Partial<Product>[]>);
}
