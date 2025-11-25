import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
    Animated,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

export default function ReservationClear() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // 🔥 Reservation.js에서 넘어오는 값들
  const { name, date, mode } = useLocalSearchParams();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 450,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.97,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.push("/screen/Home");
    });
  };

  return (
    <Pressable style={{ flex: 1 }} onPress={handlePress}>
      <Animated.View
        style={[
          styles.container,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={styles.centerBlock}>
          <Text style={styles.emoji}>🎉</Text>

          <Text style={styles.title}>예약이 완료되었어요</Text>

          <Text style={styles.subtitle}>
            예약이 완료되었습니다{"\n"}방문일자에 맞춰 방문해주세요!
          </Text>

          <View style={[styles.infoBox, { marginTop: 100 }]}>
            {/* 기관 */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>기관</Text>
              <Text style={styles.infoValue}>{name || "기관명"}</Text>
            </View>

            {/* 방문일자 */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>방문일자</Text>
              <Text style={styles.infoValue}>
                {date || "2025년 11월 24일 11:00"}
              </Text>
            </View>

            {/* 예약 방식 */}
            <View style={[styles.infoRow, { marginBottom: 0 }]}>
              <Text style={styles.infoLabel}>예약 방식</Text>
              <Text style={styles.infoValue}>
                {mode || "방문 상담 예약"}
              </Text>
            </View>
          </View>
        </View>

        <LinearGradient
          colors={["#FFFFFF00", "#E8F5FF", "#CDEAFF", "#B3DEFF"]}
          style={styles.gradientBottom}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  centerBlock: {
    position: "absolute",
    top: "33%",
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 30,
    zIndex: 10,
  },

  emoji: {
    fontSize: 80,
    marginBottom: 15,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#5DA7DB",
    marginBottom: 10,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 18,
    color: "#6B7B8C",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 22,
  },

  infoBox: {
    width: "90%",
    backgroundColor: "#F5F9FC",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 18,
    elevation: 2,
    zIndex: 20,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: 12,
  },

  infoLabel: {
    fontSize: 16,
    color: "#6B7B8C",
    width: 80,
  },

  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#162B40",
    marginLeft: 10,
    flexShrink: 1,
  },

  gradientBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "55%",
    zIndex: 0,
  },
});
