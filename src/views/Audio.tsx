import { useAgent } from "eitri-agents";
import { Button, Carousel, Page, Text, View, Image } from "eitri-luminus";
import Eitri from "eitri-bifrost";
import { useState } from "react";
import { AgentRole } from "models/Message";

export default function Audio() {
    const [file, setFile] = useState<{ data: string; mimeType: string } | null>(null);
    const [message, setMessage] = useState("");
    const [products, setProducts] = useState<any[]>([]);
    const [isFetching, setIsFetching] = useState(false);

    const handleFilePick = async () => {
        try {
            const files = await Eitri.fs.openFilePicker({
                fileExtension: ["mp3", "m4a", "wav", "MP3", "M4A", "WAV"],
                maxSize: 1024 * 1024 * 10,

            });

            if (files && files.length > 0) {
                setFile({
                    data: await files[0].toBase64(),
                    mimeType: files[0].mimeType,
                });
            }
        } catch (error) {
            console.error("Failed to pick document:", error);
        }
    };

    const agent = useAgent("SellerAgentAudio", {
        verbose: true,
    });

    const handleSubmit = async () => {
        if (!file) {
            alert("Por favor, selecione um documento primeiro.");
            return;
        }

        setIsFetching(true);
        try {
            const response = await agent.call({
                content: "Responda baseado no conteúdo do áudio.",
                file,
            });

            console.log(response);

            const products = agent.helper.json.extract<any[]>(response.message);

            console.log(products);

            if (products) setProducts(products);

        } catch (error) {
            console.error("Failed to get document summary:", error);
            setMessage("Ocorreu um erro ao gerar o resumo. Por favor, tente novamente.");
        } finally {
            setIsFetching(false);
        }
    };

    return (
        <Page className="w-full min-h-screen bg-gradient-to-br from-[#292929] via-[#1a1a1a] to-[#292929] flex flex-col" statusBarTextColor="white">
            <View className="w-full max-w-4xl mx-auto flex flex-col flex-1 p-4 md:p-6 min-h-screen pt-8 md:pt-6" style={{
                paddingTop: 'max(env(safe-area-inset-top, 0px), 2rem)',
                paddingBottom: 'env(safe-area-inset-bottom, 0px)'
            }}>
                <Text className="text-white text-3xl font-bold mb-2">Seller Agent por Áudio</Text>
                <Text className="text-gray-300 text-lg mb-8">Responda baseado no conteúdo do áudio</Text>

                <View className="flex flex-col items-center w-full mb-8">
                    <View className="w-full max-w-md flex flex-col items-center">
                        <Button
                            onClick={handleFilePick}
                            className="my-4 w-full py-3 bg-[#9DE82B] hover:bg-[#8bcf27] text-black font-semibold rounded-lg transition-colors"
                        >
                            {file ? "Selecionar Outro Áudio" : "Selecionar Áudio"}
                        </Button>

                        {file && (
                            <View className="flex flex-col items-center justify-center p-4 bg-gray-800 rounded-lg w-full my-2">
                                <Text className="text-center text-sm text-white mb-2">
                                    Áudio selecionado com sucesso
                                </Text>
                                <Text className="text-center text-xs text-gray-400">
                                    Clique em "Responder" para processar o áudio
                                </Text>
                            </View>
                        )}

                        <Button
                            onClick={handleSubmit}
                            disabled={isFetching || !file}
                            className={`my-4 w-full py-3 font-semibold rounded-lg transition-colors ${isFetching || !file
                                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 text-white"
                                }`}
                        >
                            {isFetching ? "Processando..." : "Responder"}
                        </Button>
                    </View>
                </View>

                {isFetching && (
                    <View className="flex flex-col items-center justify-center my-8">
                        <Text className="text-2xl font-bold text-[#F0F0F0]">
                            Analisando Áudio...
                        </Text>
                        <Text className="text-gray-400 mt-2">
                            Isso pode levar alguns segundos
                        </Text>
                    </View>
                )}

                {products && !isFetching && (
                    <Carousel
                        config={{
                            autoPlay: false,
                        }}
                        className="w-full"
                    >
                        {products.map((product) => {
                            return (
                                <Carousel.Item
                                    className="carousel-item w-1/2"
                                    key={product.name}
                                >
                                    <View className="flex flex-col h-full bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-gray-700 hover:border-[#9DE82B] transition duration-300 ease-in-out transform hover:-translate-y-1 mx-1">
                                        <View className="relative h-32 pt-[100%]">
                                            <Image
                                                src={product.image}
                                                className="absolute inset-0 w-full h-full object-cover"
                                            />
                                        </View>

                                        <View className="p-3 flex flex-col flex-grow">
                                            <Text className="text-white font-medium text-center mb-1 line-clamp-2 text-sm">
                                                {product.name}
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
                )}

                {!message && !isFetching && !file && (
                    <View className="flex flex-col items-center justify-center flex-1 py-12">
                        <Text className="text-gray-400 text-lg text-center mb-4">
                            Selecione um áudio para começar
                        </Text>
                        <Text className="text-gray-500 text-sm text-center">
                            Nossos agentes de IA irão analisar o conteúdo e fornecer uma resposta detalhada
                        </Text>
                    </View>
                )}
            </View>
        </Page>
    );
}
