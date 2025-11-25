import { Ionicons } from "@expo/vector-icons";
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

import { createMemberReservation } from "../api/member/reservation.api";
import { getCounselList, getCounselAvailableTimes } from "../api/institution/counsel.api";
import { getMyElderlyProfiles } from "../api/elderly/elderly.api";

const { width } = Dimensions.get("window");

export default function Reservation() {
  const router = useRouter();
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

  useEffect(() => {
    fetchCounsels();
    fetchElderlyProfiles();
  }, [institutionId]);

  const fetchCounsels = async () => {
    if (!institutionId) return;
    try {
      const response = await getCounselList(institutionId);
      const data = response.data.data || response.data;
      setCounsels(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log("Fetch counsels error:", error);
    }
  };

  const fetchElderlyProfiles = async () => {
    try {
      const response = await getMyElderlyProfiles();
      const data = response.data.data || response.data;
      setElderlyProfiles(data.profiles || []);
    } catch (error) {
      console.log("Fetch elderly profiles error:", error);
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
        institutionId,
        selectedCounsel.id,
        date
      );
      const data = response.data.data || response.data;
      setAvailableTimes(data.timeSlots || []);
    } catch (error) {
      console.log("Fetch available times error:", error);
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
          name: institutionName,
          date: `${selectedDate} ${selectedTime.startTime}`,
        },
      });
    } catch (error) {
      console.log("Create reservation error:", error);
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
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={26} color="#162B40" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>예약하기</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>상담 서비스 선택</Text>
          {counsels.length === 0 ? (
            <Text style={styles.emptyText}>예약 가능한 상담 서비스가 없습니다.</Text>
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
  emptyText: {
    fontSize: 14,
    color: "#6B7B8C",
    textAlign: "center",
    paddingVertical: 20,
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
