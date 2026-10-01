/**
 * @format
 */

// react-native-gesture-handler must be the FIRST import
import 'react-native-gesture-handler';

import {AppRegistry} from 'react-native';
import {enableScreens} from 'react-native-screens';
import App from './App';
import {name as appName} from './app.json';

// Disable native screens to avoid NativeStackView initialization issues
enableScreens(false);

AppRegistry.registerComponent(appName, () => App);
