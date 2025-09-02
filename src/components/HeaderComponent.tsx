import Eitri from "eitri-bifrost";
import { View, Text, Image } from "eitri-luminus";
import { useLocalShoppingCart, } from "../providers/LocalCart";
import ShoppingCart from '../assets/icons/shopping-cart.svg'

export default function HeaderComponent(props) {
  const { cart } = useLocalShoppingCart(); // Assuming useCart returns a cart object
  const cartItemsCount = cart?.items?.length || 0; // Assuming cart object has an items array

  return (
    <View className="relative bg-gradient-to-r from-[#292929]/70 to-[#1a1a1a]/70 backdrop-blur-sm border-b border-[#9DE82B]/30 p-6">
      <View className="flex items-center justify-between space-x-3">
        <View className="text-start">
          <View className="flex items-center space-x-2">
            <Text className="text-2xl font-bold bg-gradient-to-r from-white to-green-300 bg-clip-text text-transparent">
              Assistente de vendas
            </Text>
          </View>
          <Text className="text-sm text-white/70 flex items-center space-x-1">
            <Text>Assistente Inteligente</Text>
          </Text>
        </View>
        <View className="flex flex-col">
          <View
            onClick={async () => {
              await Eitri.navigation.navigate({
                path: "/Cart/Cart",
              });
            }}
          >
            <View className="indicator">
              <Image src={ShoppingCart} alt="Shopping Cart Icon" className="w-8 h-8 mt-1" />
              <Text className="indicator-item badge badge-secondary text-sm ml-4">
                {cartItemsCount}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
