import { Vtex } from "eitri-shopping-vtex-shared";
import { Category } from "../../src/types/Category";

export default async function getCategories(data: any): Promise<Category[]> {
  console.log("Buscando categorias");

  return (await Vtex.catalog.getCategoryTree(1)) as Category[];
}
