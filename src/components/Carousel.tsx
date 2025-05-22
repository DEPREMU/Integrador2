import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { stylesCarouselComponent } from "@styles/components/stylesCarouselComponent";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useResponsiveLayout } from "@/context/LayoutContext";

interface CarouselProps {
  items: string[];
  interval?: number;
}

const CarouselComponent: React.FC<CarouselProps> = ({
  items,
  interval = 4000,
}) => {
  const { width, styles } = stylesCarouselComponent();
  const [index, setIndex] = useState<number>(0);

  // Un sharedValue por item
  const positions = items.map((_, i) => useSharedValue(i === 0 ? 0 : width));

  const animateToIndex = (newIndex: number, direction: "left" | "right") => {
    const fromIndex = index;

    // Actualiza posición del item actual (lo empuja fuera)
    positions[fromIndex].value = withSpring(
      direction === "left" ? -width : width,
      {
        damping: 15,
        stiffness: 120,
      }
    );

    // Trae el nuevo item al centro (0)
    positions[newIndex].value = withSpring(0, {
      damping: 15,
      stiffness: 120,
    });

    setIndex(newIndex);
  };

  const handleNext = () => {
    const next = index === items.length - 1 ? 0 : index + 1;
    animateToIndex(next, "right");
  };

  const handlePrev = () => {
    const prev = index === 0 ? items.length - 1 : index - 1;
    animateToIndex(prev, "left");
  };

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, interval);

    return () => clearInterval(timer);
  }, [index]);

  return (
    <View style={styles.container}>
      <View style={styles.carouselContainer}>
        {items.map((item, i) => {
          const animatedStyle = useAnimatedStyle(() => ({
            transform: [{ translateX: positions[i].value }],
            position: "absolute",
            width,
          }));

          return (
            <Animated.View key={i} style={[styles.slide, animatedStyle]}>
              <Text style={styles.text}>{item}</Text>
            </Animated.View>
          );
        })}
      </View>

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
