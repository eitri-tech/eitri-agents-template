export interface ClothRecommendationType {
  baseStyle: string;
  description: string;
  items: ClothItem[];
}

export interface ClothItem {
  name: string;
  description: string;
  keywords: string[];
}
