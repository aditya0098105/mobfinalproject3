import React from "react";
import { View, StyleSheet } from "react-native";
import { Colors } from "../theme";

type Props = {
  size?: number;
  backgroundColor?: string;
  strokeColor?: string;
  accentColor?: string;
};

const BASE = 36;

export default function ItineraryIcon({
  size = 36,
  backgroundColor = "#F8FAFC",
  strokeColor = Colors.primary,
  accentColor = Colors.accent,
}: Props) {
  const scale = size / BASE;

  return (
    <View
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: 8 * scale,
          paddingHorizontal: 6 * scale,
          paddingVertical: 5 * scale,
          borderWidth: 2 * scale,
          borderColor: strokeColor,
          backgroundColor,
        },
      ]}
    >
      <View
        style={[
          styles.topStrip,
          {
            borderBottomColor: strokeColor,
            paddingBottom: 4 * scale,
            marginBottom: 6 * scale,
          },
        ]}
      >
        <View
          style={[
            styles.bindingDot,
            {
              width: 6 * scale,
              height: 6 * scale,
              borderRadius: 3 * scale,
              backgroundColor: strokeColor,
            },
          ]}
        />
        <View
          style={[
            styles.bindingDot,
            {
              width: 6 * scale,
              height: 6 * scale,
              borderRadius: 3 * scale,
              backgroundColor: strokeColor,
            },
          ]}
        />
      </View>

      {[0, 1, 2].map((item) => (
        <View
          key={item}
          style={[
            styles.row,
            {
              marginTop: item === 0 ? 0 : 4 * scale,
            },
          ]}
        >
          <View
            style={[
              styles.bullet,
              {
                width: 8 * scale,
                height: 8 * scale,
                borderRadius: 4 * scale,
                backgroundColor: item === 0 ? accentColor : strokeColor,
              },
            ]}
          />
          <View
            style={[
              styles.line,
              {
                height: 3 * scale,
                borderRadius: 2 * scale,
                backgroundColor: strokeColor,
              },
            ]}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    justifyContent: "flex-start",
  },
  topStrip: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  bindingDot: {},
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  bullet: {},
  line: {
    flex: 1,
  },
});
