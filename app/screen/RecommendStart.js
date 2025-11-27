import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { createElderlyProfile, getMyElderlyProfiles } from "../api/elderly/elderly.api";
import { getRecommendations } from "../api/recommendation/recommendation.api";

export default function RecommendStart() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [step, setStep] = useState(0);

  // 진행률 0 → 1
  const progress = useRef(new Animated.Value(0)).current;

  const circleSize = 90;
  const strokeWidth = 8;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const elderlyResponse = await getMyElderlyProfiles();
        const elderlyData = elderlyResponse.data.data || elderlyResponse.data;
        const profiles = elderlyData.profiles || [];

        if (profiles.length === 0) {
          const tempProfilePayload = {
            name: "테스트 어르신",
            gender: "FEMALE",
            birthDate: "1940-01-01",
            bloodType: "A",
            phoneNumber: "01012345678",
            activityLevel: "MEDIUM",
            cognitiveLevel: "NORMAL",
            longTermCareGrade: "NONE",
            notes: "",
            address: {
              zipCode: "06000",
              city: "서울특별시",
              street: "강남구 테헤란로 123"
            }
          };

          try {
            await createElderlyProfile(tempProfilePayload);
            const newElderlyResponse = await getMyElderlyProfiles();
            const newElderlyData = newElderlyResponse.data.data || newElderlyResponse.data;
            const newProfiles = newElderlyData.profiles || [];
            
            if (newProfiles.length === 0) {
          router.push({
            pathname: "/screen/RecommendClear",
            params: {
              institutions: JSON.stringify([]),
              tagIds: JSON.stringify([]),
            },
          });
          return;
            }
            
            const firstProfile = newProfiles[0];
            const additionalText = params.additionalText || "";
            
            const recommendationResponse = await getRecommendations({
              elderlyProfileId: firstProfile.id,
              additionalText: additionalText,
            });

            let institutions = [];
            const responseData = recommendationResponse.data;
            
            if (responseData.data) {
              if (responseData.data.data && responseData.data.data.institutions) {
                institutions = responseData.data.data.institutions;
              } else if (responseData.data.institutions) {
                institutions = responseData.data.institutions;
              } else if (Array.isArray(responseData.data)) {
                institutions = responseData.data;
              }
            } else if (responseData.institutions) {
              institutions = responseData.institutions;
            } else if (Array.isArray(responseData)) {
              institutions = responseData;
            }

            router.push({
              pathname: "/screen/RecommendClear",
              params: {
                institutions: JSON.stringify(institutions),
                tagIds: JSON.stringify([]),
              },
            });
            return;
          } catch (createError) {
            router.push({
              pathname: "/screen/RecommendClear",
              params: {
                institutions: JSON.stringify([]),
                tagIds: JSON.stringify([]),
              },
            });
            return;
          }
        }

        const firstProfile = profiles[0];
        const additionalText = params.additionalText || "";
        
        const recommendationResponse = await getRecommendations({
          elderlyProfileId: firstProfile.id,
          additionalText: additionalText,
        });

        let institutions = [];
        const responseData = recommendationResponse.data;
        
        if (responseData.data) {
          if (responseData.data.data && responseData.data.data.institutions) {
            institutions = responseData.data.data.institutions;
          } else if (responseData.data.institutions) {
            institutions = responseData.data.institutions;
          } else if (Array.isArray(responseData.data)) {
            institutions = responseData.data;
          }
        } else if (responseData.institutions) {
          institutions = responseData.institutions;
        } else if (Array.isArray(responseData)) {
          institutions = responseData;
        }

        router.push({
          pathname: "/screen/RecommendClear",
          params: {
            institutions: JSON.stringify(institutions),
            tagIds: JSON.stringify([]),
          },
        });
      } catch (error) {
        router.push({
          pathname: "/screen/RecommendClear",
          params: {
            institutions: JSON.stringify([]),
            tagIds: JSON.stringify([]),
          },
        });
      }
    };

    Animated.timing(progress, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: true,
    }).start(() => {
      fetchRecommendations();
    });
  }, []);

  useEffect(() => {
    setTimeout(() => setStep(1), 750);
    setTimeout(() => setStep(2), 1500);
    setTimeout(() => setStep(3), 2250);
  }, []);

  const strokeDashoffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={styles.container}>
      
      <Svg width={circleSize} height={circleSize}>
        <Circle
          cx={circleSize / 2}
          cy={circleSize / 2}
          r={radius}
          stroke="#D6EAF8"
          strokeWidth={strokeWidth}
          fill="none"
        />

        <AnimatedCircle
          cx={circleSize / 2}
          cy={circleSize / 2}
          r={radius}
          stroke="#5DA7DB"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${circleSize / 2}, ${circleSize / 2}`}
        />
      </Svg>

      <Text style={styles.title}>잠시만 기다려주세요</Text>
      <Text style={styles.subtitle}>모두에게 만족스러운 기관을 찾고 있어요!</Text>

      <View style={styles.box}>
        <Ionicons
          name={step >= 1 ? "checkmark-circle" : "radio-button-on"}
          size={24}
          color={step >= 1 ? "#5DA7DB" : "#BFD8EC"}
        />
        <Text style={styles.boxText}>위치 기반 분석</Text>
      </View>

      <View style={styles.box}>
        <Ionicons
          name={step >= 2 ? "checkmark-circle" : "radio-button-on"}
          size={24}
          color={step >= 2 ? "#5DA7DB" : "#BFD8EC"}
        />
        <Text style={styles.boxText}>가격 분석</Text>
      </View>

      <View style={styles.box}>
        <Ionicons
          name={step >= 3 ? "checkmark-circle" : "radio-button-on"}
          size={24}
          color={step >= 3 ? "#5DA7DB" : "#BFD8EC"}
        />
        <Text style={styles.boxText}>선호 요양 시설 분석</Text>
      </View>
    </View>
  );
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FAFF",
    alignItems: "center",
    paddingTop: 210,
  },
  title: {
    marginTop: 25,
    fontSize: 26 ,
    fontWeight: "700",
    color: "#5DA7DB",
  },
  subtitle: {
    marginTop: 5,
    fontSize: 16,
    color: "#6B7B8C",
    marginBottom: 20,
  },
  box: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },
  boxText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#6B7B8C",
    fontWeight: "500",
  },
});
