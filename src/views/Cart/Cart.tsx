import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  Page,
  Button,
  PullToAction,
  Loading,
} from "eitri-luminus";
import { useLocalShoppingCart } from "../../providers/LocalCart";
import HeaderComponent from "../../components/HeaderComponent";
import Eitri from "eitri-bifrost";
import { formatPrice } from "../../utils/price";

export default function Cart() {
  const { cart, removeItem, startCart } = useLocalShoppingCart();

  const handleRemoveFromCart = (index) => {
    removeItem(index);
  };

  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  return (
    <Page
      className="bg-gradient-to-br from-[#1a1a1a] via-[#292929] to-[#1a1a1a] min-h-screen"
      statusBarTextColor="white"
    >
      <PullToAction
        onRefresh={startCart}
        loading={
          <View className="flex-1 flex items-center justify-center">
            <Loading />
          </View>
        }
      >
        <View className="w-full max-w-6xl mx-auto flex flex-col h-full">
          <HeaderComponent />
          <View className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            <View className="flex items-center justify-between">
              <Text className="text-2xl md:text-3xl font-bold text-[#F0F0F0]">
                Meu Carrinho
              </Text>
              {cart && cart.items && cart.items.length > 0 && (
                <Text className="text-[#9DE82B] font-semibold">
                  {cart.items.length}{" "}
                  {cart.items.length === 1 ? "item" : "itens"}
                </Text>
              )}
            </View>

            {cart && cart.items && cart.items.length > 0 ? (
              <View className="flex flex-col lg:flex-row gap-6">
                {/* Lista de produtos */}
                <View className="flex-1">
                  <View className="bg-[#292929]/80 backdrop-blur-sm rounded-2xl shadow-lg border border-[#9DE82B]/20 overflow-hidden">
                    {cart.items.map((item, index) => (
                      <View
                        key={item.id}
                        className="p-4 border-b border-[#9DE82B]/10 last:border-b-0 hover:bg-[#292929]/50 transition-colors duration-200"
                      >
                        <View className="flex flex-col sm:flex-row gap-4">
                          {/* Imagem do produto */}
                          <View className="w-full sm:w-24 h-48 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden">
                            <Image
                              src={item.imageUrl?.replace(/55-55/g, "600-600")}
                              alt={item.name}
                              className="object-cover w-full h-full"
                            />
                          </View>

                          {/* Informações do produto */}
                          <View className="flex-1 flex flex-col">
                            <Text className="font-bold text-[#F0F0F0] mb-1">
                              {item.name}
                            </Text>

                            <View className="flex flex-wrap items-center gap-4 mt-2">
                              <View className="bg-[#1a1a1a]/50 rounded-lg px-3 py-1">
                                <Text className="text-[#9DE82B] font-semibold">
                                  {item.quantity}x
                                </Text>
                              </View>

                              <Text className="font-bold text-[#F0F0F0] ml-auto">
                                {formatPrice(item.price * item.quantity, 100)}
                              </Text>
                            </View>

                            <Button
                              onClick={() => handleRemoveFromCart(index)}
                              className="w-fit mt-3 btn-outline !text-red-500 transition-colors duration-200 px-3 py-1"
                            >
                              <View className="flex items-center">
                                <Text className="text-sm">Remover</Text>
                              </View>
                            </Button>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Resumo do pedido */}
                <View className="w-full lg:w-80 flex-shrink-0">
                  <View className="bg-[#292929]/80 backdrop-blur-sm rounded-2xl shadow-lg border border-[#9DE82B]/20 p-6 sticky top-6">
                    <Text className="text-xl font-bold mb-6 text-[#F0F0F0]">
                      Resumo do Pedido
                    </Text>

                    <View className="space-y-4 mb-6">
                      <View className="flex justify-between text-[#F0F0F0]/80">
                        <Text>Subtotal</Text>
                        <Text className="font-semibold">
                          {formatPrice(calculateTotal(), 100)}
                        </Text>
                      </View>

                      <View className="flex justify-between text-[#F0F0F0]/80">
                        <Text>Frete</Text>
                        <Text className="font-semibold text-[#9DE82B]">
                          Grátis
                        </Text>
                      </View>

                      <View className="flex justify-between text-[#F0F0F0]/80">
                        <Text>Descontos</Text>
                        <Text className="font-semibold">-</Text>
                      </View>

                      <View className="border-t border-[#9DE82B]/30 pt-4 mt-2">
                        <View className="flex justify-between font-bold text-xl text-[#F0F0F0]">
                          <Text>Total</Text>
                          <Text>{formatPrice(calculateTotal(), 100)}</Text>
                        </View>
                      </View>
                    </View>

                    <Button
                      onClick={() => {
                        Eitri.navigation.open({
                          slug: "eitri-poc-ai-checkout",
                          initParams: { orderFormId: cart.orderFormId },
                        });
                      }}
                      className="bg-gradient-to-r from-[#9DE82B] to-[#7BC41F] hover:from-[#9DE82B]/90 hover:to-[#7BC41F]/90 !text-[#292929] font-bold py-4 px-4 rounded-xl w-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] border border-[#9DE82B]/30"
                    >
                      Finalizar Compra
                    </Button>

                    <Button
                      onClick={() =>
                        Eitri.navigation.navigate({
                          path: "/",
                        })
                      }
                      className="mt-4 bg-[#1a1a1a]/50 hover:bg-[#1a1a1a]/70 !text-[#F0F0F0] font-semibold py-3 px-4 rounded-xl w-full transition-all duration-300 border border-[#9DE82B]/20"
                    >
                      Continuar Comprando
                    </Button>
                  </View>
                </View>
              </View>
            ) : (
              <View className="text-center py-16 bg-[#292929]/80 backdrop-blur-sm rounded-2xl shadow-lg border border-[#9DE82B]/20 flex flex-col items-center p-6">
                <Text className="text-2xl text-[#F0F0F0] font-bold mb-3">
                  Seu carrinho está vazio
                </Text>
                <Text className="text-[#F0F0F0]/70 mb-8 max-w-md">
                  Adicione produtos para vê-los aqui.
                </Text>
                <Button
                  onClick={() =>
                    Eitri.navigation.navigate({
                      path: "/",
                    })
                  }
                  className="bg-gradient-to-r from-[#9DE82B] to-[#7BC41F] hover:from-[#9DE82B]/90 hover:to-[#7BC41F]/90 !text-[#292929] font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] border border-[#9DE82B]/30"
                >
                  Voltar para a Home
                </Button>
              </View>
            )}
          </View>
        </View>
      </PullToAction>
    </Page>
  );
}
