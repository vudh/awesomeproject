/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */
<script src="http://localhost:8097"></script>
import React, {Component} from 'react';
import {
  createStackNavigator,
  createAppContainer
} from 'react-navigation';
import SearchPage from './SearchPage';
import SearchResults from './SearchResults';
import CameraScreen from './CameraScreen';
import QrScanner from './QrScanner';
//import NotificationHelper from './NotificationHelper';

//const NotifHelper = new NotificationHelper();

const NavStack = createStackNavigator({
  Home: { screen: SearchPage },
  Results: { screen: SearchResults },
  CameraScreen: { screen: CameraScreen },
  QrScanner: { screen: QrScanner },
});
export default createAppContainer(NavStack);