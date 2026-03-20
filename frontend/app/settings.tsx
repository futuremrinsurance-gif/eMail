import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEmailStore, colorThemes, ColorTheme } from '../src/store/emailStore';

export default function SettingsScreen() {
  const router = useRouter();
  const { getCurrentTheme, setTheme, currentThemeId } = useEmailStore();
  const systemColorScheme = useColorScheme();
  const theme = getCurrentTheme();
  const [showDark, setShowDark] = useState(theme.isDark);

  const styles = createStyles(theme);

  const lightThemes = colorThemes.filter((t) => !t.isDark);
  const darkThemes = colorThemes.filter((t) => t.isDark);
  const displayedThemes = showDark ? darkThemes : lightThemes;

  const renderThemeItem = ({ item }: { item: ColorTheme }) => {
    const isSelected = currentThemeId === item.id;
    return (
      <TouchableOpacity
        style={[
          styles.themeItem,
          isSelected && { borderColor: item.primary, borderWidth: 3 },
        ]}
        onPress={() => setTheme(item.id)}
      >
        <View style={[styles.themePreview, { backgroundColor: item.background }]}>
          <View style={[styles.themeHeader, { backgroundColor: item.surface }]}>
            <View style={[styles.themeCircle, { backgroundColor: item.primary }]} />
            <View style={[styles.themeLine, { backgroundColor: item.text, opacity: 0.3 }]} />
          </View>
          <View style={styles.themeBody}>
            <View style={[styles.themeRow, { backgroundColor: item.surface }]}>
              <View style={[styles.themeSmallCircle, { backgroundColor: item.primary }]} />
              <View style={{ flex: 1 }}>
                <View style={[styles.themeSmallLine, { backgroundColor: item.text, opacity: 0.6 }]} />
                <View style={[styles.themeSmallLine, { backgroundColor: item.textSecondary, width: '60%' }]} />
              </View>
            </View>
            <View style={[styles.themeRow, { backgroundColor: item.surface }]}>
              <View style={[styles.themeSmallCircle, { backgroundColor: item.accent }]} />
              <View style={{ flex: 1 }}>
                <View style={[styles.themeSmallLine, { backgroundColor: item.text, opacity: 0.6 }]} />
                <View style={[styles.themeSmallLine, { backgroundColor: item.textSecondary, width: '70%' }]} />
              </View>
            </View>
          </View>
        </View>
        <Text style={[styles.themeName, isSelected && { color: item.primary, fontWeight: '700' }]}>
          {item.name}
        </Text>
        {isSelected && (
          <View style={[styles.checkmark, { backgroundColor: item.primary }]}>
            <Ionicons name="checkmark" size={14} color="#fff" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color={theme.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Theme Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>APPEARANCE</Text>
          
          {/* Light/Dark Toggle */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                !showDark && styles.toggleBtnActive,
              ]}
              onPress={() => setShowDark(false)}
            >
              <Ionicons
                name="sunny"
                size={18}
                color={!showDark ? '#fff' : theme.textSecondary}
              />
              <Text
                style={[
                  styles.toggleText,
                  !showDark && styles.toggleTextActive,
                ]}
              >
                Light
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                showDark && styles.toggleBtnActive,
              ]}
              onPress={() => setShowDark(true)}
            >
              <Ionicons
                name="moon"
                size={18}
                color={showDark ? '#fff' : theme.textSecondary}
              />
              <Text
                style={[
                  styles.toggleText,
                  showDark && styles.toggleTextActive,
                ]}
              >
                Dark
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.themeCount}>
            {displayedThemes.length} {showDark ? 'dark' : 'light'} themes available
          </Text>
        </View>

        {/* Theme Grid */}
        <FlatList
          data={displayedThemes}
          renderItem={renderThemeItem}
          keyExtractor={(item) => item.id}
          numColumns={3}
          scrollEnabled={false}
          contentContainerStyle={styles.themeGrid}
          columnWrapperStyle={styles.themeRow2}
        />

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ABOUT</Text>
          <View style={styles.aboutCard}>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>Version</Text>
              <Text style={styles.aboutValue}>1.0.0</Text>
            </View>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>Total Themes</Text>
              <Text style={styles.aboutValue}>50</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  backBtn: {
    padding: 4,
    width: 44,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text,
  },
  placeholder: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.textSecondary,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: theme.border,
    borderRadius: 12,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  toggleBtnActive: {
    backgroundColor: theme.primary,
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  toggleTextActive: {
    color: '#fff',
  },
  themeCount: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 12,
    textAlign: 'center',
  },
  themeGrid: {
    paddingHorizontal: 12,
    paddingTop: 16,
  },
  themeRow2: {
    justifyContent: 'flex-start',
    gap: 8,
    marginBottom: 12,
  },
  themeItem: {
    width: '31%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  themePreview: {
    height: 80,
    padding: 6,
  },
  themeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    borderRadius: 4,
    marginBottom: 4,
  },
  themeCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  themeLine: {
    height: 6,
    flex: 1,
    borderRadius: 3,
  },
  themeBody: {
    flex: 1,
    gap: 3,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    borderRadius: 4,
    gap: 6,
  },
  themeSmallCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  themeSmallLine: {
    height: 4,
    borderRadius: 2,
    marginBottom: 2,
  },
  themeName: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.text,
    textAlign: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  checkmark: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aboutCard: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  aboutLabel: {
    fontSize: 16,
    color: theme.text,
  },
  aboutValue: {
    fontSize: 16,
    color: theme.textSecondary,
  },
});
