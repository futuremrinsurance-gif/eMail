import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEmailStore, colorThemes, ColorTheme } from '../src/store/emailStore';

interface CollapsibleSectionProps {
  title: string;
  sectionId: string;
  children: React.ReactNode;
  theme: any;
}

function CollapsibleSection({ title, sectionId, children, theme }: CollapsibleSectionProps) {
  const { appSettings, toggleSection } = useEmailStore();
  const isExpanded = appSettings.expandedSections.includes(sectionId);

  return (
    <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => toggleSection(sectionId)}
      >
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={theme.textSecondary}
        />
      </TouchableOpacity>
      {isExpanded && <View style={styles.sectionContent}>{children}</View>}
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const {
    getCurrentTheme,
    setTheme,
    currentThemeId,
    appSettings,
    addDefaultSubject,
    removeDefaultSubject,
    updateWorkEmailSettings,
  } = useEmailStore();

  const theme = getCurrentTheme();
  const [showDark, setShowDark] = useState(theme.isDark);
  const [newSubject, setNewSubject] = useState('');

  const lightThemes = colorThemes.filter((t) => !t.isDark);
  const darkThemes = colorThemes.filter((t) => t.isDark);
  const displayedThemes = showDark ? darkThemes : lightThemes;

  const handleAddSubject = () => {
    if (newSubject.trim()) {
      addDefaultSubject(newSubject.trim());
      setNewSubject('');
    }
  };

  const handleRemoveSubject = (index: number) => {
    Alert.alert('Remove Subject', 'Are you sure you want to remove this default subject?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeDefaultSubject(index) },
    ]);
  };

  const renderThemeItem = ({ item }: { item: ColorTheme }) => {
    const isSelected = currentThemeId === item.id;
    return (
      <TouchableOpacity
        style={[
          createStyles(theme).themeItem,
          isSelected && { borderColor: item.primary, borderWidth: 3 },
        ]}
        onPress={() => setTheme(item.id)}
      >
        <View style={[createStyles(theme).themePreview, { backgroundColor: item.background }]}>
          <View style={[createStyles(theme).themeHeader, { backgroundColor: item.surface }]}>
            <View style={[createStyles(theme).themeCircle, { backgroundColor: item.primary }]} />
            <View style={[createStyles(theme).themeLine, { backgroundColor: item.text, opacity: 0.3 }]} />
          </View>
          <View style={createStyles(theme).themeBody}>
            <View style={[createStyles(theme).themeRow, { backgroundColor: item.surface }]}>
              <View style={[createStyles(theme).themeSmallCircle, { backgroundColor: item.primary }]} />
              <View style={{ flex: 1 }}>
                <View style={[createStyles(theme).themeSmallLine, { backgroundColor: item.text, opacity: 0.6 }]} />
                <View style={[createStyles(theme).themeSmallLine, { backgroundColor: item.textSecondary, width: '60%' }]} />
              </View>
            </View>
          </View>
        </View>
        <Text style={[createStyles(theme).themeName, isSelected && { color: item.primary, fontWeight: '700' }]}>
          {item.name}
        </Text>
        {isSelected && (
          <View style={[createStyles(theme).checkmark, { backgroundColor: item.primary }]}>
            <Ionicons name="checkmark" size={14} color="#fff" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const dynamicStyles = createStyles(theme);

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity onPress={() => router.back()} style={dynamicStyles.backBtn}>
          <Ionicons name="chevron-back" size={28} color={theme.primary} />
        </TouchableOpacity>
        <Text style={dynamicStyles.title}>Settings</Text>
        <View style={dynamicStyles.placeholder} />
      </View>

      <ScrollView style={dynamicStyles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Appearance Section */}
        <CollapsibleSection title="Appearance" sectionId="appearance" theme={theme}>
          {/* Light/Dark Toggle */}
          <View style={dynamicStyles.toggleContainer}>
            <TouchableOpacity
              style={[
                dynamicStyles.toggleBtn,
                !showDark && dynamicStyles.toggleBtnActive,
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
                  dynamicStyles.toggleText,
                  !showDark && dynamicStyles.toggleTextActive,
                ]}
              >
                Light
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                dynamicStyles.toggleBtn,
                showDark && dynamicStyles.toggleBtnActive,
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
                  dynamicStyles.toggleText,
                  showDark && dynamicStyles.toggleTextActive,
                ]}
              >
                Dark
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={dynamicStyles.themeCount}>
            {displayedThemes.length} {showDark ? 'dark' : 'light'} themes
          </Text>

          {/* Theme Grid */}
          <FlatList
            data={displayedThemes}
            renderItem={renderThemeItem}
            keyExtractor={(item) => item.id}
            numColumns={3}
            scrollEnabled={false}
            contentContainerStyle={dynamicStyles.themeGrid}
            columnWrapperStyle={dynamicStyles.themeRow2}
          />
        </CollapsibleSection>

        {/* Work Email Settings */}
        <CollapsibleSection title="Work Email" sectionId="workEmail" theme={theme}>
          <Text style={dynamicStyles.settingLabel}>Default Subject Lines</Text>
          <Text style={dynamicStyles.settingHint}>
            Quick compose options for work emails
          </Text>
          
          {appSettings.workEmail.defaultSubjects.map((subject, index) => (
            <View key={index} style={dynamicStyles.subjectItem}>
              <Text style={dynamicStyles.subjectText}>{subject}</Text>
              <TouchableOpacity onPress={() => handleRemoveSubject(index)}>
                <Ionicons name="close-circle" size={22} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          ))}
          
          <View style={dynamicStyles.addSubjectRow}>
            <TextInput
              style={dynamicStyles.addSubjectInput}
              value={newSubject}
              onChangeText={setNewSubject}
              placeholder="Add new subject..."
              placeholderTextColor={theme.textSecondary}
              onSubmitEditing={handleAddSubject}
            />
            <TouchableOpacity
              style={[dynamicStyles.addBtn, { backgroundColor: theme.primary }]}
              onPress={handleAddSubject}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </CollapsibleSection>

        {/* Signature Settings */}
        <CollapsibleSection title="Email Signature" sectionId="signature" theme={theme}>
          <TextInput
            style={dynamicStyles.signatureInput}
            value={appSettings.workEmail.signature}
            onChangeText={(text) => updateWorkEmailSettings({ signature: text })}
            placeholder="Your signature..."
            placeholderTextColor={theme.textSecondary}
            multiline
            numberOfLines={4}
          />
        </CollapsibleSection>

        {/* About Section */}
        <CollapsibleSection title="About" sectionId="about" theme={theme}>
          <View style={dynamicStyles.aboutRow}>
            <Text style={dynamicStyles.aboutLabel}>Version</Text>
            <Text style={dynamicStyles.aboutValue}>1.0.0</Text>
          </View>
          <View style={dynamicStyles.aboutRow}>
            <Text style={dynamicStyles.aboutLabel}>Total Themes</Text>
            <Text style={dynamicStyles.aboutValue}>50</Text>
          </View>
          <View style={dynamicStyles.aboutRow}>
            <Text style={dynamicStyles.aboutLabel}>Auto-save</Text>
            <Text style={[dynamicStyles.aboutValue, { color: '#34C759' }]}>Enabled</Text>
          </View>
        </CollapsibleSection>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  section: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  sectionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});

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
    marginBottom: 8,
    textAlign: 'center',
  },
  themeGrid: {
    paddingTop: 8,
  },
  themeRow2: {
    justifyContent: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  themeItem: {
    width: '31%',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border,
  },
  themePreview: {
    height: 60,
    padding: 4,
  },
  themeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 3,
    borderRadius: 3,
    marginBottom: 3,
  },
  themeCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  themeLine: {
    height: 4,
    flex: 1,
    borderRadius: 2,
  },
  themeBody: {
    flex: 1,
    gap: 2,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 3,
    borderRadius: 3,
    gap: 4,
  },
  themeSmallCircle: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  themeSmallLine: {
    height: 3,
    borderRadius: 1.5,
    marginBottom: 1,
  },
  themeName: {
    fontSize: 10,
    fontWeight: '500',
    color: theme.text,
    textAlign: 'center',
    paddingVertical: 4,
  },
  checkmark: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  settingHint: {
    fontSize: 13,
    color: theme.textSecondary,
    marginBottom: 12,
  },
  subjectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  subjectText: {
    fontSize: 15,
    color: theme.text,
    flex: 1,
  },
  addSubjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  addSubjectInput: {
    flex: 1,
    backgroundColor: theme.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: theme.text,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signatureInput: {
    backgroundColor: theme.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: theme.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  aboutLabel: {
    fontSize: 15,
    color: theme.text,
  },
  aboutValue: {
    fontSize: 15,
    color: theme.textSecondary,
  },
});
