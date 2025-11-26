import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { getAccessToken } from "./utils/tokenHelper";

export default function Index() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuthAndNavigate = async () => {
      // Root Layout이 마운트될 때까지 약간의 지연을 줍니다
      setTimeout(async () => {
        try {
          // 로그인 상태 확인
          const token = await getAccessToken();
          
          if (router && router.replace) {
            if (token) {
              // 로그인된 경우 Reservation 화면으로 이동
              router.replace("/screen/Reservation");
            } else {
              // 로그인되지 않은 경우 Login 화면으로 이동
              router.replace("/screen/Login");
            }
          }
        } catch (error) {
          console.log("Navigation error:", error);
          // 재시도
          setTimeout(async () => {
            try {
              const token = await getAccessToken();
              if (router && router.replace) {
                if (token) {
                  router.replace("/screen/Reservation");
                } else {
                  router.replace("/screen/Login");
                }
              }
            } catch (retryError) {
              console.log("Retry navigation error:", retryError);
              // 최종적으로 Login 화면으로 이동
              if (router && router.replace) {
                router.replace("/screen/Login");
              }
            }
          }, 100);
        } finally {
          setIsChecking(false);
        }
      }, 100);
    };

    checkAuthAndNavigate();
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
