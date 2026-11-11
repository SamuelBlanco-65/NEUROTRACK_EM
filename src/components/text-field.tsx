import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState, type ComponentRef, type Ref } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { MinTouchSize, Radius, Spacing, useThemeColors } from '@/theme';

/** Instancia del `TextInput` de un `TextField` (para `useRef` y `.focus()`). */
export type TextFieldInput = ComponentRef<typeof TextInput>;

type TextFieldProps = Pick<
  TextInputProps,
  'value' | 'onChangeText' | 'placeholder' | 'keyboardType' | 'autoComplete' | 'textContentType'
> & {
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  secureEntry?: boolean;
  errorText?: string;
  testID?: string;
  /** Para mover el foco (y con él el lector de pantalla) al primer campo inválido. */
  inputRef?: Ref<TextFieldInput>;
};

/** Campo de texto con icono, estado de error doble-codificado (RNF-006) y alternar contraseña. */
export function TextField({
  label,
  icon,
  secureEntry,
  errorText,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoComplete,
  textContentType,
  testID,
  inputRef,
}: TextFieldProps) {
  const colors = useThemeColors();
  const [hidden, setHidden] = useState(secureEntry);
  const hasError = Boolean(errorText);

  return (
    <View style={styles.container}>
      <ThemedText variant="labelMd" style={styles.label}>
        {label}
      </ThemedText>
      <View
        style={[
          styles.fieldRow,
          {
            backgroundColor: colors.surfaceContainerLowest,
            borderColor: hasError ? colors.tertiary : 'transparent',
          },
        ]}>
        <MaterialIcons name={icon} size={22} color={hasError ? colors.tertiary : colors.outline} />
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.outline}
          secureTextEntry={hidden}
          keyboardType={keyboardType}
          autoComplete={autoComplete}
          textContentType={textContentType}
          autoCapitalize="none"
          autoCorrect={false}
          style={[styles.input, { color: colors.onSurface }]}
          accessibilityLabel={label}
          accessibilityHint={hasError ? errorText : undefined}
          testID={testID}
        />
        {secureEntry ? (
          <Pressable
            onPress={() => setHidden((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Mostrar contraseña' : 'Ocultar contraseña'}
            hitSlop={8}
            style={styles.toggle}>
            <MaterialIcons name={hidden ? 'visibility' : 'visibility-off'} size={22} color={colors.outline} />
          </Pressable>
        ) : null}
      </View>
      {hasError ? (
        <View
          style={[styles.errorBanner, { backgroundColor: colors.tertiaryFixed }]}
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive">
          <MaterialIcons name="error" size={20} color={colors.onTertiaryFixed} />
          <ThemedText variant="labelMd" colorRole="onTertiaryFixed" style={styles.errorText}>
            {errorText}
          </ThemedText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  label: {
    marginLeft: 2,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: MinTouchSize + 8,
    borderRadius: Radius.default,
    borderWidth: 2,
    paddingHorizontal: Spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.sm,
  },
  toggle: {
    minWidth: MinTouchSize,
    minHeight: MinTouchSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.default / 2,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  errorText: {
    flexShrink: 1,
  },
});
