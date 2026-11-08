import { NativeTabs } from 'expo-router/native-tabs';

import { useThemeColors } from '@/theme';

export default function CuidadorTabsLayout() {
  const colors = useThemeColors();

  return (
    <NativeTabs
      backgroundColor={colors.surface}
      indicatorColor={colors.secondaryContainer}
      iconColor={{ default: colors.onSurfaceVariant, selected: colors.primary }}
      labelStyle={{
        default: { color: colors.onSurfaceVariant },
        selected: { color: colors.primary, fontWeight: 'bold' },
      }}>
      <NativeTabs.Trigger name="inicio">
        <NativeTabs.Trigger.Label>Inicio</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="home" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="acompanar">
        <NativeTabs.Trigger.Label>Acompañar</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="handshake" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="observaciones">
        <NativeTabs.Trigger.Label>Observaciones</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="visibility" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="recordatorios">
        <NativeTabs.Trigger.Label>Recordatorios</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="notifications" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="apoyo">
        <NativeTabs.Trigger.Label>Apoyo</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="volunteer_activism" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
