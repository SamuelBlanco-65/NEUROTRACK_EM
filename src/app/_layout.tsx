import {
  AtkinsonHyperlegibleNext_400Regular,
  AtkinsonHyperlegibleNext_700Bold,
  useFonts,
} from '@expo-google-fonts/atkinson-hyperlegible-next';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Provider as StoreProvider } from 'react-redux';

import { supabase } from '@/lib/supabase';
import { bootstrapSession, sessionEnded } from '@/store/slices/auth-slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { store } from '@/store/store';

SplashScreen.preventAutoHideAsync();

function AppShell() {
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector((state) => state.auth.status);
  const [fontsLoaded] = useFonts({
    AtkinsonHyperlegibleNext_400Regular,
    AtkinsonHyperlegibleNext_700Bold,
  });
  const ready = fontsLoaded && authStatus !== 'bootstrapping';

  useEffect(() => {
    dispatch(bootstrapSession());

    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        dispatch(sessionEnded());
      }
    });

    return () => subscription.subscription.unsubscribe();
  }, [dispatch]);

  useEffect(() => {
    if (ready) {
      SplashScreen.hide();
    }
  }, [ready]);

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
