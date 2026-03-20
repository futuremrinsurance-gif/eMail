import React from 'react';
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

export default function AllInboxScreen() {
  const router = useRouter();
  const {
    folders,
    selectedFolderId,
    searchQuery,
    setSearchQuery,
    getFilteredEmails,
    toggleEmailFlag,
    accounts,
    smartCategories,
    selectedCategoryId,
    setSelectedCategory,
    getCurrentTheme,
    // Selection state
    isSelectionMode,
    selectedEmailIds,
    toggleSelectionMode,
    toggleEmailSelection,
    selectAllEmails,
    deselectAllEmails,
    markSelectedAsRead,
    markSelectedAsUnread,
    deleteSelectedEmails,
  } = useEmailStore();

  const theme = getCurrentTheme();
  const emails = getFilteredEmails();
  const currentFolder = folders.find((f) => f.id === selectedFolderId);

  const allSelected = emails.length > 0 && selectedEmailIds.length === emails.length;
  const someSelected = selectedEmailIds.length > 0;
  const hasUnreadSelected = emails.some(
    (e) => selectedEmailIds.includes(e.id) && !e.isRead
  );

  const unreadCount = emails.filter(e => !e.isRead).length;

  const getAccountColor = (accountId: string) => {
    return accounts.find((a) => a.id === accountId)?.color || theme.primary;
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
      toggleSelectionMode();
      toggleEmailSelection(item.id);
    }
  };

  const handleSelectAll = () => {
    if (allSelected) {
      deselectAllEmails();
    } else {
      selectAllEmails();
    }
  };

  const handleMarkAsRead = () => {
    if (hasUnreadSelected) {
      markSelectedAsRead();
    } else {
      markSelectedAsUnread();
    }
  };

  const styles = createStyles(theme);

  const renderEmail = ({ item }: { item: Email }) => {
    const isSelected = selectedEmailIds.includes(item.id);

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
            <View style={styles.senderRow}>
              <View
                style={[
                  styles.accountIndicator,
                  { backgroundColor: getAccountColor(item.accountId) },
                ]}
              />
              <Text style={[styles.sender, !item.isRead && styles.unread]} numberOfLines={1}>
                {item.fromName}
              </Text>
            </View>
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
              {selectedEmailIds.length} selected
            </Text>
            <TouchableOpacity onPress={handleSelectAll} style={styles.selectAllBtn}>
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
              <TouchableOpacity
                onPress={() => router.push('/settings')}
                style={styles.settingsBtn}
              >
                <Ionicons name="settings-outline" size={24} color={theme.primary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.title}>All Inboxes</Text>
            <View style={styles.headerRight}>
              <TouchableOpacity onPress={toggleSelectionMode} style={styles.editBtn}>
                <Text style={[styles.linkText, { color: theme.primary }]}>Select</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/compose')} style={styles.composeBtn}>
                <Ionicons name="create-outline" size={24} color={theme.primary} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Filter pills */}
        <View style={styles.filterRow}>
          {smartCategories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.filterPill,
                selectedCategoryId === cat.id && { backgroundColor: theme.primary },
              ]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Text
                style={[
                  styles.filterPillText,
                  selectedCategoryId === cat.id && { color: '#fff' },
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={16} color={theme.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Selection Action Bar */}
      {isSelectionMode && someSelected && (
        <View style={styles.actionBar}>
          <TouchableOpacity style={styles.actionItem} onPress={handleMarkAsRead}>
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

      {/* Email count */}
      <View style={styles.countBar}>
        <Text style={styles.countText}>
          {emails.length} messages{unreadCount > 0 ? ` · ${unreadCount} unread` : ''}
        </Text>
      </View>

      {/* Email List */}
      <FlatList
        data={emails}
        renderItem={renderEmail}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="mail-open-outline" size={64} color={theme.textSecondary} />
            <Text style={styles.emptyText}>No emails</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try a different search' : 'Your inbox is empty'}
            </Text>
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
    marginBottom: 12,
    paddingTop: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
  },
  settingsBtn: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
    justifyContent: 'flex-end',
  },
  editBtn: {
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
  selectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
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
  filterRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: theme.border,
  },
  filterPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
  },
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.text,
  },
  countBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.background,
  },
  countText: {
    fontSize: 13,
    color: theme.textSecondary,
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
  senderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accountIndicator: {
    width: 4,
    height: 16,
    borderRadius: 2,
    marginRight: 8,
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
