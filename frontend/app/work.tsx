import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEmailStore, Email } from '../src/store/emailStore';
import SwipeableEmailItem from '../src/components/SwipeableEmailItem';

export default function WorkEmailScreen() {
  const router = useRouter();
  const {
    getWorkEmails,
    toggleEmailFlag,
    accounts,
    getCurrentTheme,
    appSettings,
    toggleEmailRead,
    deleteEmail,
    archiveEmail,
    emails,
  } = useEmailStore();

  const theme = getCurrentTheme();
  const workEmails = getWorkEmails();
  const workAccount = accounts.find(a => a.id === 'a3');
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  
  // Selection state
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const styles = createStyles(theme);
  const unreadCount = workEmails.filter(e => !e.isRead).length;
  
  const allSelected = workEmails.length > 0 && selectedIds.length === workEmails.length;
  const someSelected = selectedIds.length > 0;
  const hasUnreadSelected = workEmails.some(
    (e) => selectedIds.includes(e.id) && !e.isRead
  );

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

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      setSelectedIds([]);
    }
  };

  const toggleEmailSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(eid => eid !== id)
        : [...prev, id]
    );
  };

  const selectAllEmails = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(workEmails.map(e => e.id));
    }
  };

  const markSelectedAsRead = () => {
    selectedIds.forEach(id => {
      const email = emails.find(e => e.id === id);
      if (email && !email.isRead) {
        toggleEmailRead(id);
      }
    });
    setSelectedIds([]);
    setIsSelectionMode(false);
  };

  const markSelectedAsUnread = () => {
    selectedIds.forEach(id => {
      const email = emails.find(e => e.id === id);
      if (email && email.isRead) {
        toggleEmailRead(id);
      }
    });
    setSelectedIds([]);
    setIsSelectionMode(false);
  };

  const deleteSelectedEmails = () => {
    selectedIds.forEach(id => {
      deleteEmail(id);
    });
    setSelectedIds([]);
    setIsSelectionMode(false);
  };

  const archiveSelectedEmails = () => {
    selectedIds.forEach(id => {
      archiveEmail(id);
    });
    setSelectedIds([]);
    setIsSelectionMode(false);
  };

  const flagSelectedEmails = () => {
    selectedIds.forEach(id => {
      const email = emails.find(e => e.id === id);
      if (email && !email.isFlagged) {
        toggleEmailFlag(id);
      }
    });
    setSelectedIds([]);
    setIsSelectionMode(false);
  };

  const handleEmailPress = (item: Email) => {
    if (isSelectionMode) {
      toggleEmailSelection(item.id);
    } else {
      router.push(`/email/${item.id}`);
    }
  };

  const handleEmailLongPress = (item: Email) => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      toggleEmailSelection(item.id);
    }
  };

  const renderEmail = ({ item }: { item: Email }) => (
    <SwipeableEmailItem
      item={item}
      theme={theme}
      isSelected={selectedIds.includes(item.id)}
      isSelectionMode={isSelectionMode}
      accountColor={workAccount?.color || '#0078D4'}
      onPress={() => handleEmailPress(item)}
      onLongPress={() => handleEmailLongPress(item)}
      onToggleSelection={() => toggleEmailSelection(item.id)}
      onToggleFlag={() => toggleEmailFlag(item.id)}
      onDelete={() => deleteEmail(item.id)}
      onArchive={() => archiveEmail(item.id)}
      onToggleRead={() => toggleEmailRead(item.id)}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        {isSelectionMode ? (
          <View style={styles.selectionHeader}>
            <TouchableOpacity onPress={toggleSelectionMode} style={styles.cancelBtn}>
              <Text style={[styles.linkText, { color: theme.primary }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.selectionCount}>
              {selectedIds.length} selected
            </Text>
            <TouchableOpacity onPress={selectAllEmails} style={styles.selectAllBtn}>
              <Ionicons
                name={allSelected ? 'checkbox' : 'square-outline'}
                size={22}
                color={theme.primary}
              />
              <Text style={[styles.selectAllText, { color: theme.primary }]}>
                {allSelected ? 'Deselect' : 'All'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <View style={[styles.accountDot, { backgroundColor: workAccount?.color || '#0078D4' }]} />
            </View>
            <Text style={styles.title}>Work</Text>
            <View style={styles.headerRight}>
              <TouchableOpacity onPress={toggleSelectionMode} style={styles.selectBtn}>
                <Text style={[styles.linkText, { color: theme.primary }]}>Select</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowSubjectPicker(true)}
                style={styles.composeBtn}
              >
                <Ionicons name="create-outline" size={24} color={theme.primary} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        {!isSelectionMode && (
          <Text style={styles.emailAddress}>{workAccount?.email}</Text>
        )}
      </View>

      {/* Selection Action Bar - Enhanced */}
      {isSelectionMode && someSelected && (
        <View style={styles.actionBar}>
          <TouchableOpacity 
            style={styles.actionItem} 
            onPress={hasUnreadSelected ? markSelectedAsRead : markSelectedAsUnread}
          >
            <Ionicons
              name={hasUnreadSelected ? 'mail-open-outline' : 'mail-outline'}
              size={20}
              color={theme.primary}
            />
            <Text style={[styles.actionText, { color: theme.primary }]}>
              {hasUnreadSelected ? 'Read' : 'Unread'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem} onPress={flagSelectedEmails}>
            <Ionicons name="flag-outline" size={20} color="#FF9500" />
            <Text style={[styles.actionText, { color: '#FF9500' }]}>Flag</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem} onPress={archiveSelectedEmails}>
            <Ionicons name="archive-outline" size={20} color="#34C759" />
            <Text style={[styles.actionText, { color: '#34C759' }]}>Archive</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem} onPress={deleteSelectedEmails}>
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            <Text style={[styles.actionText, { color: '#FF3B30' }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}

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
      {!isSelectionMode && (
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
      )}

      {/* Swipe hint */}
      {!isSelectionMode && workEmails.length > 0 && (
        <View style={styles.hintBar}>
          <Text style={styles.hintText}>
            <Ionicons name="swap-horizontal" size={12} color={theme.textSecondary} /> Swipe for quick actions
          </Text>
        </View>
      )}

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
    width: 60,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 100,
    justifyContent: 'flex-end',
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
  selectBtn: {
    padding: 4,
    marginRight: 8,
  },
  linkText: {
    fontSize: 17,
    fontWeight: '500',
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
  // Selection header
  selectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  cancelBtn: {
    padding: 4,
  },
  selectionCount: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.text,
  },
  selectAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  selectAllText: {
    fontSize: 15,
    marginLeft: 6,
    fontWeight: '500',
  },
  // Action bar
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  actionItem: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionText: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
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
  hintBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.background,
  },
  hintText: {
    fontSize: 12,
    color: theme.textSecondary,
    textAlign: 'center',
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
