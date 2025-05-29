import { Dimensions, Platform, ScaledSize } from "react-native";
import React, { createContext, useContext, useState, useEffect } from "react";

interface LayoutProviderProps {
  children: any;
}

/**
 * Context providing layout and device information for responsive design.
 *
 * @property {boolean} isTablet - Indicates if the device is a tablet.
 * @property {boolean} isLargeTablet - Indicates if the device is a large tablet.
 * @property {boolean} isPhone - Indicates if the device is a phone.
 * @property {boolean} isWeb - Indicates if the device is a web browser.
 * @property {number} width - The current width of the viewport.
 * @property {number} height - The current height of the viewport.
 * @property {boolean} isLandscape - Indicates if the device is in landscape orientation.
 * @property {boolean} isPortrait - Indicates if the device is in portrait orientation.
 * @property {boolean} isPhonePortrait - Indicates if the device is a phone in portrait orientation.
 * @property {boolean} isPhoneLandscape - Indicates if the device is a phone in landscape orientation.
 * @property {boolean} isTabletPortrait - Indicates if the device is a tablet in portrait orientation.
 * @property {boolean} isTabletLandscape - Indicates if the device is a tablet in landscape orientation.
 */
const LayoutContext = createContext({
  isTablet: false,
  isLargeTablet: false,
  isPhone: false,
  isWeb: false,
  width: 0,
  height: 0,
  isLandscape: false,
  isPortrait: false,
  isPhonePortrait: false,
  isPhoneLandscape: false,
  isTabletPortrait: false,
  isTabletLandscape: false,
});

/**
 * Provides layout-related context values to its children, such as device type (phone, tablet, web),
 * orientation (portrait, landscape), and screen dimensions.
 *
 * This provider listens for window dimension changes and updates the context accordingly.
 * It distinguishes between web, phone, tablet, and large tablet devices, and provides
 * additional booleans for orientation-specific states (e.g., isPhonePortrait).
 *
 * @param {LayoutProviderProps} props - The props for the provider, including children components.
 * @returns {JSX.Element} The provider wrapping its children with layout context values.
 */
export const LayoutProvider: React.FC<LayoutProviderProps> = ({ children }) => {
  const [dimensions, setDimensions] = useState(Dimensions.get("window"));

  useEffect(() => {
    const onChange = ({ window }: { window: ScaledSize }) => {
      setDimensions(window);
    };
    const subscription = Dimensions.addEventListener("change", onChange);

    return () => subscription?.remove();
  }, []);

  const { width, height } = dimensions;
  const isPlatformWeb = Platform.OS === "web";

  const isPortrait = height >= width;
  const isLandscape = width > height;
  const isWeb = isPlatformWeb && width > 768;
  const isPhone = !isPlatformWeb && Math.min(width, height) <= 768;
  const isTablet =
    !isPlatformWeb && !isPhone && Math.min(width, height) <= 1024;
  const isLargeTablet =
    !isPlatformWeb &&
    Math.min(width, height) > 1024 &&
    Math.max(width, height) <= 2048;
  const isPhonePortrait = isPhone && isPortrait;
  const isPhoneLandscape = isPhone && isLandscape;
  const isTabletPortrait = isTablet && isPortrait;
  const isTabletLandscape = isTablet && isLandscape;

  const layoutData = {
    isTablet,
    isLargeTablet,
    isPhone,
    isWeb,
    width,
    height,
    isLandscape,
    isPortrait,
    isPhonePortrait,
    isPhoneLandscape,
    isTabletPortrait,
    isTabletLandscape,
  };

  return (
    <LayoutContext.Provider value={layoutData}>
      {children}
    </LayoutContext.Provider>
  );
};

/**
 * Custom hook to access the layout context values.
 *
 * @returns {LayoutContextProps} The layout context values.
 *
 * @throws {Error} If used outside of a LayoutProvider.
 */
export const useResponsiveLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error(
      "useResponsiveLayout debe ser usado dentro de un LayoutProvider"
    );
  }
  return context;
};
