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
import { getCounselList } from "../api/institution/counsel.api";
import { getInstitutionDetail } from "../api/institution/profile.api";
import { getInstitutionReviews } from "../api/institution/review.api";

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
          const counselData = counselResponse.data.data || counselResponse.data;
          setCounsels(Array.isArray(counselData) ? counselData : []);
        } catch (error) {
          console.log("Counsel list error:", error);
          setCounsels([]);
        }

        try {
          const reviewResponse = await getInstitutionReviews(institutionId);
          const reviewData = reviewResponse.data.data || reviewResponse.data;
          setReviews(reviewData.content || reviewData.reviews || []);
        } catch (error) {
          console.log("Review list error:", error);
          setReviews([]);
        }
      } catch (error) {
        console.log("Fetch institution error:", error);
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
        onPress={() =>
          router.push(`/screen/InstitutionResult?keyword=${keyword}`)
        }
      >
        <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Image
          source={{
            uri:
              "https://cdn.pixabay.com/photo/2020/01/28/12/38/building-4803763_1280.jpg",
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
          <View style={styles.tagRow}>
            {institution.specializedConditions.map((t) => (
              <View key={t} style={styles.tagBox}>
                <Text style={styles.tagText}>{t}</Text>
              </View>
            ))}
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.descriptionText}>
              기관 설명이 여기에 들어갑니다. (백엔드에서 description 필드 추가 필요)
            </Text>
          </View>

          {/* 직원 정보 */}
          <Text style={styles.sectionTitle}>직원 정보</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {caregivers.map((c) => (
              <View key={c.id} style={styles.staffCard}>
                <Image source={{ uri: c.photoUrl }} style={styles.staffImage} />
                <Text style={styles.staffName}>{c.name}</Text>
                <Text style={styles.staffDetail}>{c.experienceDetails}</Text>
                <Text style={styles.staffDetail}>자격증 보유</Text>
              </View>
            ))}
          </ScrollView>

          {/* 리뷰 */}
          <Text style={styles.sectionTitle}>
            모든 리뷰 ({reviews.length}개)
          </Text>

          {visibleReviews.map((r) => (
            <View key={r.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
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

              <Text style={styles.reviewContent}>{r.content}</Text>

              <View style={styles.reviewTagRow}>
                {r.tags.map((t) => (
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
              onPress={() => router.push("/screen/CounselChat")}
            >
              <Text style={styles.actionLeftText}>상담하기</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionRight}
              onPress={() => {
                if (counsels.length === 0) {
                  Alert.alert("안내", "현재 예약 가능한 상담 서비스가 없습니다.");
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
});
