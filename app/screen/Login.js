import { useAssets } from "expo-asset";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import {
    Alert,
    Dimensions,
    Image,
    Keyboard,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";

import { loginOAuth2, loginUser } from "../api/auth/auth.api";
import { useSignup } from "../context/SignupContext";
import { performOAuthLogin } from "../utils/oauthHelper";
import { saveTokens } from "../utils/tokenHelper";

// JWT 토큰에서 payload를 디코딩하는 함수
const decodeJwtPayload = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.log("[JWT] 토큰 디코딩 실패:", e);
    return null;
  }
};

// WebBrowser 완료 후 인증 세션 정리
WebBrowser.maybeCompleteAuthSession();

const { width } = Dimensions.get("window");

export default function Login() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [focusedField, setFocusedField] = useState("");
  const { updateSignup } = useSignup();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [loaded] = useAssets([
    require("../../assets/images/logo.png"),
    require("../../assets/images/naver.png"),
    require("../../assets/images/google.png"),
    require("../../assets/images/kakao.png"),
  ]);

  const handleLogin = async () => {
    if (!id || !password) {
      Alert.alert("입력 오류", "아이디와 비밀번호를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await loginUser({
        username: id,
        password: password,
      });

      const { access_token, refresh_token } = response.data.data || response.data;
      
      if (access_token) {
        await saveTokens(access_token, refresh_token);
        // 홈 화면으로 이동
        router.replace("/screen/Home");
      } else {
        Alert.alert("로그인 실패", "로그인에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      if (__DEV__) {
        console.error("Login error:", error);
      }
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.";
      Alert.alert("로그인 실패", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider) => {
    if (isLoading) {
      Alert.alert("알림", "이미 처리 중입니다. 잠시만 기다려주세요.");
      return;
    }

    setIsLoading(true);
    
    try {
      const { accessToken, state } = await performOAuthLogin(provider);

      if (!accessToken) {
        throw new Error("access_token을 받지 못했습니다.");
      }

      const payload = {
        access_token: accessToken,
        state: state,
      };

      const response = await loginOAuth2(provider, payload);
      const { access_token, refresh_token } = response.data.data || response.data;

      if (access_token) {
        const jwtPayload = decodeJwtPayload(access_token);
        const role = jwtPayload?.role;
        
        await saveTokens(access_token, refresh_token);

        if (role === "ROLE_TEMP_OAUTH") {
          updateSignup({
            access_token: access_token,
            oauthProvider: provider,
            credentialType: jwtPayload?.credential_type,
            credentialId: jwtPayload?.credential_id,
          });
          
          router.replace("/screen/SelfIdentification");
        } else {
          router.replace("/screen/Home");
        }
      } else {
        Alert.alert(
          "로그인 실패",
          "토큰을 받지 못했습니다. 다시 시도해주세요."
        );
      }
    } catch (error) {
      const isTimeoutError = error.code === 'ECONNABORTED' || 
                            error.message?.includes('timeout') ||
                            error.message?.includes('exceeded');
      
      if (__DEV__) {
        console.error("[OAuth] 에러 발생:", {
          type: error.constructor.name,
          message: error.message,
          code: error.code,
          status: error.response?.status,
          statusText: error.response?.statusText,
          responseData: error.response?.data,
          url: error.config?.url,
          method: error.config?.method,
          isTimeout: isTimeoutError
        });
      }
      
      let errorMessage;
      if (isTimeoutError) {
        errorMessage = "서버 응답 시간이 초과되었습니다.\n백엔드 서버가 응답하지 않거나 처리 시간이 오래 걸리고 있습니다.\n\n다시 시도하거나 잠시 후 시도해주세요.";
      } else if (error.response?.status === 500) {
        const serverMessage = error.response?.data?.message;
        errorMessage = serverMessage || "서버 내부 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.";
      } else if (error.response?.status) {
        errorMessage = error.response?.data?.errorMessage ||
                      error.response?.data?.message ||
                      `서버 오류가 발생했습니다. (상태 코드: ${error.response.status})`;
      } else {
        errorMessage = error.message || "OAuth 로그인에 실패했습니다. 다시 시도해주세요.";
      }
      
      Alert.alert("로그인 실패", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!loaded) return null;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>

        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              focusedField === "id" && styles.inputFocused,
            ]}
            placeholder="아이디"
            placeholderTextColor="#A0AEC0"
            value={id}
            onChangeText={setId}
            onFocus={() => setFocusedField("id")}
            onBlur={() => setFocusedField("")}
            underlineColorAndroid="transparent"
            selectionColor="#5DA7DB"
          />

          <TextInput
            style={[
              styles.input,
              focusedField === "password" && styles.inputFocused,
            ]}
            placeholder="비밀번호"
            placeholderTextColor="#A0AEC0"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            onFocus={() => setFocusedField("password")}
            onBlur={() => setFocusedField("")}
            underlineColorAndroid="transparent"
            selectionColor="#5DA7DB"
          />
        </View>

        <View style={styles.linkRow}>
          <TouchableOpacity onPress={() => router.push("/screen/SelfIdentification")}>
            <Text style={styles.linkText}>회원가입</Text>
          </TouchableOpacity>
          <Text style={styles.separator}>|</Text>
          <TouchableOpacity>
            <Text style={styles.linkText}>비밀번호 찾기</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.loginButton,
            (!(id && password) || isLoading) && styles.loginButtonDisabled,
          ]}
          disabled={!(id && password) || isLoading}
          onPress={handleLogin}
        >
          <Text style={styles.loginButtonText}>
            {isLoading ? "로그인 중..." : "로그인"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.snsTitle}>SNS 계정으로 로그인</Text>
        <View style={styles.snsRow}>
          <TouchableOpacity
            style={[styles.snsCircle, styles.naver]}
            onPress={() => handleOAuthLogin("naver")}
            disabled={isLoading}
          >
            <Image
              source={require("../../assets/images/naver.png")}
              style={styles.snsIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.snsCircle, styles.google]}
            onPress={() => handleOAuthLogin("google")}
            disabled={isLoading}
          >
            <Image
              source={require("../../assets/images/google.png")}
              style={styles.snsIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.snsCircle, styles.kakao]}
            onPress={() => handleOAuthLogin("kakao")}
            disabled={isLoading}
          >
            <Image
              source={require("../../assets/images/kakao.png")}
              style={styles.snsIcon}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 140,
  },
  logo: {
    width: width * 0.75,
    height: 130,
    marginBottom: 50,
  },
  inputContainer: {
    width: "80%",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#F7F9FB",
    borderColor: "#E2E8F0",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    height: 50,
    fontSize: 16,
    marginBottom: 10,
    color: "#162B40",
  },
  inputFocused: {
    borderColor: "#5DA7DB",
    borderWidth: 1.8,
  },
  linkRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    width: "80%",
    marginTop: 6,
  },
  linkText: {
    color: "#6B7B8C",
    fontSize: 15,
  },
  separator: {
    color: "#CBD5E0",
    marginHorizontal: 8,
    fontSize: 15,
  },
  loginButton: {
    width: "80%",
    height: 50,
    backgroundColor: "#5DA7DB",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
  },
  loginButtonDisabled: {
    backgroundColor: "#D7E5F0",
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  snsTitle: {
    color: "#6B7B8C",
    fontSize: 15,
    marginTop: 45,
    marginBottom: 12,
  },
  snsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  snsCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  snsIcon: {
    width: 26,
    height: 26,
    resizeMode: "contain",
  },
  kakao: {
    backgroundColor: "#FEE500",
  },
  naver: {
    backgroundColor: "#04B916",
  },
  google: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
});
