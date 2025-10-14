import {
  Text,
  View,
  Button,
  Page,
  TextInput,
  Image,
} from "eitri-luminus";
import { useState } from "react";
import HeaderComponent from "../components/HeaderComponent";

import { AgentRole, useAgent } from "eitri-agents";

export interface Product {
  productId: string;
  productName: string;
  images: Array<{
    imageUrl: string;
  }>;
  price: number;
}

interface InfoCard {
  id: string;
  type: "info";
  title: string;
  subtitle?: string;
  icon: string;
  bgColor: string;
  searchQuery?: string; // Query to trigger when card is clicked
}

type GridItem = Product | InfoCard;

export default function ChatPage() {
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<GridItem[]>([]);

  const agent = useAgent("SellerAgent", {
    verbose: true,
    // llm: 'openai',
    // model: 'gpt-5',
    llm: 'gemini',
    model: 'gemini-2.5-flash'
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
        content: `${query}`,
      }, {
        skipSentToolResultToAgent: true
      });

      if (!response.rawToolResult) {
        console.warn('No raw tool result found')
        return
      }

      console.log(response.rawToolResult)

      const data = response.rawToolResult

      // Parse the products from the agent response
      if (Array.isArray(data)) {
        const products = data.filter((item): item is Product => 'productId' in item);
        const mergedResults = mergeInfoCards(products);
        setSearchResults(mergedResults);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch(value);
    }
  };

  const handleInfoCardClick = (searchQuery: string) => {
    setValue(searchQuery);
    handleSearch(searchQuery);
  };

  const mergeInfoCards = (products: Product[]): GridItem[] => {
    const suggestions: InfoCard[] = [
      {
        id: "info-1",
        type: "info",
        title: "Presentes a partir de",
        subtitle: "R$ 39,99",
        icon: "✨",
        bgColor: "bg-purple-100",
        searchQuery: "Presentes até 50 reais"
      },
      {
        id: "info-2",
        type: "info",
        title: "Listras: a queridinha da estação",
        icon: "✓",
        bgColor: "bg-purple-100",
        searchQuery: "Roupas com listras"
      },
      {
        id: "info-3",
        type: "info",
        title: "Chegou agora as tendências de verão",
        icon: "🌺",
        bgColor: "bg-purple-100",
        searchQuery: "Tendências verão"
      },
      {
        id: "info-4",
        type: "info",
        title: "Looks para o trabalho",
        icon: "💼",
        bgColor: "bg-blue-100",
        searchQuery: "Roupas profissionais"
      },
      {
        id: "info-5",
        type: "info",
        title: "Esportivo e casual",
        icon: "👟",
        bgColor: "bg-green-100",
        searchQuery: "Roupas esportivas"
      }
    ];

    // Intelligently merge info cards with products
    const result: GridItem[] = [];
    const infoCardInterval = Math.max(3, Math.floor(products.length / suggestions.length));

    let infoCardIndex = 0;
    products.forEach((product, index) => {
      result.push(product);

      // Insert an info card after every few products
      if ((index + 1) % infoCardInterval === 0 && infoCardIndex < suggestions.length) {
        result.push(suggestions[infoCardIndex]);
        infoCardIndex++;
      }
    });

    // Add remaining info cards if there's space
    while (infoCardIndex < suggestions.length && result.length < 12) {
      result.push(suggestions[infoCardIndex]);
      infoCardIndex++;
    }

    return result;
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
            <View className="flex items-center justify-center h-full">
              <View className="flex flex-col items-center space-y-4">
                <View className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></View>
                <Text className="text-gray-600 font-medium">Buscando produtos...</Text>
              </View>
            </View>
          ) : searchResults.length === 0 ? (
            <View className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <Text className="text-2xl font-bold text-gray-800">
                Busca Inteligente de Moda
              </Text>
              <Text className="text-gray-500 max-w-md">
                Use a busca com IA para encontrar os produtos perfeitos. Experimente: "Look para inverno" ou "Roupa para festa"
              </Text>
            </View>
          ) : (
            <View className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {searchResults.map((item) => {
                // Type guard to check if item is an InfoCard
                const isInfoCard = (item: GridItem): item is InfoCard => {
                  return 'type' in item && item.type === 'info';
                };

                // Type guard to check if item is a Product
                const isProduct = (item: GridItem): item is Product => {
                  return 'productId' in item;
                };

                if (isInfoCard(item)) {
                  // Render InfoCard
                  return (
                    <View
                      key={item.id}
                      className={`rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer ${item.bgColor}`}
                      onClick={() => item.searchQuery && handleInfoCardClick(item.searchQuery)}
                    >
                      <View className="aspect-[3/4] flex flex-col items-center justify-center p-6 text-center">
                        <Text className="text-4xl mb-4">{item.icon}</Text>
                        <Text className="text-purple-900 font-semibold text-lg leading-tight">
                          {item.title}
                        </Text>
                        {item.subtitle && (
                          <Text className="text-purple-700 font-bold text-xl mt-2">
                            {item.subtitle}
                          </Text>
                        )}
                        <View className="mt-4 px-3 py-1 bg-white/50 rounded-full">
                          <Text className="text-xs text-purple-800 font-medium">
                            Clique para buscar
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                } else if (isProduct(item)) {
                  // Render Product
                  return (
                    <View
                      key={item.productId}
                      className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer bg-gray-50"
                    >
                      <View className="relative aspect-[3/4]">
                        <Image
                          src={item.images[0]?.imageUrl || ''}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      </View>
                      <View className="p-4">
                        <Text className="text-gray-900 font-semibold text-sm mb-1 line-clamp-2">
                          {item.productName}
                        </Text>
                        <Text className="text-purple-600 font-bold text-lg">
                          R$ {item.price.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  );
                }

                return null;
              })}
            </View>
          )}
        </View>
      </View>
    </Page>
  );
}
