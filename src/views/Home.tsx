import {
  Text,
  View,
  Button,
  Page,
  Chat,
  TextInput,
  Markdown,
} from "eitri-luminus";
import Eitri from "eitri-bifrost";

export default function Home(props) {
  return (
    <Page
      className="w-full h-screen bg-gradient-to-br from-[#292929] via-[#1a1a1a] to-[#292929] flex flex-col pt-8"
      statusBarTextColor="white"
    >
      <View className="w-full max-w-6xl mx-auto flex flex-col h-full items-center justify-center p-4">
        <Button
          className="w-full"
          onClick={async () =>
            await Eitri.navigation.navigate({
              path: "/Chat",
            })
          }
        >
          Navegar para Chat
        </Button>
        <Button
          className="mt-4 w-full"
          onClick={async () =>
            await Eitri.navigation.navigate({
              path: "/ClothRecommendation",
            })
          }
        >
          Navegar para ClothRecommendation
        </Button>
        <Button
          className="mt-4 w-full"
          onClick={async () =>
            await Eitri.navigation.navigate({
              path: "/Document",
            })
          }
        >
          Navegar para Document
        </Button>
        <Button
          className="mt-4 w-full"
          onClick={async () =>
            await Eitri.navigation.navigate({
              path: "/Audio",
            })
          }
        >
          Navegar para Audio
        </Button>
        <Text className="text-white text-xs mt-12">
          v{window.__eitriAppConf.version}
        </Text>
      </View>
    </Page>
  );
}
