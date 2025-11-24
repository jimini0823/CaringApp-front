import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import BottomTabBar from "../../components/BottomTabBar";

const { width } = Dimensions.get("window");

export default function InstitutionResult() {
  const router = useRouter();
  const { keyword } = useLocalSearchParams();

  const [searchText, setSearchText] = useState(keyword || "");
  const [results, setResults] = useState([]);

  useEffect(() => {
    setResults([]);
  }, [keyword]);

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
            onSubmitEditing={() =>
              router.push(`/screen/InstitutionResult?keyword=${searchText}`)
            }
          />
          <Ionicons name="search" size={20} color="#8A8A8A" />
        </View>
      </View>

      <View style={styles.grayBackground} />

      <ScrollView style={styles.resultScroll} showsVerticalScrollIndicator={false}>
        {/* API 연결 전이므로 안내 문구 출력 */}
        {results.length === 0 && (
          <View style={{ marginTop: 50, alignItems: "center" }}>
            <Text style={{ color: "#6B7B8C", fontSize: 16 }}>
              검색 결과가 없습니다.
            </Text>
            <Text style={{ color: "#A0A9B2", marginTop: 6 }}>
              (API 연결 후 결과가 표시됩니다)
            </Text>
          </View>
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
});
