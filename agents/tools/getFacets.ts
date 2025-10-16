import { Vtex } from "eitri-shopping-vtex-shared";
import { Category } from "../../src/types/Category";
import {
  StyleSegmentation,
  StyleSegmentationItem,
} from "@/types/Recommendation";
import { Facet, FacetsResponse } from "@/types/Facets";

const search = async (item: StyleSegmentationItem) => {
  const result = (await Vtex.searchGraphql.facets({
    hideUnavailableItems: true,
    fullText: item.categoryName + " " + item.subcategoryName,
  } as never)) as FacetsResponse;

  if (!result.facets) return [];

  return result.facets.map((facet) => ({
    key: facet.key,
    name: facet.name,
    values: facet.values
      .filter(
        (facetItem) =>
          facetItem.name === item.categoryName ||
          facetItem.name === item.subcategoryName
      )
      .map((value) => ({
        name: value.name,
        key: value.key,
        value: value.value,
      })),
  }));
};

export default async function getFacets(
  data: StyleSegmentation
): Promise<Facet[]> {
  try {
    console.log("Buscando facets: ", data);

    let facets = [];

    const promises = [];

    data.items.forEach((item) => {
      promises.push(search(item));
    });

    const results = await Promise.all(promises);

    results.forEach((result) => {
      facets.push(...result);
    });

    return facets;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
