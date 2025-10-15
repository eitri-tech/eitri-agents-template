import { Product } from "@/types/Product";
import { Vtex } from "eitri-shopping-vtex-shared";

interface GetProductArgsType {
  categories: { name: string; categoryId: string; subCategoryId: string }[];
  searchQuery: string;
}

const search = async (
  args: { name: string; categoryId: string; subCategoryId: string },
  searchQuery: string
) => {
  let category = `C:/${args.categoryId}`;

  if (args.subCategoryId) {
    category = `${category}/${args.subCategoryId}`;
  }

  try {
    const data = (await Vtex.catalog.searchProduct(searchQuery, {
      hideUnavailableItems: true,
      fq: category,
    })) as { products: Product[] };

    console.log(data);

    return {
      name: args.name,
      products: data.products.map((product) => ({
        productId: product.productId,
        productName: product.productName,
        images: product.items?.[0]?.images,
        price: product.items?.[0]?.sellers?.[0]?.commertialOffer?.Price,
      })),
    };
  } catch (error) {
    console.error("Error fetching products from VTEX API:", error);
    return []; // Return an empty array in case of an error
  }
};

export default async function getProducts(
  args: GetProductArgsType
): Promise<Record<string, Partial<Product>[]>> {
  const promises = args.categories.map((category) =>
    search(category, args.searchQuery)
  );

  const data = await Promise.all(promises);

  return data.reduce((acc, curr) => {
    acc[curr.name] = curr.products || [];
    return acc;
  }, {} as Record<string, Partial<Product>[]>);
}
