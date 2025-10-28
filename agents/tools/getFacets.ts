import { Vtex } from "eitri-shopping-vtex-shared";
import {
  StyleSegmentation,
  StyleSegmentationItem,
} from "@/types/Recommendation";
import { FacetsResponse } from "@/types/Facets";

type SimplifiedFacet = {
  key: string;
  name: string;
  values: {
    name: string;
    key: string;
    value: string;
  }[];
};

const searchFacetsForItem = async (
  item: StyleSegmentationItem
): Promise<SimplifiedFacet[]> => {
  const result = (await Vtex.searchGraphql.facets({
    hideUnavailableItems: true,
    fullText: item.categoryName + " " + item.subcategoryName,
    removeHiddenFacets: true,
    // operator: "or",
  } as never)) as FacetsResponse;

  if (!result.facets) return [];

  return result.facets
    .filter((facet) => facet.values.length > 0)
    .map((facet) => ({
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
          value: value.value || "",
        })),
    }));
};

const buildFacetString = (facets: SimplifiedFacet[]): string => {
  if (!facets || facets.length === 0) return "";

  const facetParts: string[] = [];

  facets.forEach((facet) => {
    if (facet.values && facet.values.length > 0) {
      facet.values.forEach((value) => {
        if (value.key && value.value) {
          facetParts.push(`${value.key}/${value.value}`);
        }
      });
    }
  });

  if (facetParts.length === 0) return "";

  return `/${facetParts.join("/")}/`;
};

export default async function getFacets(args: {
  data: StyleSegmentation;
}): Promise<StyleSegmentation> {
  const { data } = args;
  try {
    console.log("Buscando facets, dados recebidos: ", JSON.stringify(data));

    // Validate input
    if (!data) {
      console.error("getFacets: data is null or undefined");
      throw new Error("StyleSegmentation data is required");
    }

    if (!data.items || !Array.isArray(data.items)) {
      console.error("getFacets: data.items is not an array", data);
      throw new Error("StyleSegmentation.items must be an array");
    }

    if (data.items.length === 0) {
      console.warn("getFacets: data.items is empty, returning original data");
      return data;
    }

    // Search facets for all items in parallel
    const promises = data.items.map((item) => searchFacetsForItem(item));
    const facetsResults = await Promise.all(promises);

    // Enrich each item with facet string
    const enrichedItems: StyleSegmentationItem[] = data.items.map(
      (item, index) => {
        const itemFacets = facetsResults[index];
        const facetString = buildFacetString(itemFacets);

        console.log(`Item ${item.name}: facet = ${facetString}`);

        return {
          ...item,
          facet: facetString,
        };
      }
    );

    // Return enriched StyleSegmentation
    const result = {
      ...data,
      items: enrichedItems,
    };

    console.log("getFacets: retornando resultado enriquecido");

    return result;
  } catch (error) {
    console.error("getFacets: erro ao processar", error);
    throw error;
  }
}
