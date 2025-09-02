import { useAgent } from "eitri-agents";
import { Button, Markdown, Page, Text, View } from "eitri-luminus";
import Eitri from "eitri-bifrost";
import { useState } from "react";
import { AgentRole } from "models/Message";

export default function Document() {
    const [file, setFile] = useState<{ data: string; mimeType: string } | null>(null);
    const [message, setMessage] = useState("");
    const [isFetching, setIsFetching] = useState(false);

    const handleFilePick = async () => {
        try {
            const files = await Eitri.fs.openFilePicker({
                fileExtension: ["pdf"],
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

    const agent = useAgent("Buffet", {
        verbose: false,
    });

    const handleSubmit = async () => {
        if (!file) {
            alert("Por favor, selecione um documento primeiro.");
            return;
        }

        setIsFetching(true);
        try {
            const response = await agent.call({
                content: "Forneça um resumo do documento.",
                file,
            });

            setMessage(response.message);
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
                <Text className="text-white text-3xl font-bold mb-2">Resumo de Documentos</Text>
                <Text className="text-gray-300 text-lg mb-8">Carregue um PDF para obter um resumo inteligente</Text>

                <View className="flex flex-col items-center w-full mb-8">
                    <View className="w-full max-w-md flex flex-col items-center">
                        <Button
                            onClick={handleFilePick}
                            className="my-4 w-full py-3 bg-[#9DE82B] hover:bg-[#8bcf27] text-black font-semibold rounded-lg transition-colors"
                        >
                            {file ? "Selecionar Outro Documento" : "Selecionar Documento"}
                        </Button>

                        {file && (
                            <View className="flex flex-col items-center justify-center p-4 bg-gray-800 rounded-lg w-full my-2">
                                <Text className="text-center text-sm text-white mb-2">
                                    Documento selecionado com sucesso
                                </Text>
                                <Text className="text-center text-xs text-gray-400">
                                    Clique em "Obter Resumo" para processar o documento
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
                            {isFetching ? "Processando..." : "Obter Resumo"}
                        </Button>
                    </View>
                </View>

                {isFetching && (
                    <View className="flex flex-col items-center justify-center my-8">
                        <Text className="text-2xl font-bold text-[#F0F0F0]">
                            Analisando documento...
                        </Text>
                        <Text className="text-gray-400 mt-2">
                            Isso pode levar alguns segundos
                        </Text>
                    </View>
                )}

                {message && !isFetching && (
                    <View className="flex flex-col flex-1">
                        <Text className="text-white text-2xl font-semibold mb-4">Resumo</Text>
                        <View className="flex-1 overflow-y-auto bg-gray-200 rounded-xl p-6">
                            <Markdown className="text-black prose prose-invert max-w-none" content={message} />
                        </View>
                    </View>
                )}

                {!message && !isFetching && !file && (
                    <View className="flex flex-col items-center justify-center flex-1 py-12">
                        <Text className="text-gray-400 text-lg text-center mb-4">
                            Selecione um documento PDF para começar
                        </Text>
                        <Text className="text-gray-500 text-sm text-center">
                            Nossos agentes de IA irão analisar o conteúdo e fornecer um resumo detalhado
                        </Text>
                    </View>
                )}
            </View>
        </Page>
    );
}
