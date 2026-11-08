import { NativeTabs } from 'expo-router/native-tabs';

import { useThemeColors } from '@/theme';

export default function PacienteTabsLayout() {
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
      <NativeTabs.Trigger name="calendario">
        <NativeTabs.Trigger.Label>Calendario</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="calendar_today" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="actividades">
        <NativeTabs.Trigger.Label>Actividades</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="checklist" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="progreso">
        <NativeTabs.Trigger.Label>Progreso</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="monitoring" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="apoyo">
        <NativeTabs.Trigger.Label>Apoyo</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="diversity_1" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
