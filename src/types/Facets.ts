export interface FacetsResponse {
  facets: Facet[];
  sampling: boolean;
  breadcrumb: Breadcrumb[];
  queryArgs: QueryArgs;
  translated: boolean;
}

export interface Breadcrumb {
  name: string;
  href: string;
}

export interface Facet {
  values: Value[];
  type: Type;
  name: string;
  hidden: boolean;
  key: string;
  quantity: number;
}

export enum Type {
  Pricerange = "PRICERANGE",
  Text = "TEXT",
}

export interface Value {
  id?: string;
  quantity: number;
  name: string;
  key: string;
  value?: string;
  selected: boolean;
  href?: string;
  range?: Range;
}

export interface Range {
  from: number;
  to: number;
}

export interface QueryArgs {
  query: string;
  selectedFacets: SelectedFacet[];
}

export interface SelectedFacet {
  key: string;
  value: string;
}
