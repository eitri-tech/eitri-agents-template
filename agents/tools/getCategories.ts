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
    fullText: item.searchQuery,
  } as never)) as FacetsResponse;

  if (!result.facets) return [];

  // const facets = [];

  // result.facets.forEach((facet) =>
  //   facet.values.forEach((item) => {
  //     facets.push({
  //       id: item.id,
  //       name: item.name,
  //       key: item.key,
  //       value: item.value,
  //     });
  //   })
  // );

  // return facets;
  return result.facets.map((facet) => ({
    key: facet.key,
    name: facet.name,
    values: facet.values.map((value) => ({
      id: value.id,
      name: value.name,
      key: value.key,
      value: value.value,
    })),
  }));
};

export default async function getCategories(
  data: StyleSegmentation
): Promise<Facet[]> {
  console.log("Buscando facets");

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
}
