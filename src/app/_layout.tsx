import {
  AtkinsonHyperlegibleNext_400Regular,
  AtkinsonHyperlegibleNext_700Bold,
  useFonts,
} from '@expo-google-fonts/atkinson-hyperlegible-next';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Provider as StoreProvider } from 'react-redux';

import { applyBrightness } from '@/features/settings/brightness';
import { supabase } from '@/lib/supabase';
import { resetAll } from '@/store/actions';
import { bootstrapSession, sessionEnded } from '@/store/slices/auth-slice';
import { hydrateSettings } from '@/store/slices/settings-slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { store } from '@/store/store';

SplashScreen.preventAutoHideAsync();

function AppShell() {
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector((state) => state.auth.status);
  const settingsStatus = useAppSelector((state) => state.settings._hydrated);
  const brightness = useAppSelector((state) => state.settings.brightness);
  const [fontsLoaded] = useFonts({
    AtkinsonHyperlegibleNext_400Regular,
    AtkinsonHyperlegibleNext_700Bold,
  });
  const ready = fontsLoaded && authStatus !== 'bootstrapping' && settingsStatus;

  useEffect(() => {
    dispatch(bootstrapSession());
    dispatch(hydrateSettings());

    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        dispatch(sessionEnded());
        dispatch(resetAll());
      }
    });

    return () => subscription.subscription.unsubscribe();
  }, [dispatch]);

  useEffect(() => {
    if (ready) {
      SplashScreen.hide();
    }
  }, [ready]);

  // Brillo propio de la app: se aplica al abrir (ya hidratada la preferencia) y cada vez que cambia.
  useEffect(() => {
    if (settingsStatus) applyBrightness(brightness);
  }, [settingsStatus, brightness]);

  if (!ready) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <StoreProvider store={store}>
      <AppShell />
    </StoreProvider>
  );
}
