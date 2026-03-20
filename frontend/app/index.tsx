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
import SwipeableEmailItem from '../src/components/SwipeableEmailItem';

export default function AllInboxScreen() {
  const router = useRouter();
  const {
    folders,
    selectedFolderId,
    searchQuery,
    setSearchQuery,
    getFilteredEmails,
    getConversations,
    toggleEmailFlag,
    accounts,
    smartCategories,
    selectedCategoryId,
    setSelectedCategory,
    getCurrentTheme,
    deleteEmail,
    archiveEmail,
    toggleEmailRead,
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
    flagSelectedEmails,
    archiveSelectedEmails,
  } = useEmailStore();

  const theme = getCurrentTheme();
  const emails = getFilteredEmails();
  const conversations = getConversations();
  const currentFolder = folders.find((f) => f.id === selectedFolderId);

  const [viewType, setViewType] = useState<'emails' | 'threads'>('emails');

  const allSelected = emails.length > 0 && selectedEmailIds.length === emails.length;
  const someSelected = selectedEmailIds.length > 0;
  const hasUnreadSelected = emails.some(
    (e) => selectedEmailIds.includes(e.id) && !e.isRead
  );
  const hasFlaggedSelected = emails.some(
    (e) => selectedEmailIds.includes(e.id) && e.isFlagged
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

  const renderEmail = ({ item }: { item: Email }) => (
    <SwipeableEmailItem
      item={item}
      theme={theme}
      isSelected={selectedEmailIds.includes(item.id)}
      isSelectionMode={isSelectionMode}
      accountColor={getAccountColor(item.accountId)}
      onPress={() => handleEmailPress(item)}
      onLongPress={() => handleEmailLongPress(item)}
      onToggleSelection={() => toggleEmailSelection(item.id)}
      onToggleFlag={() => toggleEmailFlag(item.id)}
      onDelete={() => deleteEmail(item.id)}
      onArchive={() => archiveEmail(item.id)}
      onToggleRead={() => toggleEmailRead(item.id)}
    />
  );

  const renderThread = ({ item }: { item: { threadId: string; subject: string; emails: Email[]; latestDate: string } }) => {
    const latestEmail = item.emails[0];
    const threadUnread = item.emails.some(e => !e.isRead);
    const threadFlagged = item.emails.some(e => e.isFlagged);

    return (
      <TouchableOpacity
        style={styles.threadItem}
        onPress={() => router.push(`/email/${latestEmail.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.threadContent}>
          <View style={styles.threadHeader}>
            <View style={styles.threadSenderRow}>
              {threadUnread && <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />}
              <Text style={[styles.threadSender, threadUnread && styles.unread]} numberOfLines={1}>
                {item.emails.length > 1 
                  ? `${latestEmail.fromName} (${item.emails.length})`
                  : latestEmail.fromName
                }
              </Text>
            </View>
            <Text style={styles.threadDate}>{item.latestDate}</Text>
          </View>
          <Text style={[styles.threadSubject, threadUnread && styles.unread]} numberOfLines={1}>
            {item.subject}
          </Text>
          <Text style={styles.threadSnippet} numberOfLines={1}>
            {latestEmail.snippet}
          </Text>
        </View>
        <View style={styles.threadActions}>
          {item.emails.length > 1 && (
            <View style={styles.threadBadge}>
              <Text style={styles.threadBadgeText}>{item.emails.length}</Text>
            </View>
          )}
          {threadFlagged && (
            <Ionicons name="flag" size={16} color="#FF9500" />
          )}
        </View>
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
                {allSelected ? 'Deselect' : 'All'}
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

        {/* View Type Toggle */}
        {!isSelectionMode && (
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[styles.viewToggleBtn, viewType === 'emails' && styles.viewToggleBtnActive]}
              onPress={() => setViewType('emails')}
            >
              <Ionicons 
                name="mail-outline" 
                size={16} 
                color={viewType === 'emails' ? '#fff' : theme.textSecondary} 
              />
              <Text style={[styles.viewToggleText, viewType === 'emails' && styles.viewToggleTextActive]}>
                Emails
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewToggleBtn, viewType === 'threads' && styles.viewToggleBtnActive]}
              onPress={() => setViewType('threads')}
            >
              <Ionicons 
                name="chatbubbles-outline" 
                size={16} 
                color={viewType === 'threads' ? '#fff' : theme.textSecondary} 
              />
              <Text style={[styles.viewToggleText, viewType === 'threads' && styles.viewToggleTextActive]}>
                Threads
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Filter pills */}
        {!isSelectionMode && (
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
        )}

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

      {/* Selection Action Bar - Enhanced with more actions */}
      {isSelectionMode && someSelected && (
        <View style={styles.actionBar}>
          <TouchableOpacity style={styles.actionItem} onPress={handleMarkAsRead}>
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
            <Ionicons
              name="flag-outline"
              size={20}
              color="#FF9500"
            />
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

      {/* Email count */}
      {!isSelectionMode && (
        <View style={styles.countBar}>
          <Text style={styles.countText}>
            {viewType === 'threads' 
              ? `${conversations.length} conversations`
              : `${emails.length} messages${unreadCount > 0 ? ` · ${unreadCount} unread` : ''}`
            }
          </Text>
          <Text style={styles.swipeHint}>
            <Ionicons name="swap-horizontal" size={12} color={theme.textSecondary} /> Swipe for actions
          </Text>
        </View>
      )}

      {/* Email/Thread List */}
      {viewType === 'emails' ? (
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
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderThread}
          keyExtractor={(item) => item.threadId}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={64} color={theme.textSecondary} />
              <Text style={styles.emptyText}>No conversations</Text>
              <Text style={styles.emptySubtext}>Start a new conversation</Text>
            </View>
          }
        />
      )}
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
  // View toggle
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: theme.border,
    borderRadius: 10,
    padding: 3,
    marginBottom: 12,
  },
  viewToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  viewToggleBtnActive: {
    backgroundColor: theme.primary,
  },
  viewToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  viewToggleTextActive: {
    color: '#fff',
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
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionText: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.background,
  },
  countText: {
    fontSize: 13,
    color: theme.textSecondary,
  },
  swipeHint: {
    fontSize: 11,
    color: theme.textSecondary,
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  // Thread styles
  threadItem: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.surface,
  },
  threadContent: {
    flex: 1,
  },
  threadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  threadSenderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  threadSender: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    flex: 1,
  },
  threadDate: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  threadSubject: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.text,
    marginBottom: 4,
  },
  threadSnippet: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  threadActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 12,
  },
  threadBadge: {
    backgroundColor: theme.primary,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  threadBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  unread: {
    fontWeight: '700',
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
