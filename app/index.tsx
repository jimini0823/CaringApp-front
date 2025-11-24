import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function Index() {
  const r = useRouter();

  useEffect(() => {
    // ✅ router가 준비됐을 때만 이동
    const timer = setTimeout(() => {
      if (r && r.replace) {
        r.replace("/screen/Reservation");
      }
    }, 0); // 바로 실행 (혹은 100~300ms 정도 딜레이 줘도 됨)
    return () => clearTimeout(timer);
  }, [r]);

  return null;
}
