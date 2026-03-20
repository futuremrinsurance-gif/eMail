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
import { useEmailStore, Email } from '../store/emailStore';

interface EmailListProps {
  onMenuPress?: () => void;
  onComposePress?: () => void;
}

export default function EmailList({ onMenuPress, onComposePress }: EmailListProps) {
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
    viewMode,
    selectedCategoryId,
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

  const emails = getFilteredEmails();
  const currentFolder = folders.find((f) => f.id === selectedFolderId);
  const currentCategory = smartCategories.find((c) => c.id === selectedCategoryId);

  const allSelected = emails.length > 0 && selectedEmailIds.length === emails.length;
  const someSelected = selectedEmailIds.length > 0;
  const hasUnreadSelected = emails.some(
    (e) => selectedEmailIds.includes(e.id) && !e.isRead
  );

  const getAccountColor = (accountId: string) => {
    return accounts.find((a) => a.id === accountId)?.color || '#007AFF';
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
                <Ionicons name="attach" size={14} color="#8E8E93" style={styles.attachIcon} />
              )}
              <Text style={styles.date}>{item.date}</Text>
            </View>
          </View>
          <View style={styles.subjectRow}>
            {!item.isRead && <View style={styles.unreadDot} />}
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
              color={item.isFlagged ? '#FF9500' : '#C7C7CC'}
            />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {isSelectionMode ? (
          // Selection mode header
          <View style={styles.selectionHeader}>
            <TouchableOpacity onPress={toggleSelectionMode} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.selectionCount}>
              {selectedEmailIds.length} selected
            </Text>
            <View style={styles.selectionActions}>
              <TouchableOpacity
                onPress={handleSelectAll}
                style={styles.selectAllBtn}
              >
                <Ionicons
                  name={allSelected ? 'checkbox' : 'square-outline'}
                  size={22}
                  color="#007AFF"
                />
                <Text style={styles.selectAllText}>
                  {allSelected ? 'Deselect' : 'Select All'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // Normal header
          <View style={styles.headerTop}>
            {onMenuPress && (
              <TouchableOpacity onPress={onMenuPress} style={styles.menuBtn}>
                <Ionicons name="menu" size={24} color="#007AFF" />
              </TouchableOpacity>
            )}
            <Text style={styles.title}>
              {viewMode === 'smart' ? currentCategory?.name : currentFolder?.name || 'Inbox'}
            </Text>
            <View style={styles.headerRight}>
              <TouchableOpacity onPress={toggleSelectionMode} style={styles.editBtn}>
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
              {onComposePress && (
                <TouchableOpacity onPress={onComposePress} style={styles.composeBtn}>
                  <Ionicons name="create-outline" size={24} color="#007AFF" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={16} color="#8E8E93" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#8E8E93"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#8E8E93" />
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
              color="#007AFF"
            />
            <Text style={styles.actionText}>
              {hasUnreadSelected ? 'Mark Read' : 'Mark Unread'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem} onPress={deleteSelectedEmails}>
            <Ionicons name="trash-outline" size={22} color="#FF3B30" />
            <Text style={[styles.actionText, { color: '#FF3B30' }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}

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
            <Ionicons name="mail-open-outline" size={64} color="#C7C7CC" />
            <Text style={styles.emptyText}>No emails</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try a different search' : 'Your inbox is empty'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  menuBtn: {
    padding: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000',
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editBtn: {
    padding: 4,
    marginRight: 12,
  },
  editText: {
    fontSize: 17,
    color: '#007AFF',
    fontWeight: '500',
  },
  composeBtn: {
    padding: 4,
  },
  // Selection header
  selectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cancelBtn: {
    padding: 4,
  },
  cancelText: {
    fontSize: 17,
    color: '#007AFF',
    fontWeight: '500',
  },
  selectionCount: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  selectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  selectAllText: {
    fontSize: 15,
    color: '#007AFF',
    marginLeft: 6,
    fontWeight: '500',
  },
  // Action bar
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#F9F9F9',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  actionText: {
    fontSize: 15,
    color: '#007AFF',
    marginLeft: 6,
    fontWeight: '500',
  },
  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
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
    color: '#000',
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
    borderBottomColor: '#F2F2F7',
    backgroundColor: '#fff',
  },
  emailItemSelected: {
    backgroundColor: '#E3EFFF',
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
    borderColor: '#C7C7CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
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
    color: '#000',
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
    color: '#8E8E93',
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
    backgroundColor: '#007AFF',
    marginRight: 8,
  },
  subject: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000',
    flex: 1,
  },
  snippet: {
    fontSize: 14,
    color: '#8E8E93',
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
    color: '#000',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 15,
    color: '#8E8E93',
    marginTop: 4,
  },
});
