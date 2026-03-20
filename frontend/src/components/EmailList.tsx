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
  } = useEmailStore();

  const emails = getFilteredEmails();
  const currentFolder = folders.find((f) => f.id === selectedFolderId);
  const currentCategory = smartCategories.find((c) => c.id === selectedCategoryId);

  const getAccountColor = (accountId: string) => {
    return accounts.find((a) => a.id === accountId)?.color || '#007AFF';
  };

  const renderEmail = ({ item }: { item: Email }) => (
    <TouchableOpacity
      style={styles.emailItem}
      onPress={() => router.push(`/email/${item.id}`)}
      activeOpacity={0.7}
    >
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
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          {onMenuPress && (
            <TouchableOpacity onPress={onMenuPress} style={styles.menuBtn}>
              <Ionicons name="menu" size={24} color="#007AFF" />
            </TouchableOpacity>
          )}
          <Text style={styles.title}>
            {viewMode === 'smart' ? currentCategory?.name : currentFolder?.name || 'Inbox'}
          </Text>
          {onComposePress && (
            <TouchableOpacity onPress={onComposePress} style={styles.composeBtn}>
              <Ionicons name="create-outline" size={24} color="#007AFF" />
            </TouchableOpacity>
          )}
        </View>
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
  composeBtn: {
    padding: 4,
  },
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
