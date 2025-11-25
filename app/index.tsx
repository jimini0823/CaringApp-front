import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { getAccessToken } from "./utils/tokenHelper";

export default function Index() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuthAndNavigate = async () => {
      try {
        const token = await getAccessToken();
        
        if (token) {
          router.replace("/screen/Home");
        } else {
          router.replace("/screen/Login");
        }
      } catch (error) {
        console.log("Auth check error:", error);
        router.replace("/screen/Login");
      } finally {
        setIsChecking(false);
      }
    };

    if (router && router.replace) {
      checkAuthAndNavigate();
    }
  }, [router]);

  // 로딩 중일 때 스플래시 화면 표시
  if (isChecking) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#5DA7DB" />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
});
