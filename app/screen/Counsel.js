import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import BottomTabBar from "../../components/BottomTabBar";
import { getMyConsultRequests } from "../api/chat/chat.api";

export default function Counsel() {
  const router = useRouter();

  const [chatList, setChatList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConsultRequests();
  }, []);

  const fetchConsultRequests = async () => {
    try {
      setLoading(true);
      const response = await getMyConsultRequests({
        page: 0,
        size: 50,
        sort: ["lastMessageAt,desc"],
      });

      const data = response.data.data || response.data;
      const consultRequests = data.consultRequests || data.content || [];

      const formattedList = consultRequests.map((request) => ({
        id: request.id,
        chatRoomId: request.chatRoomId,
        name: request.institution?.name || "기관명 없음",
        image: request.institution?.imageUrl || request.institution?.bannerImageUrl || "https://via.placeholder.com/55?text=No+Image",
        lastMessage: request.lastMessageContent || "메시지가 없습니다.",
        lastTime: request.lastMessageAt ? new Date(request.lastMessageAt) : new Date(request.createdAt),
        unread: request.unreadCount || 0,
        status: request.status,
      }));

      setChatList(formattedList);
    } catch (error) {
      console.log("Fetch consult requests error:", error);
      setChatList([]);
    } finally {
      setLoading(false);
    }
  };

  const getDateLabel = (time) => {
    if (!time) return "";
    
    const now = new Date();
    const timeDate = time instanceof Date ? time : new Date(time);
    const diff = Math.floor((now - timeDate) / (1000 * 60 * 60 * 24));

    if (diff === 0) return "오늘";
    if (diff === 1) return "어제";
    if (diff <= 6) return `${diff}일 전`;

    const year = timeDate.getFullYear();
    const month = String(timeDate.getMonth() + 1).padStart(2, "0");
    const day = String(timeDate.getDate()).padStart(2, "0");
    const nowYear = now.getFullYear();

    if (year !== nowYear) {
      const shortYear = String(year).slice(2);
      return `${shortYear}/${month}/${day}`;
    }

    return `${month}/${day}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>상담</Text>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.listArea}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#5DA7DB" />
          </View>
        ) : chatList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>상담 내역이 없습니다.</Text>
          </View>
        ) : (
          chatList.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: "/screen/CounselChat",
                  params: {
                    id: item.chatRoomId,
                    name: item.name,
                    chatRoomId: item.chatRoomId,
                  },
                })
              }
            >
              <Image source={{ uri: item.image }} style={styles.thumb} />

              <View style={styles.infoBox}>
                <Text style={styles.nameText}>{item.name}</Text>
                <Text style={styles.messageText}>{item.lastMessage}</Text>
              </View>

              <View style={styles.rightBox}>
                <Text style={styles.dateText}>{getDateLabel(item.lastTime)}</Text>

                {item.unread > 0 ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.unread}</Text>
                  </View>
                ) : (
                  <View style={{ height: 22 }} /> 
                )}
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 140 }} />
      </ScrollView>

      <BottomTabBar activeKey="counsel" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FB",
    paddingTop: 60,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#162B40",
    paddingHorizontal: 20,
    marginBottom: 15,
  },

  listArea: {
    paddingHorizontal: 20,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
    paddingHorizontal: 10,
  },

  thumb: {
    width: 55,
    height: 55,
    borderRadius: 12,
  },

  infoBox: {
    flex: 1,
    marginLeft: 12,
  },

  nameText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#162B40",
  },

  messageText: {
    marginTop: 4,
    fontSize: 16,
    color: "#5F6F7F",
  },

  rightBox: {
    alignItems: "center",
    justifyContent: "center",
    width: 70,
  },

  dateText: {
    fontSize: 16,
    color: "#162B40",
    marginBottom: 5,
  },

  badge: {
    backgroundColor: "#FF8A3D",
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  badgeText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
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
