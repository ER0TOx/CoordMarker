import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const EARTH_RADIUS = 6371000;

export default function HomeScreen() {
  const [position, setPosition] = useState({ x: 0, y: 0, distance: 0 });
  const [velocity, setVelocity] = useState({ vx: 0, vy: 0 });
  const [accuracy, setAccuracy] = useState<number | null>(null);

  const originRef = useRef<{ lat: number; lon: number } | null>(null);
  const latestCoords = useRef<{ lat: number; lon: number; acc: number } | null>(
    null,
  );
  const prevPositionRef = useRef<{ x: number; y: number; time: number } | null>(
    null,
  );

  const calculateLocalXY = (
    originLat: number,
    originLon: number,
    currentLat: number,
    currentLon: number,
  ) => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(currentLat - originLat);
    const dLon = toRad(currentLon - originLon);
    const avgLat = toRad((originLat + currentLat) / 2);

    const x = dLon * Math.cos(avgLat) * EARTH_RADIUS;
    const y = dLat * EARTH_RADIUS;
    const distance = Math.hypot(x, y);

    return { x, y, distance };
  };

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 500,
          distanceInterval: 0.1,
        },
        (location) => {
          const { latitude, longitude, accuracy: currentAcc } = location.coords;
          const now = location.timestamp;

          setAccuracy(currentAcc);
          latestCoords.current = {
            lat: latitude,
            lon: longitude,
            acc: currentAcc ?? 999,
          };

          if (currentAcc && currentAcc > 12) return;

          if (originRef.current) {
            const { x, y, distance } = calculateLocalXY(
              originRef.current.lat,
              originRef.current.lon,
              latitude,
              longitude,
            );

            const snapThreshold = Math.min(2.0, (currentAcc ?? 5) * 0.5);
            const finalX = Math.abs(x) < snapThreshold ? 0 : x;
            const finalY = Math.abs(y) < snapThreshold ? 0 : y;
            const finalDist = Math.hypot(finalX, finalY);

            setPosition({ x: finalX, y: finalY, distance: finalDist });

            if (prevPositionRef.current) {
              const dt = (now - prevPositionRef.current.time) / 1000;
              if (dt > 0.4) {
                const rawVx = (finalX - prevPositionRef.current.x) / dt;
                const rawVy = (finalY - prevPositionRef.current.y) / dt;

                setVelocity({
                  vx: Math.abs(rawVx) < 0.2 ? 0 : rawVx,
                  vy: Math.abs(rawVy) < 0.2 ? 0 : rawVy,
                });
                prevPositionRef.current = { x: finalX, y: finalY, time: now };
              }
            } else {
              prevPositionRef.current = { x: finalX, y: finalY, time: now };
            }
          }
        },
      );
    })();

    return () => {
      subscription?.remove();
    };
  }, []);

  const handleMarkOrigin = () => {
    if (!latestCoords.current) {
      Alert.alert("ค้นหาสัญญาณ", "รอ GPS เชื่อมต่อสักครู่");
      return;
    }
    originRef.current = {
      lat: latestCoords.current.lat,
      lon: latestCoords.current.lon,
    };
    prevPositionRef.current = { x: 0, y: 0, time: Date.now() };
    setPosition({ x: 0, y: 0, distance: 0 });
    setVelocity({ vx: 0, vy: 0 });
  };

  return (
    <View style={styles.container}>
      {/* สถานะความแม่นยำ GPS */}
      <View style={styles.accBadge}>
        <Text style={styles.accText}>
          GPS Accuracy: ±{accuracy ? accuracy.toFixed(1) : "--"} m
        </Text>
      </View>

      {/* กล่องแสดงผลพิกัด (x, y) m */}
      <View style={styles.mainCoordinateBox}>
        <Text style={styles.axisLabel}>Relative Coordinates (E, N)</Text>
        <Text style={styles.axisValue}>
          ({position.x.toFixed(1)}, {position.y.toFixed(1)}){" "}
          <Text style={styles.unit}>m</Text>
        </Text>
      </View>

      {/* ระยะห่างรวมจากจุด Mark */}
      <View style={styles.card}>
        <Text style={styles.label}>Distance to Origin</Text>
        <Text style={styles.distanceValue}>
          {position.distance.toFixed(1)} m
        </Text>
      </View>

      {/* ความเร็วในแต่ละแกน */}
      <View style={styles.card}>
        <Text style={styles.label}>Velocity Components</Text>
        <Text style={styles.value}>vx : {velocity.vx.toFixed(2)} m/s</Text>
        <Text style={styles.value}>vy : {velocity.vy.toFixed(2)} m/s</Text>
      </View>

      {/* ปุ่ม Mark Origin */}
      <TouchableOpacity style={styles.markButton} onPress={handleMarkOrigin}>
        <Text style={styles.buttonText}>MARK ORIGIN (0,0)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0F1D",
    justifyContent: "center",
    padding: 24,
  },
  accBadge: {
    alignSelf: "center",
    backgroundColor: "#1E293B",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  accText: {
    color: "#38BDF8",
    fontSize: 13,
    fontWeight: "bold",
  },
  mainCoordinateBox: {
    backgroundColor: "#1E293B",
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#38BDF8",
    marginBottom: 16,
    alignItems: "center",
  },
  axisLabel: {
    fontSize: 13,
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  axisValue: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#F8FAFC",
    fontFamily: "monospace",
  },
  unit: {
    fontSize: 22,
    color: "#38BDF8",
    fontWeight: "normal",
  },
  card: {
    backgroundColor: "#1E293B",
    padding: 16,
    borderRadius: 12,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: "#334155",
  },
  label: {
    fontSize: 13,
    color: "#94A3B8",
    textTransform: "uppercase",
  },
  distanceValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4ADE80",
    fontFamily: "monospace",
  },
  value: {
    fontSize: 18,
    color: "#F8FAFC",
    fontFamily: "monospace",
  },
  markButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
