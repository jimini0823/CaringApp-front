import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Bell() {
  const router = useRouter();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // TODO: 실제 알림 API가 구현되면 여기에 연결
      // 현재는 알림 API가 없으므로 빈 배열로 설정
      setNotifications([]);
    } catch (error) {
      console.log("Fetch notifications error:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>

      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={26} color="#162B40" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>알림</Text>
      </View>

      <Text style={styles.sectionTitle}>알림 내역</Text>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
      >
        {loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>알림을 불러오는 중...</Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>알림이 없습니다.</Text>
          </View>
        ) : (
          notifications.map((item) => (
          <View key={item.id} style={styles.notificationBox}>
            <View style={styles.iconCircle}>
              <Image
                source={require("../../assets/images/icons/bell.png")}
                style={styles.icon}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.notificationText}>{item.message}</Text>
          </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FB",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 60,
    marginLeft: 10,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#162B40",
    marginLeft: 5,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2C3E50",
    marginTop: 25,
    marginLeft: 25,
    marginBottom: 20,
  },

  notificationBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 15,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },

  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: "#5DA7DB",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  icon: {
    width: 18,
    height: 18,
  },

  notificationText: {
    marginLeft: 15,
    fontSize: 14,
    color: "#6B7B8C",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#8A8A8A",
  },
});
