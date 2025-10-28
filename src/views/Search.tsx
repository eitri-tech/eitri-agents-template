import { Text, View, Button, Page, TextInput, Image } from "eitri-luminus";
import { useEffect, useState } from "react";
import {
  HiMicrophone,
  HiStop,
  HiCamera,
  HiPaperAirplane,
} from "react-icons/hi";
import { Vtex } from "eitri-shopping-vtex-shared";
import Eitri from "eitri-bifrost";

import { AgentRole, useAgent } from "eitri-agents";
import { OptimizeProductResponse } from "../types/Product";
import { Category } from "@/types/Category";
import { StyleSegmentation, StyleSegmentationItem } from "@/types/Recommendation";

type CategoryLoadingState = {
  [category: string]: {
    isLoading: boolean;
    products: OptimizeProductResponse[];
    description?: string;
  };
};

const ProductSkeleton = () => (
  <View
    className="shrink-0 rounded-2xl overflow-hidden shadow-md bg-white animate-pulse"
    style={{
      display: "flex",
      flexDirection: "column",
      width: "160px",
      minWidth: "160px",
    }}
  >
    <View className="relative aspect-[3/4] bg-gray-200"></View>
    <View
      className="p-3"
      style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
    >
      <View className="h-4 bg-gray-200 rounded"></View>
      <View className="h-4 bg-gray-200 rounded w-2/3"></View>
      <View className="h-5 bg-gray-200 rounded w-1/2 mt-1"></View>
    </View>
  </View>
);

const CategorySkeleton = () => (
  <View style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
    <View className="px-2" style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
      <View className="h-7 bg-gray-200 rounded w-48 animate-pulse"></View>
      <View className="h-4 bg-gray-200 rounded w-64 animate-pulse"></View>
    </View>
    <View className="overflow-x-auto scrollbar-hide">
      <View className="flex flex-row gap-4 pb-4 px-2">
        {[1, 2, 3, 4].map((i) => (
          <ProductSkeleton key={i} />
        ))}
      </View>
    </View>
  </View>
);

const AILoadingComponent = ({ status }: { status: any }) => {
  const [pulseScale, setPulseScale] = useState(1);
  const [dotStates, setDotStates] = useState([0, 0, 0]);

  useEffect(() => {
    // Pulse animation
    const pulseInterval = setInterval(() => {
      setPulseScale((prev) => (prev === 1 ? 1.1 : 1));
    }, 1000);

    // Dots bounce animation
    const dotInterval = setInterval(() => {
      setDotStates((prev) => {
        const newStates = [...prev];
        const time = Date.now() % 1400;
        newStates[0] = time < 560 ? Math.sin((time / 560) * Math.PI) : 0;
        newStates[1] =
          time >= 160 && time < 720
            ? Math.sin(((time - 160) / 560) * Math.PI)
            : 0;
        newStates[2] =
          time >= 320 && time < 880
            ? Math.sin(((time - 320) / 560) * Math.PI)
            : 0;
        return newStates;
      });
    }, 50);

    return () => {
      clearInterval(pulseInterval);
      clearInterval(dotInterval);
    };
  }, []);

  const getStatusMessage = () => {
    if (!status) return "Preparando sua busca...";

    switch (status.type) {
      case "generating_embedding":
        return "Analisando sua solicitação...";
      case "calling_ai":
        return "Consultando nossa inteligência artificial...";
      case "executing_tool":
        return status.toolName === "getProductsByBaseStyle"
          ? "Buscando os melhores produtos para você..."
          : "Processando informações...";
      case "idle":
      default:
        return "Preparando sua busca...";
    }
  };

  return (
    <View
      className="flex items-center justify-center py-16"
      style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
    >
      {/* AI Animation Effect */}
      <View style={{ position: "relative", width: "80px", height: "80px" }}>
        {/* Outer pulsing circle */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            backgroundColor: "rgba(0, 0, 0, 0.05)",
            transform: `scale(${pulseScale})`,
            transition: "transform 1s cubic-bezier(0.4, 0, 0.6, 1)",
          }}
        ></View>

        {/* Center gradient orb */}
        <View
          style={{
            position: "relative",
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #374151 0%, #1f2937 100%)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Inner animated dots */}
          <View
            style={{ display: "flex", gap: "0.375rem", alignItems: "center" }}
          >
            {dotStates.map((scale, i) => (
              <View
                key={i}
                style={{
                  width: "8px",
                  height: "8px",
                  backgroundColor: "white",
                  borderRadius: "50%",
                  transform: `scale(${0.5 + scale * 0.5})`,
                  opacity: 0.5 + scale * 0.5,
                  transition: "all 0.05s ease-in-out",
                }}
              ></View>
            ))}
          </View>
        </View>
      </View>

      {/* Status Message */}
      <View
        className="text-center max-w-md px-4"
        style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
      >
        <Text className="text-lg font-semibold text-gray-800">
          {getStatusMessage()}
        </Text>
        <Text className="text-sm text-gray-500">Aguarde alguns instantes</Text>
      </View>

      {/* Loading skeleton preview */}
      <View
        className="w-full mt-8"
        style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
      >
        {[1, 2].map((i) => (
          <CategorySkeleton key={i} />
        ))}
      </View>
    </View>
  );
};

// Function to search products for a single item
const searchProductsForItem = async (
  item: StyleSegmentationItem
): Promise<{ name: string; products: OptimizeProductResponse[] }> => {
  const facet = item.facet || "";

  console.log("Buscando produto pelo facet: ", facet);

  try {
    const result = await Vtex.catalog.getProductsByFacets(facet, {
      hideUnavailableItems: true,
    });

    return {
      name: item.name,
      products: result.products.map((product: any) => ({
        productId: product.productId,
        productName: product.productName,
        imageUrl: product.items?.[0]?.images[0]?.imageUrl,
        price: product.items?.[0]?.sellers?.[0]?.commertialOffer?.Price,
      })),
    };
  } catch (error) {
    console.error(`Erro ao buscar produtos para ${item.name}:`, error);
    return {
      name: item.name,
      products: [],
    };
  }
};

export default function SearchPage() {
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [categoryStates, setCategoryStates] = useState<CategoryLoadingState>({});
  const [image, setImage] = useState<{ data: string; mimeType: string } | null>(
    null
  );
  const [isListening, setIsListening] = useState(false);
  const [categories, setCategories] = useState<
    {
      id: number;
      name: string;
      children: {
        id: number;
        name: string;
      }[];
    }[]
  >([]);

  const agent = useAgent("Fashion", {
    verbose: true,
    knowledgeBasePrompt:
      "Use as categorias abaixo para melhorar a inferência para busca dos Facets para ter uma precisão maior na busca de produtos. Use apenas as categorias abaixo.",
    // llm: 'openai',
    // model: 'gpt-5'
    llm: "gemini",
    model: "gemini-2.5-flash",
  });

  const setKnowledge = async () => {
    setIsLoading(true);
    const categories: Category[] = await Vtex.catalog.getCategoryTree(2);

    const preparedCategories = categories.map((category) => ({
      id: category.id,
      name: category.name,
      children: category.children.map((child) => ({
        id: child.id,
        name: child.name,
      })),
    }));

    setCategories(preparedCategories);

    const data = preparedCategories.map((category) => ({
      id: String(category.id),
      content: JSON.stringify(category),
    }));

    await agent.initializeKnowledgeBase(data);

    setIsLoading(false);
  };

  useEffect(() => {
    setKnowledge();
  }, []);

  // Process style segmentation and load products progressively
  const processStyleSegmentation = async (styleSegmentation: StyleSegmentation) => {
    // Initialize category states with loading skeletons
    const initialStates: CategoryLoadingState = {};
    styleSegmentation.items.forEach((item) => {
      initialStates[item.name] = {
        isLoading: true,
        products: [],
        description: item.description,
      };
    });
    setCategoryStates(initialStates);

    // Load products for each item independently
    styleSegmentation.items.forEach(async (item) => {
      try {
        const result = await searchProductsForItem(item);

        // Update state for this specific category
        setCategoryStates((prev) => ({
          ...prev,
          [result.name]: {
            isLoading: false,
            products: result.products,
            description: item.description,
          },
        }));
      } catch (error) {
        console.error(`Erro ao carregar produtos para ${item.name}:`, error);
        setCategoryStates((prev) => ({
          ...prev,
          [item.name]: {
            isLoading: false,
            products: [],
            description: item.description,
          },
        }));
      }
    });
  };

  const handleImagePick = async () => {
    try {
      const files = await Eitri.fs.openFilePicker({
        fileExtension: ["jpg", "jpeg", "png"],
      });

      if (files && files.length > 0) {
        const selectedImage = {
          data: await files[0].toBase64(),
          mimeType: files[0].mimeType,
        };
        setImage(selectedImage);
        // Automatically search with the image
        handleSearchWithImage(selectedImage);
      }
    } catch (error) {
      console.error("Image pick failed:", error);
    }
  };

  const handleSearchWithImage = async (imageData: {
    data: string;
    mimeType: string;
  }) => {
    setIsLoading(true);
    setValue(""); // Clear text input when using image

    const prompt =
      `Forneça uma recomendação de estilo. Foque somente nas roupas e acessórios. Abaixo tenho as categorias da minha loja recomende as categorias relevantes baseado na imagem fornecida, recomende até 5 categorias:
      CATEGORIAS:
      ${JSON.stringify(categories)}
      `.trim();

    try {
      const response = await agent.call(
        {
          content: prompt,
          role: AgentRole.User,
          file: {
            mimeType: imageData.mimeType,
            data: imageData.data,
          },
        },
        { skipSentToolResultToAgent: ["getFacets"] }
      );

      const styleSegmentation = response.rawToolResult as StyleSegmentation;

      if (!styleSegmentation || !styleSegmentation.items || styleSegmentation.items.length === 0) {
        console.warn("Nenhum item retornado:", styleSegmentation);
        setCategoryStates({});
        setIsLoading(false);
        return;
      }

      // Process style segmentation and load products progressively
      setIsLoading(false);
      await processStyleSegmentation(styleSegmentation);
    } catch (error) {
      console.error("Error searching with image:", error);
      setCategoryStates({});
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      return;
    }

    setIsLoading(true);
    setValue(query);
    setImage(null); // Clear image when using text search

    try {
      const response = await agent.call(
        {
          role: AgentRole.User,
          content: query,
        },
        {
          skipSentToolResultToAgent: ["getFacets"],
        }
      );

      const styleSegmentation = response.rawToolResult as StyleSegmentation;

      if (!styleSegmentation || !styleSegmentation.items || styleSegmentation.items.length === 0) {
        console.warn("Nenhum item retornado:", styleSegmentation);
        setCategoryStates({});
        setIsLoading(false);
        return;
      }

      // Process style segmentation and load products progressively
      setIsLoading(false);
      await processStyleSegmentation(styleSegmentation);
    } catch (error) {
      console.error("Error searching:", error);
      setCategoryStates({});
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch(value);
    }
  };

  const handleVoiceSearch = async () => {
    try {
      setIsListening(true);
      setImage(null); // Clear image when using voice

      const result = await Eitri.exposedApis.speech.recognizeOnce({
        language: "pt-BR",
      });
      setIsListening(false);

      if (!result) {
        console.warn("Nenhuma mensagem recebida");
        return;
      }

      // Set the value in the input and trigger search immediately
      setValue(result);
      await handleSearch(result);
    } catch (error) {
      console.error("Erro ao capturar áudio:", error);
      setIsListening(false);
    }
  };

  const handleProductClick = (productId: string) => {
    try {
      Eitri.nativeNavigation.open({
        slug: "pdp",
        initParams: { productId },
      });
    } catch (error) {
      console.error("Erro ao abrir a página de detalhes do produto:", error);
    }
  };

  return (
    <Page
      className="w-full h-screen bg-white flex flex-col"
      statusBarTextColor="black"
      topInset
    >
      <View className="w-full max-w-6xl mx-auto flex flex-col h-full">
        {/* Products Grid - Now takes full space minus bottom input */}
        <View
          className="flex-1 overflow-y-auto bg-white"
          style={{
            paddingTop: "2rem",
            paddingLeft: "1rem",
            paddingRight: "1rem",
            paddingBottom: image ? "200px" : "140px"
          }}
        >
          {isLoading ? (
            <AILoadingComponent status={agent.status} />
          ) : Object.keys(categoryStates).length === 0 ? (
            <View
              className="h-full items-center justify-center"
              style={{ display: "flex", flexDirection: "column" }}
            >
              <View
                className="text-center max-w-2xl px-6"
                style={{ display: "flex", flexDirection: "column" }}
              >
                <View
                  className="mb-6"
                  style={{ display: "flex", flexDirection: "column" }}
                >
                  <Text className="text-3xl font-bold text-gray-900 mb-4">
                    Busca Inteligente por IA
                  </Text>
                  <Text className="text-lg text-gray-600 leading-relaxed">
                    Use nossa inteligência artificial para encontrar produtos
                    perfeitos para você. Descreva o que procura com suas
                    próprias palavras e deixe a IA fazer o resto.
                  </Text>
                </View>
                <View
                  className="mt-4 p-6 bg-primary/5 rounded-2xl"
                  style={{ display: "flex", flexDirection: "column" }}
                >
                  <Text className="text-sm text-gray-700 mb-3 font-semibold">
                    Exemplos de buscas:
                  </Text>
                  <View
                    className="space-y-2 text-left"
                    style={{ display: "flex", flexDirection: "column" }}
                  >
                    <Text className="text-sm text-gray-600">
                      Look casual para o fim de semana
                    </Text>
                    <Text className="text-sm text-gray-600">
                      Roupa elegante para jantar
                    </Text>
                    <Text className="text-sm text-gray-600">
                      Conjunto esportivo confortável
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <View
              className="space-y-4"
              style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}
            >
              {Object.entries(categoryStates).map(([category, state]) => (
                <View
                  key={category}
                  style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
                >
                  {/* Category Header */}
                  <View
                    className="px-2"
                    style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
                  >
                    <Text className="text-xl font-bold text-gray-900">
                      {category}
                    </Text>
                    {state.description && (
                      <Text className="text-sm text-gray-600 leading-relaxed">
                        {state.description}
                      </Text>
                    )}
                  </View>

                  {/* Horizontal Scrollable Product List or Skeleton */}
                  <View className="overflow-x-auto scrollbar-hide">
                    <View className="flex flex-row gap-4 pb-4 px-2">
                      {state.isLoading ? (
                        // Show skeletons while loading
                        [1, 2, 3, 4].map((i) => <ProductSkeleton key={i} />)
                      ) : state.products.length > 0 ? (
                        // Show products when loaded
                        state.products.map((product) => (
                          <View
                            key={product.productId}
                            className="shrink-0 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer bg-white"
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              width: "160px",
                              minWidth: "160px",
                            }}
                            onClick={() => handleProductClick(product.productId)}
                          >
                            <View className="relative aspect-[3/4]">
                              <Image
                                src={product.imageUrl}
                                alt={product.productName}
                                className="w-full h-full object-cover"
                              />
                            </View>
                            <View
                              className="p-3"
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.25rem",
                              }}
                            >
                              <Text className="text-gray-900 font-semibold text-sm line-clamp-2">
                                {product.productName}
                              </Text>
                              <Text className="text-primary font-bold text-base">
                                {product.price.toLocaleString("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                })}
                              </Text>
                            </View>
                          </View>
                        ))
                      ) : (
                        // Show message when no products found
                        <Text className="text-gray-500 text-sm px-2">
                          Nenhum produto encontrado para esta categoria
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Fixed Bottom Search Bar */}
        <View
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200"
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            paddingBottom: "env(safe-area-inset-bottom)",
            backgroundColor: "white",
            boxShadow: "0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -1px rgba(0, 0, 0, 0.06)",
          }}
        >
          <View className="w-full max-w-6xl mx-auto px-4 pt-4 pb-6">
            {image && (
              <View
                className="mb-3 flex items-center gap-2 bg-primary/10 p-2 rounded-lg"
                style={{ display: "flex", alignItems: "center" }}
              >
                <View className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-primary shrink-0">
                  <Image
                    src={`data:${image.mimeType};base64,${image.data}`}
                    className="w-full h-full object-cover"
                  />
                </View>
                <Text className="text-sm text-gray-700 flex-1">
                  Imagem selecionada
                </Text>
                <Button
                  onClick={() => setImage(null)}
                  className="p-1.5 bg-transparent hover:bg-red-100 rounded-full transition-colors text-red-500"
                  style={{
                    minWidth: "auto",
                    border: "none",
                  }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </Button>
              </View>
            )}

            {/* Main Input Container */}
            <View
              className="w-full flex items-center gap-2 bg-gray-100 rounded-2xl px-3 py-3"
              style={{ display: "flex", alignItems: "center" }}
            >
              <Button
                onClick={handleImagePick}
                className={`bg-transparent hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  image ? "text-primary" : "text-gray-400"
                }`}
                disabled={isLoading}
                style={{
                  minWidth: "auto",
                  border: "none",
                }}
              >
                <HiCamera className="w-3 h-3 text-gray-400" />
              </Button>

              <TextInput
                className="w-full bg-transparent border-none focus:outline-none text-gray-700 placeholder-gray-500 text-base"
                style={{ outline: "none", border: "none", fontSize: "16px" }}
                value={value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setValue(e.target.value)
                }
                onKeyUp={handleKeyPress}
                placeholder={
                  image ? "Busca por imagem ativa" : "Busque produto ou ocasião"
                }
                disabled={isLoading}
              />

              <Button
                onClick={handleVoiceSearch}
                disabled={isLoading || isListening}
                className={`rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isListening
                    ? "bg-red-500 hover:bg-red-600 animate-pulse"
                    : "bg-transparent hover:bg-gray-200"
                }`}
                style={{
                  minWidth: "auto",
                  border: "none",
                }}
              >
                {isListening ? (
                  <HiStop className="w-3 h-3 text-white" />
                ) : (
                  <HiMicrophone className="w-3 h-3 text-gray-400" />
                )}
              </Button>

              <Button
                onClick={() => handleSearch(value)}
                className="bg-black text-white rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
                style={{ minWidth: "auto", border: "none" }}
              >
                <HiPaperAirplane className="w-3 h-3 rotate-90" />
              </Button>
            </View>

            {isListening && (
              <Text className="text-xs text-center text-gray-500 mt-2">
                Escutando...
              </Text>
            )}
          </View>
        </View>
      </View>
    </Page>
  );
}
