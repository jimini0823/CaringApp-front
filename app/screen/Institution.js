import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import BottomTabBar from "../../components/BottomTabBar";
import { getCaregiverList } from "../api/caregiver/caregiver.api";
import { startChat } from "../api/chat/chat.api";
import { getCounselList } from "../api/institution/counsel.api";
import { getInstitutionDetail } from "../api/institution/profile.api";
import { getInstitutionReviews } from "../api/institution/review.api";
import { reportReview } from "../api/review/review.api";

const { width } = Dimensions.get("window");

export default function Institution() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const institutionId = params.institutionId || params.id;

  const [institution, setInstitution] = useState(null);
  const [caregivers, setCaregivers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [counsels, setCounsels] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  const getInstitutionTypeLabel = (type) => {
    const typeMap = {
      DAY_CARE_CENTER: "데이케어센터",
      NURSING_HOME: "요양원",
      HOME_CARE_SERVICE: "재가 돌봄 서비스",
    };
    return typeMap[type] || type;
  };

  const handleReportReview = async (reviewId) => {
    Alert.alert(
      "리뷰 신고",
      "이 리뷰를 신고하시겠습니까?",
      [
        {
          text: "취소",
          style: "cancel",
        },
        {
          text: "신고",
          style: "destructive",
          onPress: async () => {
            try {
              await reportReview(reviewId, {
                reportReason: "SPAM",
                description: "부적절한 리뷰로 신고합니다.",
              });
              Alert.alert("신고 완료", "리뷰가 신고되었습니다.");
            } catch (error) {
              const errorMessage =
                error.response?.data?.message || "리뷰 신고에 실패했습니다.";
              Alert.alert("오류", errorMessage);
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    const fetchInstitutionData = async () => {
      if (!institutionId) {
        setLoading(false);
        return;
      }

      try {
        const detailResponse = await getInstitutionDetail(institutionId);
        const detailData = detailResponse.data.data || detailResponse.data;
        setInstitution(detailData);

        try {
          const counselResponse = await getCounselList(institutionId);
          let counselData = counselResponse.data?.data || counselResponse.data;
          
          let finalCounsels = [];
          
          if (Array.isArray(counselData)) {
            finalCounsels = counselData;
          } else if (counselData && Array.isArray(counselData.content)) {
            finalCounsels = counselData.content;
          } else if (counselData && Array.isArray(counselData.counsels)) {
            finalCounsels = counselData.counsels;
          }
          
          if (finalCounsels.length === 0) {
            finalCounsels = [
              {
                id: 999,
                title: "일반 상담",
                description: "기관에 대한 일반적인 상담 서비스입니다.",
                isActive: true,
                createdAt: new Date().toISOString(),
              }
            ];
          }
          
          setCounsels(finalCounsels);
        } catch (error) {
          setCounsels([]);
        }

        try {
          const reviewResponse = await getInstitutionReviews(institutionId);
          const reviewData = reviewResponse.data.data || reviewResponse.data;
          setReviews(reviewData.content || reviewData.reviews || []);
        } catch (error) {
          setReviews([]);
        }

        try {
          const caregiverResponse = await getCaregiverList(institutionId);
          const caregiverData = caregiverResponse.data.data || caregiverResponse.data;
          setCaregivers(Array.isArray(caregiverData) ? caregiverData : []);
        } catch (error) {
          setCaregivers([]);
        }
      } catch (error) {
        Alert.alert("오류", "기관 정보를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchInstitutionData();
  }, [institutionId]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#5DA7DB" />
      </View>
    );
  }

  if (!institution) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: "#6B7B8C" }}>기관 정보를 불러올 수 없습니다.</Text>
      </View>
    );
  }

  const visibleReviews = expanded ? reviews : reviews.slice(0, 2);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Image
          source={{
            uri: institution.imageUrl || institution.bannerImageUrl || "https://via.placeholder.com/400x260?text=No+Image",
          }}
          style={styles.topImage}
        />

        <View style={styles.contentBox}>
          {/* 기관 타입 */}
          <Text style={styles.typeText}>
            {getInstitutionTypeLabel(institution.institutionType)}
          </Text>

          {/* 기관명 */}
          <Text style={styles.nameText}>{institution.name}</Text>

          {/* 주소 */}
          <View style={styles.row}>
            <Ionicons name="location-outline" size={18} color="#5DA7DB" />
            <Text style={styles.addressText}>
              {institution.address.city} {institution.address.street}
            </Text>
          </View>

          {/* 입소 가능 */}
          <View style={styles.row}>
            <Ionicons
              name="home-outline"
              size={18}
              color={institution.isAdmissionAvailable ? "#5DA7DB" : "#A0A9B2"}
            />
            <Text
              style={[
                styles.availableText,
                !institution.isAdmissionAvailable && { color: "#A0A9B2" },
              ]}
            >
              {institution.isAdmissionAvailable ? "입소 가능" : "입소 불가능"}
            </Text>
          </View>

          {/* 태그 */}
          {institution.specializedConditions && institution.specializedConditions.length > 0 && (
            <View style={styles.tagRow}>
              {institution.specializedConditions.map((t, index) => (
                <View key={typeof t === 'string' ? t : (t.id || index)} style={styles.tagBox}>
                  <Text style={styles.tagText}>{typeof t === 'string' ? t : (t.name || t)}</Text>
                </View>
              ))}
            </View>
          )}

          {institution.description && (
            <View style={styles.sectionCard}>
              <Text style={styles.descriptionText}>
                {institution.description}
              </Text>
            </View>
          )}

          {/* 직원 정보 */}
          <Text style={styles.sectionTitle}>직원 정보</Text>

          {caregivers.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>등록된 요양보호사가 없습니다.</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {caregivers.map((c) => (
                <View key={c.id} style={styles.staffCard}>
                  {c.photoUrl ? (
                    <Image source={{ uri: c.photoUrl }} style={styles.staffImage} />
                  ) : (
                    <View style={[styles.staffImage, styles.staffImagePlaceholder]}>
                      <Ionicons name="person" size={40} color="#9CA3AF" />
                    </View>
                  )}
                  <Text style={styles.staffName}>{c.name}</Text>
                  {c.experienceDetails && (
                    <Text style={styles.staffDetail} numberOfLines={2}>
                      {c.experienceDetails}
                    </Text>
                  )}
                </View>
              ))}
            </ScrollView>
          )}

          {/* 리뷰 */}
          <Text style={styles.sectionTitle}>
            모든 리뷰 ({reviews.length}개)
          </Text>

          {visibleReviews.map((r) => (
            <View key={r.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                  <Text style={styles.reviewName}>{r.member.name}</Text>
                  <View style={{ flexDirection: "row", marginLeft: 6 }}>
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Ionicons
                        key={`filled-${i}`}
                        name="star"
                        size={16}
                        color="#FFD700"
                        style={{ marginLeft: 2 }}
                      />
                    ))}
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => handleReportReview(r.id)}
                  style={styles.reportButton}
                >
                  <Ionicons name="flag-outline" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              <Text style={styles.reviewContent}>{r.content}</Text>

              <View style={styles.reviewTagRow}>
                {r.tags && r.tags.map((t) => (
                  <View key={t.id} style={styles.reviewTagBox}>
                    <Text style={styles.reviewTagText}>{t.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}

          {/* 모두보기 */}
          {!expanded && (
            <TouchableOpacity
              style={styles.moreBtn}
              onPress={() => setExpanded(true)}
            >
              <Text style={styles.moreBtnText}>모두보기</Text>
            </TouchableOpacity>
          )}

          {/* 상담/예약 */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionLeft}
              onPress={async () => {
                if (counsels.length === 0) {
                  Alert.alert(
                    "안내", 
                    "현재 상담 가능한 서비스가 없습니다.\n\n이 기관은 아직 상담 서비스를 등록하지 않았습니다. 기관 관리자에게 문의해주세요."
                  );
                  return;
                }
                
                try {
                  const firstCounsel = counsels[0];
                  const response = await startChat({
                    institutionId: parseInt(institutionId),
                    counselId: firstCounsel.id,
                  });
                  
                  const chatData = response.data.data;
                  router.push({
                    pathname: "/screen/CounselChat",
                    params: {
                      id: chatData.chatRoomId,
                      name: institution.name,
                      chatRoomId: chatData.chatRoomId,
                    },
                  });
                } catch (error) {
                  Alert.alert(
                    "오류",
                    error.response?.data?.message || "상담을 시작하는데 실패했습니다."
                  );
                }
              }}
            >
              <Text style={styles.actionLeftText}>상담하기</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionRight}
              onPress={() => {
                if (counsels.length === 0) {
                  Alert.alert(
                    "안내", 
                    "현재 예약 가능한 상담 서비스가 없습니다.\n\n이 기관은 아직 상담 서비스를 등록하지 않았습니다. 기관 관리자에게 문의해주세요."
                  );
                  return;
                }
                router.push({
                  pathname: "/screen/Reservation",
                  params: {
                    institutionId: institutionId,
                    institutionName: institution.name,
                  },
                });
              }}
            >
              <Text style={styles.actionRightText}>예약하기</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      <BottomTabBar activeKey="search" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FB",
  },

  backButton: {
    position: "absolute",
    top: 60,
    left: 10,
    zIndex: 20,
  },

  topImage: {
    width: "100%",
    height: 260,
  },

  contentBox: {
    paddingHorizontal: 20,
    marginTop: -20,
  },

  typeText: {
    fontSize: 16,
    color: "#5DA7DB",
  },

  nameText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#162B40",
    marginTop: 3,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  addressText: {
    fontSize: 16,
    marginLeft: 6,
    color: "#162B40",
  },

  availableText: {
    fontSize: 16,
    marginLeft: 6,
    color: "#162B40",
  },

  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },

  tagBox: {
    backgroundColor: "#6B7B8C11",
    borderWidth: 1,
    borderColor: "#6B7B8C",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
  },

  tagText: {
    fontSize: 15,
    color: "#2C3E50",
  },

  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
  },

  descriptionText: {
    fontSize: 16,
    lineHeight: 23,
    color: "#162B40",
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#162B40",
    marginTop: 25,
  },

  staffCard: {
    backgroundColor: "#FFFFFF",
    width: 160,
    borderRadius: 16,
    padding: 15,
    marginRight: 15,
    elevation: 2,
  },

  staffImage: {
    width: "100%",
    height: 120,
    borderRadius: 12,
  },

  staffName: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 10,
  },

  staffDetail: {
    fontSize: 14,
    color: "#5F6F7F",
    marginTop: 2,
  },

  reviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginTop: 15,
  },

  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reportButton: {
    padding: 5,
  },

  reviewName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#162B40",
  },

  reviewContent: {
    fontSize: 16,
    color: "#162B40",
    marginTop: 6,
    marginBottom: 10,
  },

  reviewTagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  reviewTagBox: {
    backgroundColor: "#6B7B8C11",
    borderWidth: 1,
    borderColor: "#6B7B8C",
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginTop: 4,
  },

  reviewTagText: {
    fontSize: 14,
    color: "#2C3E50",
  },

  moreBtn: {
    backgroundColor: "#FFFFFF",
    alignSelf: "center",
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 26,
    borderRadius: 10,
  },

  moreBtnText: {
    fontSize: 16,
    color: "#5DA7DB",
  },

  actionRow: {
    flexDirection: "row",
    marginTop: 30,
    marginBottom: 20,
  },

  actionLeft: {
    flex: 1,
    backgroundColor: "#D7E5F0",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginRight: 10,
  },

  actionLeftText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#5DA7DB",
  },

  actionRight: {
    flex: 1,
    backgroundColor: "#5DA7DB",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginLeft: 10,
  },

  actionRightText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  staffImagePlaceholder: {
    backgroundColor: "#F7F9FB",
    justifyContent: "center",
    alignItems: "center",
  },
});
