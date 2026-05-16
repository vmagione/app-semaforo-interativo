import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useKeepAwake } from 'expo-keep-awake';
import * as NavigationBar from 'expo-navigation-bar';
import { AppProvider, useApp } from './src/context/AppContext';
import MainScreen from './src/screens/MainScreen';
import SettingsScreen from './src/screens/SettingsScreen';

function Root() {
  useKeepAwake();
  const { currentScreen } = useApp();

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync('hidden');
    }
  }, []);

  return currentScreen === 'main' ? <MainScreen /> : <SettingsScreen />;
}

export default function App() {
  return (
    <AppProvider>
      <StatusBar hidden />
      <Root />
    </AppProvider>
  );
}
