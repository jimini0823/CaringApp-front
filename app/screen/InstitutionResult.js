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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { getInstitutionList } from "../api/institution/profile.api";
import BottomTabBar from "../../components/BottomTabBar";

const { width } = Dimensions.get("window");

export default function InstitutionResult() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [searchText, setSearchText] = useState(params.keyword || params.name || "");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  // 기관 유형 한글 변환
  const getInstitutionTypeLabel = (type) => {
    const typeMap = {
      DAY_CARE_CENTER: "데이케어센터",
      NURSING_HOME: "요양원",
      HOME_CARE_SERVICE: "재가 돌봄 서비스",
    };
    return typeMap[type] || type;
  };

  // API 파라미터 변환
  const buildApiParams = () => {
    const apiParams = {
      page: page,
      size: 20,
      sort: "name,asc",
    };

    // 검색어
    if (params.keyword || params.name) {
      apiParams.name = params.keyword || params.name;
    }

    // 기관 유형
    if (params.institutionType) {
      apiParams.institutionType = params.institutionType;
    }

    // 지역 검색 - city 파라미터가 문자열로 전달될 수 있으므로 확인
    if (params.city && params.city !== "null" && params.city !== "undefined") {
      apiParams.city = String(params.city);
    }

    // 거리 기반 검색
    if (params.radiusKm && params.radiusKm !== "null" && params.radiusKm !== "undefined") {
      const radius = parseFloat(params.radiusKm);
      if (!isNaN(radius) && radius > 0) {
        apiParams.radiusKm = radius;
        // TODO: 실제 위치 정보 가져오기
        // apiParams.latitude = userLatitude;
        // apiParams.longitude = userLongitude;
      }
    }

    // 가격
    if (params.maxMonthlyFee && params.maxMonthlyFee !== "null" && params.maxMonthlyFee !== "undefined") {
      const fee = parseInt(params.maxMonthlyFee);
      if (!isNaN(fee) && fee > 0) {
        apiParams.maxMonthlyFee = fee;
      }
    }

    // 입소 가능 여부
    if (
      params.isAdmissionAvailable === "true" ||
      params.isAdmissionAvailable === true ||
      params.isAdmissionAvailable === "1"
    ) {
      apiParams.isAdmissionAvailable = true;
    }

    return apiParams;
  };

  const fetchResults = async (resetPage = false) => {
    if (loading) return;

    setLoading(true);
    setError(null);
    try {
      const currentPage = resetPage ? 0 : page;
      const apiParams = buildApiParams();
      apiParams.page = currentPage;

      const response = await getInstitutionList(apiParams);
      const data = response.data.data || response.data;

      if (resetPage) {
        setResults(data.content || []);
        setPage(0);
      } else {
        setResults((prev) => [...prev, ...(data.content || [])]);
      }

      setHasMore(!data.last);
      if (!resetPage) {
        setPage((prev) => prev + 1);
      }
    } catch (error) {
      console.log("Search error:", error);
      console.log("Error response:", error.response?.data);
      console.log("Error status:", error.response?.status);
      
      let errorMessage = "검색 중 오류가 발생했습니다.";
      
      if (error.response?.status === 404) {
        errorMessage = "검색 API를 찾을 수 없습니다.\n서버 설정을 확인해주세요.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      
      if (resetPage) {
        setResults([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults(true);
  }, [
    params.keyword,
    params.name,
    params.institutionType,
    params.city,
    params.radiusKm,
    params.maxMonthlyFee,
    params.isAdmissionAvailable,
  ]);

  const handleSearch = () => {
    router.push({
      pathname: "/screen/InstitutionResult",
      params: { keyword: searchText, name: searchText },
    });
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchResults(false);
    }
  };

  const handleInstitutionPress = (institutionId) => {
    router.push({
      pathname: "/screen/Institution",
      params: { institutionId },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() =>
            router.push(`/screen/Search?keyword=${searchText}`)
          }
        >
          <Ionicons name="chevron-back" size={26} color="#162B40" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>검색 결과</Text>
      </View>

      <View style={styles.searchBoxWrapper}>
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="기관명을 검색하세요"
            placeholderTextColor="#C6CDD5"
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          <Ionicons name="search" size={20} color="#8A8A8A" />
        </View>
      </View>

      <View style={styles.grayBackground} />

      <ScrollView
        style={styles.resultScroll}
        showsVerticalScrollIndicator={false}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const paddingToBottom = 20;
          if (
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom
          ) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        {loading && results.length === 0 && !error ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#5DA7DB" />
            <Text style={styles.loadingText}>검색 중...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="alert-circle" size={48} color="#FF6B6B" />
            <Text style={styles.emptyText}>검색 중 오류가 발생했습니다.</Text>
            <Text style={styles.emptySubtext}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => fetchResults(true)}
            >
              <Text style={styles.retryButtonText}>다시 시도</Text>
            </TouchableOpacity>
          </View>
        ) : results.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>검색 결과가 없습니다.</Text>
            <Text style={styles.emptySubtext}>
              다른 검색어나 필터를 시도해보세요.
            </Text>
          </View>
        ) : (
          <>
            {results.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.resultCard}
                onPress={() => handleInstitutionPress(item.id)}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardType}>
                    {getInstitutionTypeLabel(item.institutionType)}
                  </Text>
                  {item.isAdmissionAvailable && (
                    <View style={styles.availableBadge}>
                      <Text style={styles.availableText}>입소 가능</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.cardName}>{item.name}</Text>
                <View style={styles.cardRow}>
                  <Ionicons name="location" size={16} color="#5DA7DB" />
                  <Text style={styles.cardAddress}>
                    {item.address?.city} {item.address?.street}
                  </Text>
                </View>
                {item.monthlyBaseFee && (
                  <Text style={styles.cardPrice}>
                    월 {item.monthlyBaseFee.toLocaleString()}원
                  </Text>
                )}
              </TouchableOpacity>
            ))}
            {loading && (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color="#5DA7DB" />
              </View>
            )}
          </>
        )}

        <View style={{ height: 140 }} />
      </ScrollView>

      <BottomTabBar activeKey="search" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 60,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#162B40",
    marginLeft: 5,
  },
  searchBoxWrapper: {
    marginHorizontal: 20,
    marginTop: 15,
    zIndex: 10,
  },
  searchBox: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E4E9EE",
    backgroundColor: "#F7F9FB",
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    color: "#162B40",
    marginRight: 10,
  },
  grayBackground: {
    position: "absolute",
    top: 155,
    width: "100%",
    height: "100%",
    backgroundColor: "#F7F9FB",
    zIndex: -1,
  },
  resultScroll: {
    marginTop: 15,
    paddingHorizontal: 20,
    backgroundColor: "#F7F9FB",
  },
  loadingContainer: {
    marginTop: 50,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    color: "#6B7B8C",
    fontSize: 16,
  },
  emptyContainer: {
    marginTop: 50,
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    color: "#6B7B8C",
    fontSize: 16,
    fontWeight: "600",
  },
  emptySubtext: {
    color: "#A0A9B2",
    fontSize: 14,
    marginTop: 6,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: "#5DA7DB",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  resultCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardType: {
    fontSize: 13,
    color: "#5DA7DB",
    fontWeight: "600",
  },
  availableBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  availableText: {
    fontSize: 11,
    color: "#4CAF50",
    fontWeight: "600",
  },
  cardName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#162B40",
    marginBottom: 8,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  cardAddress: {
    fontSize: 14,
    color: "#6B7B8C",
    marginLeft: 4,
    flex: 1,
  },
  cardPrice: {
    fontSize: 15,
    color: "#162B40",
    fontWeight: "600",
    marginTop: 4,
  },
  loadingMore: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
