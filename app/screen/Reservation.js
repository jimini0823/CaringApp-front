import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { getMyElderlyProfiles } from "../api/elderly/elderly.api";
import { getCounselAvailableTimes, getCounselList } from "../api/institution/counsel.api";
import { getInstitutionList } from "../api/institution/profile.api";
import { createMemberReservation } from "../api/member/reservation.api";
import { getAccessToken } from "../utils/tokenHelper";

const { width } = Dimensions.get("window");

export default function Reservation() {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const institutionId = params.institutionId;
  const institutionName = params.institutionName;

  const [counsels, setCounsels] = useState([]);
  const [selectedCounsel, setSelectedCounsel] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [elderlyProfiles, setElderlyProfiles] = useState([]);
  const [selectedElderly, setSelectedElderly] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingCounsels, setLoadingCounsels] = useState(true);
  const [currentInstitutionId, setCurrentInstitutionId] = useState(institutionId);

  useEffect(() => {
    if (institutionId) {
      setCurrentInstitutionId(institutionId);
    } else {
      // institutionId가 없으면 첫 번째 기관을 가져옵니다
      fetchFirstInstitution();
    }
  }, [institutionId]);

  useEffect(() => {
    if (currentInstitutionId) {
      fetchCounsels();
    }
    fetchElderlyProfiles();
  }, [currentInstitutionId]);

  const fetchFirstInstitution = async () => {
    try {
      // 인증 확인
      const token = await getAccessToken();
      if (!token) {
        Alert.alert("로그인 필요", "예약 기능을 사용하려면 로그인이 필요합니다.", [
          { text: "확인", onPress: () => router.replace("/screen/Login") },
        ]);
        setLoadingCounsels(false);
        return;
      }

      const response = await getInstitutionList({ page: 0, size: 1 });
      const data = response.data?.data || response.data;
      const institutions = data?.content || data || [];
      
      if (institutions.length > 0) {
        const firstInstitution = institutions[0];
        setCurrentInstitutionId(firstInstitution.id);
        // institutionName도 업데이트 (params에 없을 경우)
        if (!institutionName && firstInstitution.name) {
          // institutionName은 params에서만 가져오므로 여기서는 설정하지 않음
        }
      } else {
        setLoadingCounsels(false);
      }
    } catch (error) {
      console.log("Fetch first institution error:", error);
      console.log("Error response:", error.response?.data);
      console.log("Error status:", error.response?.status);
      
      if (error.response?.status === 404) {
        Alert.alert(
          "서버 오류",
          "기관 목록 API를 찾을 수 없습니다.\n서버 설정을 확인해주세요."
        );
      } else if (error.response?.status === 401 || error.message === "No refresh token") {
        Alert.alert("로그인 필요", "예약 기능을 사용하려면 로그인이 필요합니다.", [
          { text: "확인", onPress: () => router.replace("/screen/Login") },
        ]);
      } else {
        Alert.alert("오류", "기관 목록을 불러오는데 실패했습니다.");
      }
      
      setLoadingCounsels(false);
    }
  };

  const fetchCounsels = async () => {
    if (!currentInstitutionId) {
      setLoadingCounsels(false);
      return;
    }
    setLoadingCounsels(true);
    try {
      const response = await getCounselList(currentInstitutionId);
      let data = response.data?.data || response.data;
      
      let finalCounsels = [];
      
      if (Array.isArray(data)) {
        finalCounsels = data;
      } else if (data && Array.isArray(data.content)) {
        finalCounsels = data.content;
      } else if (data && Array.isArray(data.counsels)) {
        finalCounsels = data.counsels;
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
      Alert.alert("오류", "상담 서비스 목록을 불러오는데 실패했습니다.");
      setCounsels([]);
    } finally {
      setLoadingCounsels(false);
    }
  };

  const fetchElderlyProfiles = async () => {
    try {
      // 인증 확인
      const token = await getAccessToken();
      if (!token) {
        // 토큰이 없으면 빈 배열로 설정 (로그인 후 다시 시도)
        setElderlyProfiles([]);
        return;
      }

      const response = await getMyElderlyProfiles();
      const data = response.data.data || response.data;
      setElderlyProfiles(data.profiles || []);
    } catch (error) {
      if (error.response?.status === 401 || error.message === "No refresh token") {
        setElderlyProfiles([]);
      }
    }
  };

  const handleDateSelect = async (date) => {
    if (!selectedCounsel) {
      Alert.alert("안내", "상담 서비스를 먼저 선택해주세요.");
      return;
    }

    setSelectedDate(date);
    setSelectedTime(null);
    setLoading(true);

    try {
      const response = await getCounselAvailableTimes(
        currentInstitutionId,
        selectedCounsel.id,
        date
      );
      const data = response.data.data || response.data;
      // Swagger 응답 구조: { counselId, serviceDate, timeSlots: [...] }
      setAvailableTimes(data.timeSlots || []);
    } catch (error) {
      Alert.alert("오류", "예약 가능 시간을 불러오는데 실패했습니다.");
      setAvailableTimes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReservation = async () => {
    if (!selectedCounsel || !selectedDate || !selectedTime || !selectedElderly) {
      Alert.alert("입력 오류", "모든 항목을 선택해주세요.");
      return;
    }

    try {
      const payload = {
        counselId: selectedCounsel.id,
        reservationDate: selectedDate,
        slotIndex: selectedTime.slotIndex,
        startTime: selectedTime.startTime,
        endTime: selectedTime.endTime,
        elderlyProfileId: selectedElderly.id,
      };

      await createMemberReservation(payload);

      router.push({
        pathname: "/screen/ReservationClear",
        params: {
          name: institutionName || "기관",
          date: `${selectedDate} ${selectedTime.startTime}`,
        },
      });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "예약 생성에 실패했습니다. 다시 시도해주세요.";
      Alert.alert("예약 실패", errorMessage);
    }
  };

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      const dayName = ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];
      dates.push({
        date: dateStr,
        day: date.getDate(),
        dayName,
        month: date.getMonth() + 1,
      });
    }
    return dates;
  };

  const dates = generateDates();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (navigation.canGoBack()) {
              router.back();
            } else {
              router.replace("/screen/Home");
            }
          }}
        >
          <Ionicons name="chevron-back" size={26} color="#162B40" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>예약하기</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>상담 서비스 선택</Text>
          {loadingCounsels ? (
            <Text style={styles.emptyText}>상담 서비스를 불러오는 중...</Text>
          ) : counsels.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>예약 가능한 상담 서비스가 없습니다.</Text>
              <Text style={styles.emptySubtext}>
                해당 기관에 등록된 상담 서비스가 없거나{'\n'}
                현재 예약이 불가능한 상태입니다.
              </Text>
            </View>
          ) : (
            counsels.map((counsel) => (
              <TouchableOpacity
                key={counsel.id}
                style={[
                  styles.optionCard,
                  selectedCounsel?.id === counsel.id && styles.optionCardSelected,
                ]}
                onPress={() => {
                  setSelectedCounsel(counsel);
                  setSelectedDate("");
                  setSelectedTime(null);
                  setAvailableTimes([]);
                }}
              >
                <Text style={styles.optionTitle}>{counsel.title}</Text>
                {counsel.description && (
                  <Text style={styles.optionDescription}>{counsel.description}</Text>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>

        {selectedCounsel && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>날짜 선택</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {dates.map((item) => {
                const isSelected = selectedDate === item.date;
                return (
                  <TouchableOpacity
                    key={item.date}
                    style={[
                      styles.dateCard,
                      isSelected && styles.dateCardSelected,
                    ]}
                    onPress={() => handleDateSelect(item.date)}
                  >
                    <Text
                      style={[
                        styles.dateDayName,
                        isSelected && styles.dateDayNameSelected,
                      ]}
                    >
                      {item.dayName}
                    </Text>
                    <Text
                      style={[
                        styles.dateDay,
                        isSelected && styles.dateDaySelected,
                      ]}
                    >
                      {item.day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {selectedDate && availableTimes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>시간 선택</Text>
            <View style={styles.timeGrid}>
              {availableTimes
                .filter((slot) => slot.isAvailable)
                .map((slot) => {
                  const isSelected =
                    selectedTime?.slotIndex === slot.slotIndex;
                  return (
                    <TouchableOpacity
                      key={slot.slotIndex}
                      style={[
                        styles.timeCard,
                        isSelected && styles.timeCardSelected,
                      ]}
                      onPress={() => setSelectedTime(slot)}
                    >
                      <Text
                        style={[
                          styles.timeText,
                          isSelected && styles.timeTextSelected,
                        ]}
                      >
                        {slot.timeRange || `${slot.startTime}-${slot.endTime}`}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
            </View>
            {availableTimes.filter((slot) => slot.isAvailable).length === 0 && (
              <Text style={styles.emptyText}>
                선택한 날짜에 예약 가능한 시간이 없습니다.
              </Text>
            )}
          </View>
        )}

        {selectedTime && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>어르신 선택</Text>
            {elderlyProfiles.length === 0 ? (
              <Text style={styles.emptyText}>
                등록된 어르신 프로필이 없습니다.
              </Text>
            ) : (
              elderlyProfiles.map((profile) => {
                const isSelected = selectedElderly?.id === profile.id;
                return (
                  <TouchableOpacity
                    key={profile.id}
                    style={[
                      styles.optionCard,
                      isSelected && styles.optionCardSelected,
                    ]}
                    onPress={() => setSelectedElderly(profile)}
                  >
                    <Text style={styles.optionTitle}>{profile.name}</Text>
                    <Text style={styles.optionDescription}>
                      생년월일: {profile.birthDate}
                    </Text>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}

        {selectedCounsel && selectedDate && selectedTime && selectedElderly && (
          <TouchableOpacity
            style={styles.reservationButton}
            onPress={handleReservation}
          >
            <Text style={styles.reservationButtonText}>예약하기</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#162B40",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
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
  optionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  optionCardSelected: {
    borderColor: "#5DA7DB",
    borderWidth: 2,
    backgroundColor: "#F0F8FF",
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#162B40",
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: "#6B7B8C",
  },
  dateCard: {
    width: 70,
    height: 80,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  dateCardSelected: {
    borderColor: "#5DA7DB",
    borderWidth: 2,
    backgroundColor: "#F0F8FF",
  },
  dateDayName: {
    fontSize: 14,
    color: "#6B7B8C",
    marginBottom: 4,
  },
  dateDayNameSelected: {
    color: "#5DA7DB",
    fontWeight: "600",
  },
  dateDay: {
    fontSize: 20,
    fontWeight: "700",
    color: "#162B40",
  },
  dateDaySelected: {
    color: "#5DA7DB",
  },
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  timeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    minWidth: 100,
    alignItems: "center",
  },
  timeCardSelected: {
    borderColor: "#5DA7DB",
    borderWidth: 2,
    backgroundColor: "#F0F8FF",
  },
  timeText: {
    fontSize: 14,
    color: "#162B40",
    fontWeight: "500",
  },
  timeTextSelected: {
    color: "#5DA7DB",
    fontWeight: "600",
  },
  emptyContainer: {
    paddingVertical: 30,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7B8C",
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "500",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 20,
  },
  reservationButton: {
    backgroundColor: "#5DA7DB",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
  },
  reservationButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
});

