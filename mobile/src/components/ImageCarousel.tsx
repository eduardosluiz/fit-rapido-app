import React, { useState, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Modal,
  Text,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAROUSEL_HEIGHT = 300;

interface ImageCarouselProps {
  images: string[];
  height?: number;
  showIndicators?: boolean;
  enableZoom?: boolean;
}

export default function ImageCarousel({
  images,
  height = CAROUSEL_HEIGHT,
  showIndicators = true,
  enableZoom = true,
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  if (!images || images.length === 0) {
    return null;
  }

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderItem = ({ item, index }: { item: string; index: number }) => (
    <TouchableOpacity
      activeOpacity={enableZoom ? 0.9 : 1}
      onPress={() => enableZoom && setZoomImage(item)}
      style={styles.imageWrapper}
    >
      <Image
        source={{ uri: item }}
        style={[styles.image, { height }]}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  const renderIndicator = (index: number) => (
    <View
      key={index}
      style={[
        styles.indicator,
        currentIndex === index && styles.indicatorActive,
      ]}
    />
  );

  return (
    <>
      <View style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={images}
          renderItem={renderItem}
          keyExtractor={(item, index) => `image-${index}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          getItemLayout={(data, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
        />
        {showIndicators && images.length > 1 && (
          <View style={styles.indicatorsContainer}>
            {images.map((_, index) => renderIndicator(index))}
          </View>
        )}
      </View>

      {/* Modal de Zoom */}
      <Modal
        visible={zoomImage !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setZoomImage(null)}
      >
        <View style={styles.zoomContainer}>
          <TouchableOpacity
            style={styles.zoomCloseButton}
            onPress={() => setZoomImage(null)}
          >
            <Text style={styles.zoomCloseText}>✕</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.zoomImageContainer}
            activeOpacity={1}
            onPress={() => setZoomImage(null)}
          >
            {zoomImage && (
              <Image
                source={{ uri: zoomImage }}
                style={styles.zoomImage}
                resizeMode="contain"
              />
            )}
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
  },
  imageWrapper: {
    width: SCREEN_WIDTH,
  },
  image: {
    width: SCREEN_WIDTH,
    backgroundColor: '#333',
  },
  indicatorsContainer: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  indicatorActive: {
    width: 20,
    backgroundColor: '#c8921a',
  },
  zoomContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomCloseText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  zoomImageContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 1.2,
  },
});

