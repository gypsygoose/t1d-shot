import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MainScreen } from './src/screens/MainScreen';
import { ThemeProvider } from './src/theme/ThemeContext';

export function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <StatusBar style="dark" />
        <MainScreen />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
