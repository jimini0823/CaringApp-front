import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// 요일 한글
const WEEKDAY = ["일", "월", "화", "수", "목", "금", "토"];

// mock 날짜 1주
const MOCK_DATES = [
  "2025-11-23",
  "2025-11-24",
  "2025-11-25",
  "2025-11-26",
  "2025-11-27",
  "2025-11-28",
  "2025-11-29",
];

// mock time
const MOCK_AM = [
  { time: "09:00" },
  { time: "09:30" },
  { time: "10:00" },
  { time: "10:30" },
];

const MOCK_PM = [
  { time: "12:00" },
  { time: "12:30" },
  { time: "13:00" },
  { time: "13:30" },
  { time: "14:00" },
];

export default function Reservation() {
  const router = useRouter();
  const { institutionId } = useLocalSearchParams();

  const [selectedDate, setSelectedDate] = useState("2025-11-23");
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  const getDay = (date) => {
    const d = new Date(date);
    return WEEKDAY[d.getDay()];
  };

  const getDateNumber = (date) => {
    return Number(date.split("-")[2]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="#162B40" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>예약하기</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ padding: 20 }}>
        {/* 방문 희망일 */}
        <Text style={styles.sectionTitle}>방문 희망일</Text>
        <Text style={styles.monthText}>11월</Text>

        <View style={styles.dateRow}>
          {MOCK_DATES.map((d) => (
            <TouchableOpacity
              key={d}
              onPress={() => setSelectedDate(d)}
              style={[
                styles.dateBox,
                selectedDate === d && styles.dateBoxSelected,
              ]}
            >
              <Text
                style={[
                  styles.dateWeek,
                  selectedDate === d && styles.dateWeekSelected,
                ]}
              >
                {getDay(d)}
              </Text>
              <Text
                style={[
                  styles.dateDay,
                  selectedDate === d && styles.dateDaySelected,
                ]}
              >
                {getDateNumber(d)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 방문 희망 시간 */}
        <Text style={[styles.sectionTitle, { marginTop: 30 }]}>
          방문 희망 시간
        </Text>

        <Text style={styles.timeTitle}>오전</Text>
        <View style={styles.timeRow}>
          {MOCK_AM.map((t) => (
            <TouchableOpacity
              key={t.time}
              onPress={() => setSelectedTime(t.time)}
              style={[
                styles.timeBox,
                selectedTime === t.time && styles.timeSelected,
              ]}
            >
              <Text
                style={[
                  styles.timeText,
                  selectedTime === t.time && styles.timeTextSelected,
                ]}
              >
                {t.time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.timeTitle}>오후</Text>
        <View style={styles.timeRow}>
          {MOCK_PM.map((t) => (
            <TouchableOpacity
              key={t.time}
              onPress={() => setSelectedTime(t.time)}
              style={[
                styles.timeBox,
                selectedTime === t.time && styles.timeSelected,
              ]}
            >
              <Text
                style={[
                  styles.timeText,
                  selectedTime === t.time && styles.timeTextSelected,
                ]}
              >
                {t.time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>


        {/* 예약 방식 */}
        <Text style={[styles.sectionTitle, { marginTop: 35 }]}>예약 방식</Text>

        <View style={styles.radioBox}>
          <TouchableOpacity
            style={styles.radioRow}
            onPress={() => setSelectedType("입소")}
          >
            <View
              style={[
                styles.radioOuter,
                selectedType === "입소" && styles.radioOuterActive,
              ]}
            >
              {selectedType === "입소" && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.radioLabel}>입소 예약</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.radioBox}>
          <TouchableOpacity
            style={styles.radioRow}
            onPress={() => setSelectedType("방문")}
          >
            <View
              style={[
                styles.radioOuter,
                selectedType === "방문" && styles.radioOuterActive,
              ]}
            >
              {selectedType === "방문" && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.radioLabel}>방문 상담 예약</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.radioBox}>
          <TouchableOpacity
            style={styles.radioRow}
            onPress={() => setSelectedType("전화")}
          >
            <View
              style={[
                styles.radioOuter,
                selectedType === "전화" && styles.radioOuterActive,
              ]}
            >
              {selectedType === "전화" && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.radioLabel}>전화 상담 예약</Text>
          </TouchableOpacity>
        </View>

        {/* 예약 완료 버튼 */}
        <TouchableOpacity
          style={[
            styles.submitBtn,
            !(selectedDate && selectedTime && selectedType) &&
              styles.submitDisabled,
          ]}
          disabled={!(selectedDate && selectedTime && selectedType)}
        >
          <Text style={styles.submitTxt}>예약 완료하기</Text>
        </TouchableOpacity>

        <View style={{ height: 70 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 10,
    paddingHorizontal: 15,
  },
  headerTitle: {
    fontSize: 22,
    marginLeft: 5,
    color: "#162B40",
    fontWeight: "600",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#162B40",
  },
  monthText: {
    marginTop: 5,
    fontSize: 14,
    color: "#8A8A8A",
    marginBottom: 12,
  },

  dateRow: { flexDirection: "row", justifyContent: "space-between" },
  dateBox: {
    width: 48,
    height: 65,
    backgroundColor: "#F7F9FB",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  dateWeek: { color: "#A0A7AF", fontSize: 14 },
  dateDay: { color: "#162B40", fontSize: 16, marginTop: 2 },

  dateBoxSelected: {
    backgroundColor: "#FFF2EC",
  },
  dateWeekSelected: { color: "#FF7F50", fontWeight: "700" },
  dateDaySelected: { color: "#FF7F50", fontWeight: "700" },

  timeTitle: {
    fontSize: 15,
    color: "#8A8A8A",
    marginBottom: 10,
    marginTop: 20,
  },
  timeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  timeBox: {
    width: "23%",
    backgroundColor: "#F7F9FB",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  timeSelected: { backgroundColor: "#EEF6FF" },
  timeText: { color: "#36424A", fontSize: 14 },
  timeTextSelected: { color: "#1A73E8", fontWeight: "700" },

  radioBox: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 15,
    marginBottom: 10,
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#DCE2E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  radioOuterActive: { borderColor: "#5DA7DB" },
  radioInner: {
    width: 10,
    height: 10,
    backgroundColor: "#5DA7DB",
    borderRadius: 5,
  },
  radioLabel: {
    fontSize: 15,
    color: "#162B40",
  },

  submitBtn: {
    marginTop: 25,
    backgroundColor: "#5DA7DB",
    paddingVertical: 17,
    borderRadius: 15,
    alignItems: "center",
  },
  submitDisabled: {
    backgroundColor: "#DDE6EF",
  },
  submitTxt: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
