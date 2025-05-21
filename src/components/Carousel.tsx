import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Pressable, StyleSheet, Text, View } from "react-native";

const { width } = Dimensions.get("window");

interface CarouselProps {
  items: string[];
  interval?: number;
}

const CarouselComponent: React.FC<CarouselProps> = ({ items, interval = 4000 }) => {
  const [index, setIndex] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, interval);

    return () => clearInterval(timer);
  }, [index]);

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: -width * index,
      useNativeDriver: true,
    }).start();
  }, [index]);

  const handlePrev = () => {
    setIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };

  return (
    <View style={styles.container}>
      <View style={styles.carouselContainer}>
        <Animated.View
          style={[
            styles.slider,
            {
              width: width * items.length,
              transform: [{ translateX }],
            },
          ]}
        >
          {items.map((item, i) => (
            <View key={i} style={styles.slide}>
              <Text style={styles.text}>{item}</Text>
            </View>
          ))}
        </Animated.View>
      </View>

      {/* Flechas usando texto */}
      <View style={styles.arrows}>
        <Pressable onPress={handlePrev} style={styles.arrowButton}>
          <Text style={styles.arrowText}>←</Text>
        </Pressable>
        <Pressable onPress={handleNext} style={styles.arrowButton}>
          <Text style={styles.arrowText}>→</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default CarouselComponent;

const styles = StyleSheet.create({
  container: {
    height: 180,
    justifyContent: "center",
    alignItems: "center",
  },
  carouselContainer: {
    width: width,
    overflow: "hidden",
  },
  slider: {
    flexDirection: "row",
  },
  slide: {
    width: width,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  arrows: {
    position: "absolute",
    width: "80%",
    top: "50%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    transform: [{ translateY: -15 }],
  },
  arrowButton: {
    backgroundColor: "#60c4b4",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    elevation: 3,
  },
  arrowText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
