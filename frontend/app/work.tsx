import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEmailStore, Email } from '../src/store/emailStore';

export default function WorkEmailScreen() {
  const router = useRouter();
  const {
    getWorkEmails,
    toggleEmailFlag,
    accounts,
    getCurrentTheme,
    appSettings,
    markAsRead,
  } = useEmailStore();

  const theme = getCurrentTheme();
  const workEmails = getWorkEmails();
  const workAccount = accounts.find(a => a.id === 'a3');
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);

  const styles = createStyles(theme);
  const unreadCount = workEmails.filter(e => !e.isRead).length;

  const handleComposeWithSubject = (subject: string) => {
    setShowSubjectPicker(false);
    router.push({
      pathname: '/compose',
      params: {
        accountId: 'a3',
        subject: subject,
      },
    });
  };

  const renderEmail = ({ item }: { item: Email }) => (
    <TouchableOpacity
      style={styles.emailItem}
      onPress={() => router.push(`/email/${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.emailContent}>
        <View style={styles.emailHeader}>
          <Text style={[styles.sender, !item.isRead && styles.unread]} numberOfLines={1}>
            {item.fromName}
          </Text>
          <View style={styles.dateRow}>
            {item.hasAttachments && (
              <Ionicons name="attach" size={14} color={theme.textSecondary} style={styles.attachIcon} />
            )}
            <Text style={styles.date}>{item.date}</Text>
          </View>
        </View>
        <View style={styles.subjectRow}>
          {!item.isRead && <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />}
          <Text style={[styles.subject, !item.isRead && styles.unread]} numberOfLines={1}>
            {item.subject}
          </Text>
        </View>
        <Text style={styles.snippet} numberOfLines={2}>
          {item.snippet}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.flagBtn}
        onPress={() => toggleEmailFlag(item.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons
          name={item.isFlagged ? 'flag' : 'flag-outline'}
          size={18}
          color={item.isFlagged ? '#FF9500' : theme.textSecondary}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <View style={[styles.accountDot, { backgroundColor: workAccount?.color || '#0078D4' }]} />
          </View>
          <Text style={styles.title}>Work</Text>
          <TouchableOpacity
            onPress={() => setShowSubjectPicker(true)}
            style={styles.composeBtn}
          >
            <Ionicons name="create-outline" size={24} color={theme.primary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.emailAddress}>{workAccount?.email}</Text>
      </View>

      {/* Quick Subject Picker Modal */}
      {showSubjectPicker && (
        <View style={styles.subjectPickerOverlay}>
          <View style={styles.subjectPicker}>
            <View style={styles.subjectPickerHeader}>
              <Text style={styles.subjectPickerTitle}>Quick Compose</Text>
              <TouchableOpacity onPress={() => setShowSubjectPicker(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            <Text style={styles.subjectPickerSubtitle}>Select a default subject or write custom</Text>
            
            {appSettings.workEmail.defaultSubjects.map((subject, index) => (
              <TouchableOpacity
                key={index}
                style={styles.subjectOption}
                onPress={() => handleComposeWithSubject(subject)}
              >
                <Ionicons name="document-text-outline" size={20} color={theme.primary} />
                <Text style={styles.subjectOptionText}>{subject}</Text>
                <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={[styles.subjectOption, styles.customOption]}
              onPress={() => handleComposeWithSubject('')}
            >
              <Ionicons name="create-outline" size={20} color={theme.primary} />
              <Text style={styles.subjectOptionText}>Custom subject...</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{workEmails.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.primary }]}>{unreadCount}</Text>
          <Text style={styles.statLabel}>Unread</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{workEmails.filter(e => e.isFlagged).length}</Text>
          <Text style={styles.statLabel}>Flagged</Text>
        </View>
      </View>

      {/* Email List */}
      <FlatList
        data={workEmails}
        renderItem={renderEmail}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="briefcase-outline" size={64} color={theme.textSecondary} />
            <Text style={styles.emptyText}>No work emails</Text>
            <Text style={styles.emptySubtext}>Your work inbox is empty</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    backgroundColor: theme.surface,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  headerLeft: {
    width: 40,
  },
  accountDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text,
  },
  composeBtn: {
    padding: 4,
  },
  emailAddress: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.text,
  },
  statLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.border,
  },
  subjectPickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  subjectPicker: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    padding: 20,
  },
  subjectPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectPickerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text,
  },
  subjectPickerSubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 16,
  },
  subjectOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    gap: 12,
  },
  customOption: {
    borderBottomWidth: 0,
    marginTop: 8,
  },
  subjectOptionText: {
    flex: 1,
    fontSize: 16,
    color: theme.text,
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  emailItem: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.surface,
  },
  emailContent: {
    flex: 1,
  },
  emailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sender: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    flex: 1,
  },
  unread: {
    fontWeight: '700',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attachIcon: {
    marginRight: 4,
  },
  date: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  subject: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.text,
    flex: 1,
  },
  snippet: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
  },
  flagBtn: {
    justifyContent: 'center',
    paddingLeft: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 15,
    color: theme.textSecondary,
    marginTop: 4,
  },
});
