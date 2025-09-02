import {
  Text,
  View,
  Button,
  Page,
  Chat,
  TextInput,
  Markdown,
} from "eitri-luminus";
import { useState, useEffect } from "react";
import Robot from "../assets/images/robot.png";
import { IoSend } from "react-icons/io5";
import HeaderComponent from "../components/HeaderComponent";

import { AgentRole, useAgent } from "eitri-agents";

export default function ChatPage(props) {
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);

  const agent = useAgent("SellerAgent", {
    verbose: true,
  });

  const scrollToBottom = () => {
    const chatContainer = document.getElementById("chat-container");
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, isLoading]);

  const askAgent = async (message: string) => {
    if (!message.trim()) {
      return;
    }

    const messagesToSend = {
      role: AgentRole.User,
      content: message,
    };

    setMessages(prevState => [...prevState, messagesToSend]);

    setTimeout(scrollToBottom, 100);
    setValue("");
    setIsLoading(true);

    try {
      const response = await agent.call(messagesToSend);

      let newMessage = response.message;

      setMessages(prevState => [...prevState, { role: "assistant", content: newMessage }]);

      setTimeout(scrollToBottom, 200);
    } catch (error) {
      console.error("Error asking Agent:", error);
      setTimeout(scrollToBottom, 200);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      askAgent(value);
    }
  };

  return (
    <Page
      className="w-full h-screen bg-gradient-to-br from-[#292929] via-[#1a1a1a] to-[#292929] flex flex-col pt-8"
      statusBarTextColor="white"
    >
      <View className="w-full max-w-6xl mx-auto flex flex-col h-full">
        <HeaderComponent />

        {/* Chat Area */}
        <View
          id="chat-container"
          className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-transparent to-[#292929]/20"
        >
          {messages.length === 0 && (
            <View className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <View className="flex items-center space-x-2">
                <Text className="text-2xl font-bold text-[#F0F0F0]">
                  Olá! Eu sou o Assistente de vendas
                </Text>
              </View>
              <Text className="text-[#F0F0F0]/70 max-w-md flex items-center justify-center space-x-2">
                <Text>
                  Seu assistente de vendas inteligente. Como posso ajudá-lo
                  hoje?
                </Text>
              </Text>
            </View>
          )}

          <Chat>
            {messages.map((message, index) => (
              <View key={`message-${index}`} className="mb-6">
                {message.role === "user" ? (
                  <Chat.End>
                    <Chat.Bubble className="bg-gradient-to-r from-[#9DE82B] to-[#7BC41F] text-[#292929] shadow-xl max-w-lg border border-[#9DE82B]/40 backdrop-blur-sm">
                      <Text className="text-[#292929] font-medium">
                        {message.content}
                      </Text>
                    </Chat.Bubble>
                  </Chat.End>
                ) : (
                  <Chat.Start>
                    <View className="relative mr-3">
                      <Chat.Image
                        src={Robot}
                        alt="Eitri's Avatar"
                        className="w-12 h-12 rounded-full border-2 border-[#9DE82B] shadow-lg bg-gradient-to-r from-[#9DE82B] to-[#7BC41F] p-1"
                      />
                      <View className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#9DE82B] rounded-full border-2 border-[#292929]"></View>
                    </View>

                    <Chat.Bubble className="bg-gradient-to-r from-[#292929]/90 to-[#1a1a1a]/90 text-[#F0F0F0] shadow-xl max-w-lg border border-[#9DE82B]/20 backdrop-blur-sm">
                      <Markdown
                        content={message?.content ?? ""}
                        className="text-[#F0F0F0] leading-relaxed"
                      />
                    </Chat.Bubble>
                  </Chat.Start>
                )}
              </View>
            ))}

            {isLoading && (
              <Chat.Start>
                <View className="relative mr-3">
                  <Chat.Image
                    src={Robot}
                    alt="Odin's Avatar"
                    className="w-12 h-12 rounded-full border-2 border-[#9DE82B] shadow-lg bg-gradient-to-r from-[#9DE82B] to-[#7BC41F] p-1"
                  />
                  <View className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#9DE82B] rounded-full border-2 border-[#292929] animate-pulse"></View>
                </View>

                <Chat.Bubble className="bg-gradient-to-r from-[#292929]/90 to-[#1a1a1a]/90 text-[#F0F0F0] shadow-xl max-w-lg border border-[#9DE82B]/20 backdrop-blur-sm">
                  <View className="flex items-center space-x-3 py-2">
                    <Text className="text-[#F0F0F0]/90 text-sm font-medium">
                      Pensando...
                    </Text>
                    <View className="flex space-x-1">
                      <View className="w-2 h-2 bg-[#9DE82B] rounded-full animate-bounce"></View>
                      <View
                        className="w-2 h-2 bg-[#9DE82B] rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></View>
                      <View
                        className="w-2 h-2 bg-[#9DE82B] rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></View>
                    </View>
                  </View>
                </Chat.Bubble>
              </Chat.Start>
            )}
          </Chat>
        </View>

        {/* Input Area moderna */}
        <View className="p-6 bg-gradient-to-r from-[#292929]/80 to-[#1a1a1a]/80 backdrop-blur-sm border-t border-[#9DE82B]/20">
          <View className="flex items-center space-x-4 max-w-4xl mx-auto">
            <View className="flex-1 relative">
              <TextInput
                className="w-full px-6 py-4 !bg-[#292929]/50 border border-[#9DE82B]/30 rounded-2xl text-[#F0F0F0] placeholder-[#F0F0F0]/50 focus:border-[#9DE82B] focus:ring-2 focus:ring-[#9DE82B]/20 backdrop-blur-sm transition-all duration-200 pr-12"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyUp={handleKeyPress}
                placeholder="Digite sua mensagem para o Assistente de vendas..."
                disabled={isLoading}
              />
            </View>
            <Button
              onClick={() => askAgent(value)}
              className={`px-8 py-4 rounded-2xl font-semibold transition-all duration-200 w-12 ${!value.trim() || isLoading
                ? "bg-[#292929]/50 text-[#F0F0F0]/50 cursor-not-allowed"
                : "bg-gradient-to-r from-[#9DE82B] to-[#7BC41F] text-[#292929] shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                }`}
              disabled={!value.trim() || isLoading}
            >
              {isLoading ? (
                <View className="flex items-center space-x-2">
                  <View className="w-4 h-4 border-2 border-[#292929]/30 border-t-[#292929] rounded-full animate-spin"></View>
                  <Text>Enviando</Text>
                </View>
              ) : (
                <View className="flex items-center">
                  <IoSend className="text-lg !text-[#292929]" />
                </View>
              )}
            </Button>
          </View>
        </View>
      </View>
    </Page>
  );
}
