import { useState } from "react";
import { Page, Text, View, Button, Image, Carousel, Loading, Alert } from "eitri-luminus";
import Eitri from "eitri-bifrost";
import { AgentRole, useAgent } from "eitri-agents";
import { ClothRecommendationType } from "../types/Recommendation";
import { OptimizeProductResponse, Product } from "../types/Product";

export default function ClothRecommendation() {
    const agent = useAgent("Fashion", {
        verbose: true,
    });

    const [error, setError] = useState<string | null>(null);
    const [image, setImage] = useState<{ data: string; mimeType: string } | null>(
        null
    );
    const [isFetching, setIsFetching] = useState(false);
    const [products, setProducts] = useState<Record<string, OptimizeProductResponse[]>>({});
    const [recommendation, setRecommendation] =
        useState<ClothRecommendationType | null>(null);

    const handleImagePick = async () => {
        try {
            const files = await Eitri.fs.openFilePicker({
                fileExtension: ["jpg", "jpeg", "png"],
            });

            if (files && files.length > 0) {
                setImage({
                    data: await files[0].toBase64(),
                    mimeType: files[0].mimeType,
                });
            }
        } catch (error) {
            setError("Falha ao pegar imagem");
            console.error("Image pick failed:", error);
        }
    };

    const handleSubmit = async () => {
        try {
            if (!image) {
                alert("Please select an image.");
                return;
            }

            setIsFetching(true);
            setRecommendation(null);
            setProducts({});

            const response = await agent.call({
                content:
                    "Forneça uma recomendação de estilo. Foque somente nas roupas e acessórios.",
                role: AgentRole.User,
                file: {
                    mimeType: image.mimeType,
                    data: `${image.data}`,
                },
            });

            const jsonData = agent.helper.json.extract<Record<string, OptimizeProductResponse[]>>(
                response.message
            );


            if (!jsonData) {
                console.warn(jsonData)
                console.error("Error parsing JSON data")
                setError("Erro ao processar dados")
                return
            }

            if (Object.keys(jsonData).length === 0) {
                console.warn(jsonData)
                setError("Houve um erro inesperado, tente novamente por favor.")
                return
            }

            setProducts(jsonData)

            setIsFetching(false);
        } catch (error) {
            setIsFetching(false);
            console.error("Error fetching products:", error);
            setError("Erro ao buscar produtos")
        }
    };

    const handleRetry = () => {
        setError(null);
        setIsFetching(false);
        setImage(null);
        setRecommendation(null);
    };

    if (error) {
        return (
            <Page className="w-full min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#292929] to-[#1a1a1a] flex flex-col py-8 pt-10">
                <View className="w-full max-w-6xl mx-auto flex flex-col h-full px-4 sm:px-6 lg:px-8">
                    <View className="text-center flex flex-col mb-8">
                        <Text className="text-white text-3xl font-bold mb-2 mt-4">Houve um erro!</Text>
                        <Alert className="bg-red-500 flex flex-col items-center">
                            <Text className="text-white text-xl font-bold">
                                {error} 😔
                            </Text>
                        </Alert>
                        <Button
                            onClick={handleRetry}
                            className="mt-8"
                        >
                            Tentar novamente
                        </Button>
                    </View>
                </View>
            </Page>
        );
    }

    return (
        <Page
            className="w-full min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#292929] to-[#1a1a1a] flex flex-col py-8 pt-10"
            statusBarTextColor="white"
        >
            <View className="w-full max-w-6xl mx-auto flex flex-col h-full px-4 sm:px-6 lg:px-8">
                <View className="text-center flex flex-col mb-8">
                    <Text className="text-white text-3xl font-bold mb-2 mt-4">
                        Style Recommendation
                    </Text>
                    <Text className="text-gray-300">
                        Upload an image to get personalized fashion recommendations
                    </Text>
                </View>

                <View className="flex flex-col items-center mb-8">
                    <Button
                        onClick={handleImagePick}
                        className="bg-[#9DE82B] hover:bg-[#8bc725] text-[#1a1a1a] font-semibold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
                    >
                        {image ? "Change Image" : "Select Image"}
                    </Button>

                    {image && (
                        <View className="mt-6 w-full max-w-md">
                            <View className="relative rounded-xl overflow-hidden border-2 border-[#9DE82B] shadow-lg">
                                <Image
                                    src={`data:${image.mimeType};base64,${image.data}`}
                                    className="w-full h-64 object-cover"
                                />
                                <View className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] to-transparent opacity-70"></View>
                            </View>
                        </View>
                    )}
                </View>

                {image && (
                    <View className="flex justify-center mb-8">
                        <Button
                            onClick={handleSubmit}
                            disabled={isFetching}
                            className="bg-white hover:bg-gray-100 text-[#1a1a1a] font-bold py-3 px-8 rounded-full text-lg transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50"
                        >
                            Get Recommendation
                        </Button>
                    </View>
                )}



                {isFetching && (
                    <View className="flex flex-col items-center justify-center my-12">
                        <Loading className="loading-spinner loading-md text-[#9DE82B] mb-4" />
                        <Text className="text-2xl font-bold text-[#F0F0F0] text-center">
                            {recommendation
                                ? "Finding products..."
                                : "Generating recommendation..."}
                        </Text>
                        <Text className="text-gray-400 mt-2">
                            This may take a few seconds
                        </Text>
                    </View>
                )}

                {recommendation && !isFetching && (
                    <View className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700 shadow-xl">
                        <View className="flex items-center mb-3">
                            <Text className="text-white text-xl font-bold">
                                {recommendation.baseStyle}
                            </Text>
                        </View>
                        <Text className="text-gray-200">{recommendation.description}</Text>
                    </View>
                )}

                {Object.entries(products)
                    .filter(([, productList]) => productList.length > 0)
                    .map(([category, productList]) => (
                        <View key={category} className="mb-12">
                            <Text className="text-white text-2xl font-bold mb-6 pb-2 border-b border-gray-700">
                                {category}
                            </Text>
                            <Carousel
                                config={{
                                    autoPlay: false,
                                }}
                                className="w-full mt-4"
                            >
                                {productList.map((product) => {


                                    return (
                                        <Carousel.Item
                                            className="carousel-item w-1/2"
                                            key={product.productId}
                                        >
                                            <View className="flex flex-col h-full bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-gray-700 hover:border-[#9DE82B] transition duration-300 ease-in-out transform hover:-translate-y-1 mx-1">
                                                <View className="relative h-32 pt-[100%]">
                                                    <Image
                                                        src={product.imageUrl}
                                                        className="absolute inset-0 w-full h-full object-cover"
                                                    />
                                                </View>

                                                <View className="p-3 flex flex-col flex-grow">
                                                    <Text className="text-white font-medium text-center mb-1 line-clamp-2 text-sm">
                                                        {product.productName}
                                                    </Text>
                                                    <Text className="text-[#9DE82B] font-bold text-center mt-auto">
                                                        {product.price.toLocaleString("pt-BR", {
                                                            style: "currency",
                                                            currency: "BRL",
                                                        })}
                                                    </Text>

                                                </View>
                                            </View>
                                        </Carousel.Item>
                                    );
                                })}
                            </Carousel>
                        </View>
                    ))}
            </View>
        </Page>
    );
}
