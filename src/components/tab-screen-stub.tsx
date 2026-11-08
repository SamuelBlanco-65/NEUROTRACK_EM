import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenState } from '@/components/screen-state';
import { ThemedView } from '@/components/themed-view';

type TabScreenStubProps = {
  title: string;
  description: string;
  testID: string;
};

/** Pantalla placeholder con estado vacío, pendiente de contenido real (T1-T5). */
export function TabScreenStub({ title, description, testID }: TabScreenStubProps) {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScreenState kind="vacio" title={title} description={description} testID={testID} />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
});
