import { LogBox } from "react-native";

if (__DEV__) {
  const ignoreWarns = [
    "ViewPropTypes will be removed from React Native",
    "ColorPropType will be removed from React Native",
    "EdgeInsetsPropType will be removed from React Native",
    "PointPropType will be removed from React Native",
    "TextPropTypes will be removed from React Native",
    "AsyncStorage has been extracted from react-native",
    "EventEmitter.removeListener",
    "If you want to use Reanimated 2",
    "Setting a timer",
    "VirtualizedLists should never be nested",
    "text strings must be rendered within a <Text> component",
    "Text strings must be rendered within a <Text> component",
  ];

  const warn = console.warn;
  console.warn = (...arg) => {
    for (const warning of ignoreWarns) {
      if (arg[0] && typeof arg[0] === 'string' && arg[0].includes(warning)) {
        return;
      }
    }
    warn(...arg);
  };

  LogBox.ignoreLogs(ignoreWarns);
}