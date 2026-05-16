import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useKeepAwake } from 'expo-keep-awake';
import { AppProvider, useApp } from './src/context/AppContext';
import MainScreen from './src/screens/MainScreen';
import SettingsScreen from './src/screens/SettingsScreen';

function Root() {
  useKeepAwake();
  const { currentScreen } = useApp();
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
