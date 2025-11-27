import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import BottomTabBar from "../../components/BottomTabBar";
import { getMyPage, getMyStatistics, getPreferenceTags } from "../api/member/member.api";
import { deleteReview, getMyReviews } from "../api/review/review.api";
import { clearTokens, getAccessToken } from "../utils/tokenHelper";

const { width } = Dimensions.get("window");

export default function Mypage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mypageData, setMypageData] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [preferenceTags, setPreferenceTags] = useState([]);
  const [myReviews, setMyReviews] = useState([]);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchMypageData();
    }
  }, [isLoggedIn]);

  const checkLoginStatus = async () => {
    try {
      const token = await getAccessToken();
      setIsLoggedIn(!!token);
    } catch (error) {
      console.log("Check login status error:", error);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchMypageData = async () => {
    try {
      const mypageResponse = await getMyPage();
      const mypageData = mypageResponse.data.data || mypageResponse.data;
      setMypageData(mypageData);

      // mypage API 응답에 이미 statistics가 포함되어 있음
      if (mypageData.statistics) {
        setStatistics(mypageData.statistics);
      } else {
        // fallback: 별도 API 호출
        try {
          const statsResponse = await getMyStatistics();
          setStatistics(statsResponse.data.data || statsResponse.data);
        } catch (error) {
          console.log("Fetch statistics error:", error);
        }
      }

      // mypage API 응답에 이미 recentReviews가 포함되어 있음
      if (mypageData.recentReviews) {
        setMyReviews(mypageData.recentReviews || []);
      } else {
        // fallback: 별도 API 호출
        try {
          const reviewsResponse = await getMyReviews();
          const reviewsData = reviewsResponse.data.data || reviewsResponse.data;
          setMyReviews(reviewsData.content || reviewsData.reviews || []);
        } catch (error) {
          console.log("Fetch my reviews error:", error);
        }
      }

      try {
        const tagsResponse = await getPreferenceTags();
        const tagsData = tagsResponse.data.data || tagsResponse.data;
        setPreferenceTags(tagsData.tags || tagsData || []);
      } catch (error) {
        console.log("Fetch preference tags error:", error);
      }
    } catch (error) {
      console.log("Fetch mypage data error:", error);
    }
  };

  const handleLogin = () => {
    router.push("/screen/Login");
  };

  const handleLogout = async () => {
    Alert.alert(
      "로그아웃",
      "정말 로그아웃 하시겠습니까?",
      [
        {
          text: "취소",
          style: "cancel",
        },
        {
          text: "로그아웃",
          style: "destructive",
          onPress: async () => {
            try {
              await clearTokens();
              setIsLoggedIn(false);
              router.replace("/screen/Login");
            } catch (error) {
              console.log("Logout error:", error);
              Alert.alert("오류", "로그아웃 중 오류가 발생했습니다.");
            }
          },
        },
      ]
    );
  };

  const handleDeleteReview = async (reviewId) => {
    Alert.alert(
      "리뷰 삭제",
      "정말 이 리뷰를 삭제하시겠습니까?",
      [
        {
          text: "취소",
          style: "cancel",
        },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteReview(reviewId);
              Alert.alert("삭제 완료", "리뷰가 삭제되었습니다.");
              // 리뷰 목록 새로고침
              fetchMypageData();
            } catch (error) {
              console.log("Delete review error:", error);
              const errorMessage =
                error.response?.data?.message || "리뷰 삭제에 실패했습니다.";
              Alert.alert("오류", errorMessage);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#5DA7DB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>마이페이지</Text>
      </View>

      <View style={styles.content}>
        {isLoggedIn ? (
          <>
            {mypageData && mypageData.member && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>회원 정보</Text>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>이름</Text>
                  <Text style={styles.infoValue}>
                    {mypageData.member.name || "-"}
                  </Text>
                </View>
                {mypageData.member.phoneNumber && (
                  <View style={styles.infoCard}>
                    <Text style={styles.infoLabel}>전화번호</Text>
                    <Text style={styles.infoValue}>{mypageData.member.phoneNumber}</Text>
                  </View>
                )}
                {mypageData.member.birthDate && (
                  <View style={styles.infoCard}>
                    <Text style={styles.infoLabel}>생년월일</Text>
                    <Text style={styles.infoValue}>{mypageData.member.birthDate}</Text>
                  </View>
                )}
              </View>
            )}

            {statistics && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>활동 통계</Text>
                <View style={styles.statsContainer}>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>
                      {statistics.elderlyCount || 0}
                    </Text>
                    <Text style={styles.statLabel}>어르신 프로필</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>
                      {statistics.reviewCount || 0}
                    </Text>
                    <Text style={styles.statLabel}>리뷰</Text>
                  </View>
                </View>
              </View>
            )}

            {preferenceTags.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>선호 태그</Text>
                <View style={styles.tagContainer}>
                  {preferenceTags.map((tag) => (
                    <View key={tag.id || tag} style={styles.tagBox}>
                      <Text style={styles.tagText}>
                        {tag.name || tag}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {myReviews.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>내 리뷰 ({myReviews.length}개)</Text>
                {myReviews.slice(0, 3).map((review) => (
                  <View key={review.id} style={styles.reviewCard}>
                    <TouchableOpacity
                      style={styles.reviewContentArea}
                      onPress={() =>
                        router.push({
                          pathname: "/screen/ReviewWrite",
                          params: {
                            reviewId: review.id,
                            institutionId: review.institution?.id,
                            institutionName: review.institution?.name,
                            reservationId: review.reservationId,
                          },
                        })
                      }
                    >
                      <Text style={styles.reviewInstitutionName}>
                        {review.institution?.name || "기관"}
                      </Text>
                      <Text style={styles.reviewContent} numberOfLines={2}>
                        {review.content}
                      </Text>
                      <View style={styles.reviewRating}>
                        {Array.from({ length: review.rating || 0 }).map((_, i) => (
                          <Ionicons
                            key={i}
                            name="star"
                            size={14}
                            color="#FFD700"
                          />
                        ))}
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteReview(review.id)}
                      style={styles.deleteButton}
                    >
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>계정 관리</Text>
              <TouchableOpacity style={styles.button} onPress={handleLogout}>
                <Text style={styles.buttonText}>로그아웃</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>로그인이 필요합니다</Text>
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>로그인</Text>
            </TouchableOpacity>
            <Text style={styles.infoText}>
              로그인 후 마이페이지 기능을 이용할 수 있습니다.
            </Text>
          </View>
        )}
      </View>

      <BottomTabBar activeKey="mypage" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#162B40",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#162B40",
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#5DA7DB",
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  infoText: {
    fontSize: 14,
    color: "#6B7B8C",
    marginTop: 8,
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 12,
    color: "#6B7B8C",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: "#162B40",
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#5DA7DB",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#6B7B8C",
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagBox: {
    backgroundColor: "#F0F8FF",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#5DA7DB",
  },
  tagText: {
    fontSize: 14,
    color: "#5DA7DB",
    fontWeight: "500",
  },
  reviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  reviewContentArea: {
    flex: 1,
  },
  deleteButton: {
    padding: 5,
    marginLeft: 10,
  },
  reviewInstitutionName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#162B40",
    marginBottom: 6,
  },
  reviewContent: {
    fontSize: 14,
    color: "#6B7B8C",
    marginBottom: 8,
  },
  reviewRating: {
    flexDirection: "row",
  },
});

