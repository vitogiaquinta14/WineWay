import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui/app-text";
import { Spacing } from "@/constants/theme";

type AuthHeaderProps = {
  title: string;
  subtitle: string;
};

/** Logo de WineWay + título y subtítulo de las pantallas de acceso. */
export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.brand}>
        <Image
          source={require("../../../assets/images/wineway-wordmark.png")}
          style={styles.wordmark}
          contentFit="contain"
          accessibilityLabel="WineWay"
        />
        <AppText
          variant="subtitle"
          color="malbec"
          align="center"
          style={styles.tagline}
        >
          De bodega en bodega, coleccionando recuerdos.
        </AppText>
      </View>

      <View style={styles.texts}>
        <AppText variant="display" align="center">
          {title}
        </AppText>
        <AppText variant="body" color="textMuted" align="center">
          {subtitle}
        </AppText>
      </View>
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
