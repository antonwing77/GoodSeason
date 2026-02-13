import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../lib/theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.primary[700],
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 17,
          },
          headerShadowVisible: false,
          headerBackTitleVisible: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'SeasonScope',
            headerLargeTitle: true,
          }}
        />
        <Stack.Screen
          name="browse"
          options={{ title: 'Browse Foods' }}
        />
        <Stack.Screen
          name="food/[id]"
          options={{ title: 'Food Detail' }}
        />
        <Stack.Screen
          name="compare"
          options={{ title: 'Compare' }}
        />
        <Stack.Screen
          name="data-sources"
          options={{ title: 'Data Sources' }}
        />
      </Stack>
    </>
  );
}
