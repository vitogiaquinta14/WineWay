import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui/app-text";
import { Fonts, Spacing } from "@/constants/theme";

type AuthHeaderProps = {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  showTagline?: boolean;
};

/** Logo de WineWay + título y subtítulo de las pantallas de acceso. */
export function AuthHeader({
  title,
  subtitle,
  eyebrow,
  showTagline = true,
}: AuthHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.brand}>
        {eyebrow && (
          <AppText
            variant="bodyBold"
            color="malbec"
            align="center"
            style={styles.eyebrow}
          >
            {eyebrow}
          </AppText>
        )}
        <Image
          source={require("../../../assets/images/wineway-wordmark.png")}
          style={styles.wordmark}
          contentFit="contain"
          accessibilityLabel="WineWay"
        />
        {showTagline && (
          <AppText
            variant="subtitle"
            color="malbec"
            align="center"
            style={styles.tagline}
          >
            De bodega en bodega, coleccionando recuerdos.
          </AppText>
        )}
      </View>

      {(title || subtitle) && (
        <View style={styles.texts}>
          {title && (
            <AppText variant="display" align="center">
              {title}
            </AppText>
          )}
          {subtitle && (
            <AppText variant="body" color="textMuted" align="center">
              {subtitle}
            </AppText>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: Spacing.xl + Spacing.xs,
  },
  brand: {
    alignItems: "center",
    gap: 0,
  },
  eyebrow: {
    fontFamily: Fonts.semiBold,
    marginBottom: Spacing.sm,
  },
  wordmark: {
    width: 256,
    height: 102,
  },
  tagline: {
    maxWidth: 320,
    transform: [{ translateY: -12 }],
  },
  texts: {
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
});
