import React, { useState, useEffect, useRef } from 'react';
import { View, Dimensions, TouchableWithoutFeedback, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const SQUARE_SIZE = 50;

const getRandomColor = () => Math.floor(Math.random() * 16777215).toString(16);

const App = () => {
  const [isMoving, setIsMoving] = useState(true);
  const [speedFactor, setSpeedFactor] = useState(1);

  const translateX = useSharedValue(Math.random() * (width - SQUARE_SIZE));
  const translateY = useSharedValue(Math.random() * (height - SQUARE_SIZE));
  const bgColor = useSharedValue(getRandomColor());

  //set speed
  const velocityX = useSharedValue(2);  // Fixed initial speed in the X direction
  const velocityY = useSharedValue(3);  // Fixed initial speed in the Y direction

  const animationFrameId = useRef(null);

  const animate = () => {
    if (isMoving) {
      let hitBoundary = false;

      const nextX = translateX.value + velocityX.value * speedFactor;
      const nextY = translateY.value + velocityY.value * speedFactor;

      if (nextX + SQUARE_SIZE >= width || nextX <= 0) {
        velocityX.value *= -1;
        translateX.value = nextX <= 0 ? 0 : width - SQUARE_SIZE;
        hitBoundary = true;
      }

      if (nextY + SQUARE_SIZE >= height || nextY <= 0) {
        velocityY.value *= -1;
        translateY.value = nextY <= 0 ? 0 : height - SQUARE_SIZE;
        hitBoundary = true;
      }

      if (hitBoundary) {
        bgColor.value = getRandomColor();
      }

      translateX.value += velocityX.value * speedFactor;
      translateY.value += velocityY.value * speedFactor;

      animationFrameId.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    if (isMoving) {
      animationFrameId.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(animationFrameId.current);
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isMoving, speedFactor]);


  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: `#${bgColor.value}`,
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
  });

  const lastTapRef = useRef(null);
  const singleTapTimerRef = useRef(null);

  const handleTap = () => {
    console.log('handleTap');
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 200;

    if (lastTapRef.current && (now - lastTapRef.current) < DOUBLE_PRESS_DELAY) {
      // Double tap detected
      console.log('double tap', speedFactor);
      clearTimeout(singleTapTimerRef.current); // Cancel the single tap timer
      if (speedFactor > 0) {
        setSpeedFactor(speedFactor - 1);
      }
    } else {
      console.log('single tap', speedFactor);
      // Set up a timer for single tap
      singleTapTimerRef.current = setTimeout(() => {
        setIsMoving(!isMoving);
      }, DOUBLE_PRESS_DELAY);
    }

    lastTapRef.current = now;
  };


  return (
    <View style={{ flex: 1 }}>
      <TouchableWithoutFeedback
        onLongPress={() => {
          console.log('onLongPress', speedFactor);
          if (speedFactor < 5) {
            setSpeedFactor(speedFactor + 1);
          }
        }}
        onPress={handleTap}
        delayLongPress={500}
      >
        <View style={{ flex: 1 }} />
      </TouchableWithoutFeedback>

      <TouchableWithoutFeedback onPress={handleTap}>
        <Animated.View
          style={[
            { width: SQUARE_SIZE, height: SQUARE_SIZE, position: 'absolute' },
            animatedStyle,
          ]}
        />
      </TouchableWithoutFeedback>

      <Text style={{ position: 'absolute', bottom: 10, alignSelf: 'center', fontSize: 20 }}>
        Current Speed (0-5): {speedFactor} 
      </Text>
    </View>
  );
};

export default App;
