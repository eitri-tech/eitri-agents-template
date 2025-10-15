import {
  Text,
  View,
  Button,
  Page,
  TextInput,
  Image,
} from "eitri-luminus";
import { useEffect, useState } from "react";
import HeaderComponent from "../components/HeaderComponent";
import { Vtex } from 'eitri-shopping-vtex-shared'

import { AgentRole, useAgent } from "eitri-agents";
import { OptimizeProductResponse } from "../types/Product";

type CategoryProducts = {
  [category: string]: OptimizeProductResponse[];
};

const ProductSkeleton = () => (
  <View className="flex-shrink-0 w-40 rounded-2xl overflow-hidden shadow-md bg-gray-50 animate-pulse" style={{ display: 'flex', flexDirection: 'column' }}>
    <View className="relative aspect-[3/4] bg-gray-200"></View>
    <View className="p-3" style={{ display: 'flex', flexDirection: 'column' }}>
      <View className="h-4 bg-gray-200 rounded mb-2"></View>
      <View className="h-4 bg-gray-200 rounded w-2/3 mb-1"></View>
      <View className="h-5 bg-gray-200 rounded w-1/2"></View>
    </View>
  </View>
);

const CategorySkeleton = () => (
  <View style={{ display: 'flex', flexDirection: 'column' }}>
    <View className="h-7 bg-gray-200 rounded w-48 mb-4 px-2 animate-pulse"></View>
    <View className="overflow-x-auto scrollbar-hide">
      <View className="flex flex-row gap-4 pb-2">
        {[1, 2, 3, 4].map((i) => (
          <ProductSkeleton key={i} />
        ))}
      </View>
    </View>
  </View>
);

export default function SearchPage() {
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<CategoryProducts>({});

  const agent = useAgent("Fashion", {
    verbose: true,
    // llm: 'openai',
    // model: 'gpt-5-mini'
  });


  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      return;
    }

    setIsLoading(true);
    setValue(query);

    try {
      const response = await agent.call({
        role: AgentRole.User,
        content: query,
      }, {
        skipSentToolResultToAgent: 'getProductsByBaseStyle'
      });

      const jsonData = response.rawToolResult as Record<string, OptimizeProductResponse[]>

      if (Object.keys(jsonData).length === 0) {
        console.warn(jsonData);
        setSearchResults({});
        return;
      }

      // Filter out empty categories
      const filteredProducts: CategoryProducts = {};
      Object.entries(jsonData).forEach(([category, products]) => {
        if (Array.isArray(products) && products.length > 0) {
          filteredProducts[category] = products;
        }
      });

      setSearchResults(filteredProducts);
    } catch (error) {
      console.error("Error searching:", error);
      setSearchResults({});
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch(value);
    }
  };


  return (
    <Page
      className="w-full h-screen bg-white flex flex-col"
      statusBarTextColor="black"
    >
      <View className="w-full max-w-6xl mx-auto flex flex-col h-full pt-12">

        {/* Search Bar with Camera Icon */}
        <View className="p-4 bg-white border-b border-gray-200">
          <View className="flex items-center space-x-3 bg-gray-100 rounded-full px-4 py-3">
            <View className="text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </View>
            <TextInput
              className="flex-1 bg-transparent border-none focus:outline-none text-gray-700 placeholder-gray-500"
              value={value}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
              onKeyUp={handleKeyPress}
              placeholder="Ex: Look para inverno"
              disabled={isLoading}
            />
            <Button
              onClick={() => handleSearch(value)}
              className="bg-black text-white rounded-full p-3 hover:bg-gray-800 transition-colors"
              disabled={isLoading}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Button>
          </View>
        </View>

        {/* Products Grid */}
        <View className="flex-1 overflow-y-auto p-4 bg-white">
          {isLoading ? (
            <View style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {[1, 2, 3].map((i) => (
                <CategorySkeleton key={i} />
              ))}
            </View>
          ) : Object.keys(searchResults).length === 0 ? (
            <View className="h-full items-center justify-center" style={{ display: 'flex', flexDirection: 'column' }}>
              <View className="text-center max-w-2xl px-6" style={{ display: 'flex', flexDirection: 'column' }}>
                <View className="mb-6" style={{ display: 'flex', flexDirection: 'column' }}>
                  <Text className="text-3xl font-bold text-gray-900 mb-4">
                    Busca Inteligente por IA
                  </Text>
                  <Text className="text-lg text-gray-600 leading-relaxed">
                    Use nossa inteligência artificial para encontrar produtos perfeitos para você.
                    Descreva o que procura com suas próprias palavras e deixe a IA fazer o resto.
                  </Text>
                </View>
                <View className="mt-4 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl" style={{ display: 'flex', flexDirection: 'column' }}>
                  <Text className="text-sm text-gray-700 mb-3 font-semibold">
                    Exemplos de buscas:
                  </Text>
                  <View className="space-y-2 text-left" style={{ display: 'flex', flexDirection: 'column' }}>
                    <Text className="text-sm text-gray-600">Look casual para o fim de semana</Text>
                    <Text className="text-sm text-gray-600">Roupa elegante para jantar</Text>
                    <Text className="text-sm text-gray-600">Conjunto esportivo confortável</Text>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <View className="space-y-8" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {Object.entries(searchResults).map(([category, products]) => (
                <View key={category} style={{ display: 'flex', flexDirection: 'column' }}>
                  {/* Category Title */}
                  <Text className="text-xl font-bold text-gray-900 mb-4 px-2">
                    {category}
                  </Text>

                  {/* Horizontal Scrollable Product List */}
                  <View className="overflow-x-auto scrollbar-hide">
                    <View className="flex flex-row gap-4 pb-2">
                      {products.map((product) => (
                        <View
                          key={product.productId}
                          className="flex-shrink-0 w-40 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer bg-gray-50"
                          style={{ display: 'flex', flexDirection: 'column' }}
                        >
                          <View className="relative aspect-[3/4]">
                            <Image
                              src={product.imageUrl}
                              alt={product.productName}
                              className="w-full h-full object-cover"
                            />
                          </View>
                          <View className="p-3" style={{ display: 'flex', flexDirection: 'column' }}>
                            <Text className="text-gray-900 font-semibold text-sm mb-1 line-clamp-2">
                              {product.productName}
                            </Text>
                            <Text className="text-purple-600 font-bold text-base">
                              {product.price.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </Page>
  );
}
