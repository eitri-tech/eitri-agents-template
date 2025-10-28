import { useState, useRef } from 'react';
import { BiShow, BiHide } from 'react-icons/bi';
import { HiMicrophone, HiStop } from 'react-icons/hi';
import { IoClose, IoVolumeHigh } from 'react-icons/io5';
import { RiRobot2Fill } from 'react-icons/ri';

import Eitri from 'eitri-bifrost';
import { Page, View, Text, Button, Loading } from 'eitri-luminus';
import { useAgent } from 'eitri-agents';

type Message = {
    role: 'user' | 'assistant';
    text: string;
    audioUrl?: string;
};

export default function Speech() {
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isListening, setIsListening] = useState<boolean>(false);
    const [aiMessage, setAiMessage] = useState<string | null>(null);
    const [showTranscript, setShowTranscript] = useState<boolean>(false);
    const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
    const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const agent = useAgent('Buffet', {
        verbose: true,
        llm: 'openai',
        model: 'gpt-5',
        // llm: 'gemini',
    });

    const playAudio = (url: string) => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }

        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onplay = () => setIsPlayingAudio(true);
        audio.onended = () => setIsPlayingAudio(false);
        audio.onerror = () => {
            setIsPlayingAudio(false);
            setError('Erro ao reproduzir áudio');
        };

        audio.play().catch((err) => {
            console.error('Erro ao reproduzir áudio:', err);
            setIsPlayingAudio(false);
            setError('Erro ao reproduzir áudio');
        });
    };

    const handleAudioPicker = async () => {
        try {
            console.log('Iniciando gravação de áudio');

            setIsListening(true);
            setAiMessage(null);
            setAudioUrl(null);
            const result = await Eitri.exposedApis.speech.recognizeOnce({ language: 'pt-BR' });
            setIsListening(false);
            console.log(result);

            if (!result) {
                console.warn('Nenhuma mensagem recebida');
                return;
            }

            setConversationHistory((prev) => [...prev, { role: 'user', text: result }]);
            await handleSubmit(result);
        } catch (error) {
            console.error('Erro ao iniciar gravação de áudio:', error);
            setIsListening(false);
        }
    };

    const handleSubmit = async (message: string) => {
        setIsLoading(true);
        setError(null);
        setAudioUrl(null);

        try {
            console.log('Enviando mensagem para o agente:', message);

            const response = await agent.speech({
                content: message,
            });

            setAiMessage(response.message);
            setAudioUrl(response.audioUrl);

            setConversationHistory((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    text: response.message,
                    audioUrl: response.audioUrl,
                },
            ]);

            // Auto-play the response
            if (response.audioUrl) {
                playAudio(response.audioUrl);
            }
        } catch (err) {
            console.error('Error generating speech:', err);
            setError('Falha ao gerar áudio. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Page viewportColor="bg-black">
            <View className="h-screen flex flex-col relative overflow-hidden bg-gradient-to-b from-black via-gray-900 to-black">
                {/* Animated background gradient orbs - OpenAI style */}
                <View className="absolute inset-0 overflow-hidden pointer-events-none">
                    <View className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl animate-pulse" />
                    <View
                        className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl animate-pulse"
                        style={{ animationDelay: '1s' }}
                    />
                    <View
                        className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-blue-500/5 rounded-full blur-3xl animate-pulse"
                        style={{ animationDelay: '2s' }}
                    />
                </View>

                {/* Error Toast */}
                {error && (
                    <View className="absolute top-8 left-4 right-4 mx-auto max-w-md p-4 bg-red-500/90 backdrop-blur-xl rounded-2xl border border-red-400 shadow-2xl z-50 animate-in slide-in-from-top duration-300">
                        <View className="flex flex-row justify-between items-center">
                            <Text className="text-sm text-white font-medium flex-1">{error}</Text>
                            <Button
                                className="btn btn-circle btn-xs btn-ghost text-white hover:bg-red-600"
                                onClick={() => setError(null)}
                            >
                                <IoClose className="w-4 h-4" />
                            </Button>
                        </View>
                    </View>
                )}

                {/* Main Content */}
                <View className="relative z-10 flex flex-col items-center justify-center flex-1 px-4">
                    {/* Central Orb - OpenAI Advanced Voice Style */}
                    <View className="relative flex items-center justify-center mb-8">
                        {/* Outer animated rings - only when listening or playing */}
                        {(isListening || isPlayingAudio) && (
                            <>
                                <View
                                    className="absolute w-[400px] h-[400px] rounded-full border border-primary/20 animate-ping"
                                    style={{ animationDuration: '2s' }}
                                />
                                <View
                                    className="absolute w-[350px] h-[350px] rounded-full border border-primary/30 animate-pulse"
                                    style={{ animationDuration: '3s' }}
                                />
                                <View
                                    className="absolute w-[300px] h-[300px] rounded-full border border-primary/40 animate-pulse"
                                    style={{ animationDuration: '2.5s' }}
                                />
                            </>
                        )}

                        {/* Main Orb Container */}
                        <View
                            className={`relative w-56 h-56 rounded-full flex items-center justify-center transition-all duration-700 ${isListening
                                ? 'bg-gradient-to-br from-primary via-primary/90 to-primary/70 shadow-[0_0_100px_rgba(139,92,246,0.8)] scale-110'
                                : isLoading || isPlayingAudio
                                    ? 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-[0_0_100px_rgba(168,85,247,0.6)] scale-105 animate-pulse'
                                    : 'bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 shadow-[0_0_60px_rgba(107,114,128,0.4)]'
                                }`}
                        >
                            {/* Rotating gradient overlay */}
                            <View
                                className={`absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent ${isLoading || isPlayingAudio ? 'animate-spin' : ''
                                    }`}
                                style={{ animationDuration: '3s' }}
                            />

                            {/* Inner glow */}
                            <View
                                className={`absolute inset-4 rounded-full transition-all duration-500 ${isListening
                                    ? 'bg-white/30 animate-pulse'
                                    : isLoading || isPlayingAudio
                                        ? 'bg-white/20 animate-pulse'
                                        : 'bg-white/5'
                                    }`}
                            />

                            {/* Icon */}
                            {isLoading ? (
                                <Loading className="loading-spinner loading-lg text-white relative z-10 w-28 h-28" />
                            ) : (
                                <RiRobot2Fill
                                    className={`relative z-10 text-white drop-shadow-2xl transition-all duration-500 ${isListening || isPlayingAudio ? 'w-28 h-28' : 'w-24 h-24'
                                        }`}
                                />
                            )}
                        </View>
                    </View>

                    {/* Status Text */}
                    <View className="text-center min-h-[80px] flex flex-col items-center justify-center gap-3 max-w-md">
                        {isListening ? (
                            <>
                                <Text className="text-3xl font-light text-white animate-pulse drop-shadow-lg">
                                    Escutando...
                                </Text>
                                <Text className="text-sm text-gray-400">Fale sua mensagem</Text>
                            </>
                        ) : isLoading ? (
                            <>
                                <Text className="text-3xl font-light text-white animate-pulse drop-shadow-lg">
                                    Processando...
                                </Text>
                                <Text className="text-sm text-gray-400">Aguarde um momento</Text>
                            </>
                        ) : isPlayingAudio ? (
                            <>
                                <Text className="text-3xl font-light text-white animate-pulse drop-shadow-lg">
                                    Reproduzindo...
                                </Text>
                                <Text className="text-sm text-gray-400">Ouvindo resposta</Text>
                            </>
                        ) : aiMessage ? (
                            <>
                                <Text className="text-2xl font-light text-gray-100 drop-shadow-lg text-center px-4">
                                    {aiMessage.length > 100
                                        ? `${aiMessage.substring(0, 100)}...`
                                        : aiMessage}
                                </Text>
                                <Text className="text-sm text-gray-400">
                                    Toque para continuar a conversa
                                </Text>
                            </>
                        ) : (
                            <>
                                <Text className="text-2xl font-light text-gray-300 drop-shadow-lg">
                                    Olá! Como posso ajudar?
                                </Text>
                                <Text className="text-sm text-gray-500">
                                    Toque no microfone para começar
                                </Text>
                            </>
                        )}
                    </View>

                    {/* Replay Audio Button - OpenAI style */}
                    {audioUrl && !isListening && !isLoading && (
                        <View className="flex flex-col mt-8">
                            <Button
                                className={`btn btn-circle w-16 h-16 border-2 transition-all duration-300 ${isPlayingAudio
                                    ? 'bg-primary/20 border-primary hover:bg-primary/30 animate-pulse'
                                    : 'bg-gray-800/50 border-gray-600 hover:bg-gray-700/50 hover:border-gray-500'
                                    }`}
                                onClick={() => playAudio(audioUrl)}
                                disabled={isPlayingAudio}
                            >
                                <IoVolumeHigh className="w-7 h-7 text-white drop-shadow-lg" />
                            </Button>
                            <Text className="text-xs text-gray-400 text-center mt-2">
                                {isPlayingAudio ? 'Reproduzindo...' : 'Repetir áudio'}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Bottom Controls */}
                <View className="relative z-10 pb-safe-or-8 flex flex-col items-center gap-4 px-4">
                    {/* Transcript Toggle and History */}
                    {conversationHistory.length > 0 && (
                        <View className="flex flex-row gap-3">
                            <Button
                                className="btn btn-ghost btn-sm text-gray-400 hover:text-white hover:bg-white/10 rounded-full px-5 transition-all duration-200 border border-gray-700 hover:border-gray-500 gap-2"
                                onClick={() => setShowTranscript(!showTranscript)}
                            >
                                {showTranscript ? (
                                    <>
                                        <BiHide className="w-4 h-4" />
                                        <Text>Ocultar</Text>
                                    </>
                                ) : (
                                    <>
                                        <BiShow className="w-4 h-4" />
                                        <Text>Histórico ({conversationHistory.length})</Text>
                                    </>
                                )}
                            </Button>
                        </View>
                    )}

                    {/* Main Mic Button - OpenAI style */}
                    <Button
                        className={`btn-circle shadow-2xl transition-all duration-300 border-0 ${isListening
                            ? 'w-28 h-28 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-[0_0_40px_rgba(239,68,68,0.6)] scale-95'
                            : 'w-20 h-20 bg-gradient-to-br from-primary to-purple-600 hover:from-primary hover:to-purple-700 hover:scale-110 shadow-[0_0_30px_rgba(139,92,246,0.5)]'
                            }`}
                        onClick={handleAudioPicker}
                        disabled={isLoading}
                    >
                        {isListening ? (
                            <HiStop className="w-14 h-14 text-white drop-shadow-lg" />
                        ) : (
                            <HiMicrophone className="w-10 h-10 text-white drop-shadow-lg" />
                        )}
                    </Button>

                    <Text className="text-xs text-gray-500 text-center pb-2">
                        {isListening ? 'Toque para parar' : 'Toque para falar'}
                    </Text>
                </View>

                {/* Conversation History Panel - Slide from bottom */}
                {showTranscript && conversationHistory.length > 0 && (
                    <View className="absolute inset-x-0 bottom-0 z-50 bg-gray-950/98 backdrop-blur-2xl border-t border-gray-800 animate-in slide-in-from-bottom duration-300 max-h-[70vh] overflow-hidden flex flex-col">
                        {/* Header */}
                        <View className="flex flex-row justify-between items-center p-5 border-b border-gray-800 bg-gray-900/50">
                            <View className="flex flex-col">
                                <Text className="text-lg font-semibold text-white">
                                    Histórico da Conversa
                                </Text>
                                <Text className="text-xs text-gray-400 mt-1">
                                    {conversationHistory.length} mensagens
                                </Text>
                            </View>
                            <Button
                                className="btn btn-circle btn-sm bg-gray-800 hover:bg-gray-700 border-0 text-gray-300 hover:text-white"
                                onClick={() => setShowTranscript(false)}
                            >
                                <IoClose className="w-5 h-5" />
                            </Button>
                        </View>

                        {/* Messages List */}
                        <View className="overflow-y-auto flex-1 p-5 space-y-4">
                            {conversationHistory.map((msg, index) => (
                                <View
                                    key={index}
                                    className={`rounded-2xl p-5 border transition-all duration-200 ${msg.role === 'user'
                                        ? 'bg-gray-800/60 border-gray-700 hover:border-gray-600 hover:bg-gray-800/80'
                                        : 'bg-gradient-to-br from-primary/15 to-purple-500/10 border-primary/30 hover:border-primary/40'
                                        }`}
                                >
                                    <View className="flex flex-row justify-between items-start mb-2">
                                        <Text
                                            className={`text-xs font-bold uppercase tracking-wider ${msg.role === 'user'
                                                ? 'text-blue-400'
                                                : 'text-primary'
                                                }`}
                                        >
                                            {msg.role === 'user' ? 'Você' : 'Assistente'}
                                        </Text>
                                        {msg.audioUrl && msg.role === 'assistant' && (
                                            <Button
                                                className="btn btn-circle btn-xs bg-gray-700 hover:bg-gray-600 border-0"
                                                onClick={() => playAudio(msg.audioUrl!)}
                                            >
                                                <IoVolumeHigh className="w-3 h-3 text-white" />
                                            </Button>
                                        )}
                                    </View>
                                    <Text className="text-gray-100 text-sm leading-relaxed">
                                        {msg.text}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </View>
        </Page>
    );
}
