/* eslint-disable react-hooks/rules-of-hooks */
import Animated, {
  runOnJS,
  withTiming,
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { Text, View } from "react-native";
import { useStylesCarouselComponent } from "@styles/components/stylesCarouselComponent";
import React, { useEffect, useState, useRef, useCallback } from "react";

interface CarouselProps {
  /**
   * Array of text items to display in the carousel.
   */
  items: string[];

  /**
   * Time interval in milliseconds for automatic slide change.
   * @default 4000
   */
  interval?: number;
}

/**
 * Carousel component that displays a list of text items with opacity and scale animations.
 * Automatically cycles through slides based on the specified interval.
 *
 * @param {CarouselProps} props - Component props.
 * @param {string[]} props.items - List of text items to display.
 * @param {number} [props.interval=4000] - Interval in milliseconds for automatic slide change.
 * @returns {JSX.Element} The animated carousel component.
 *
 * @example
 * <CarouselComponent items={['Slide 1', 'Slide 2']} interval={3000} />
 */
const CarouselComponent: React.FC<CarouselProps> = ({
  items,
  interval = 4000,
}) => {
  const { styles, width } = useStylesCarouselComponent();
  const [index, setIndex] = useState<number>(0);

  // Shared values for opacity and scale of each slide
  // First slide visible (opacity=1, scale=1), others hidden (opacity=0, scale=0.8)
  const opacityRef = useRef(
    items.map((_, i) => useSharedValue(i === 0 ? 1 : 0)),
  );
  const scaleRef = useRef(
    items.map((_, i) => useSharedValue(i === 0 ? 1 : 0.8)),
  );

  useEffect(() => {
    opacityRef.current.forEach((opacity, i) => {
      opacity.value = withTiming(i === index ? 1 : 0, { duration: 500 });
    });
    scaleRef.current.forEach((scale, i) => {
      scale.value = withTiming(i === index ? 1 : 0.8, { duration: 500 });
    });
  }, [index]);

  const handleNext = useCallback(() => {
    const next = index === items.length - 1 ? 0 : index + 1;
    runOnJS(setIndex)(next);
  }, [index, items.length]);

  useEffect(() => {
    const timer = setInterval(handleNext, interval);
    return () => clearInterval(timer);
  }, [index, interval, handleNext]);

  return (
    <View style={styles.container}>
      <View style={[styles.carouselContainer, { width }]}>
        {items.map((item, i) => {
          const animatedStyle = useAnimatedStyle(() => ({
            opacity: opacityRef.current[i].value,
            transform: [{ scale: scaleRef.current[i].value }],
            position: "absolute",
            width,
            justifyContent: "center",
            alignItems: "center",
          }));

          return (
            <Animated.View key={i} style={[styles.slide, animatedStyle]}>
              <Text style={styles.text}>{item}</Text>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
};

export default CarouselComponent;
