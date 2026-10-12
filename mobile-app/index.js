import { registerRootComponent } from 'expo';
import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It ensures that whether you run in Expo Go, development build, or production APK,
// the root component is properly registered and rendered.
registerRootComponent(App);
