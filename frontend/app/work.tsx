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
    toggleEmailRead,
    deleteEmail,
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

  const renderEmail = ({ item }: { item: Email }) => {
    const isSelected = selectedIds.includes(item.id);
    
    return (
      <TouchableOpacity
        style={[styles.emailItem, isSelected && styles.emailItemSelected]}
        onPress={() => handleEmailPress(item)}
        onLongPress={() => handleEmailLongPress(item)}
        activeOpacity={0.7}
      >
        {isSelectionMode && (
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => toggleEmailSelection(item.id)}
          >
            <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
              {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
          </TouchableOpacity>
        )}
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
        {!isSelectionMode && (
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
        )}
      </TouchableOpacity>
    );
  };

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
                {allSelected ? 'Deselect' : 'Select All'}
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

      {/* Selection Action Bar */}
      {isSelectionMode && someSelected && (
        <View style={styles.actionBar}>
          <TouchableOpacity 
            style={styles.actionItem} 
            onPress={hasUnreadSelected ? markSelectedAsRead : markSelectedAsUnread}
          >
            <Ionicons
              name={hasUnreadSelected ? 'mail-open-outline' : 'mail-outline'}
              size={22}
              color={theme.primary}
            />
            <Text style={[styles.actionText, { color: theme.primary }]}>
              {hasUnreadSelected ? 'Mark Read' : 'Mark Unread'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem} onPress={deleteSelectedEmails}>
            <Ionicons name="trash-outline" size={22} color="#FF3B30" />
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  actionText: {
    fontSize: 15,
    marginLeft: 6,
    fontWeight: '500',
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
  emailItemSelected: {
    backgroundColor: theme.isDark ? '#1a3a5c' : '#E3EFFF',
  },
  checkboxContainer: {
    justifyContent: 'center',
    paddingRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
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
