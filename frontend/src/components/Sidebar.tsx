import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEmailStore } from '../store/emailStore';

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const {
    accounts,
    folders,
    smartCategories,
    selectedAccountId,
    selectedFolderId,
    selectedCategoryId,
    viewMode,
    setSelectedAccount,
    setSelectedFolder,
    setSelectedCategory,
    setViewMode,
    emails,
  } = useEmailStore();

  const getUnreadCount = (folderId: string, accountId?: string | null) => {
    return emails.filter(
      (e) =>
        e.folderId === folderId &&
        !e.isRead &&
        (accountId ? e.accountId === accountId : true)
    ).length;
  };

  const getCategoryCount = (categoryId: string) => {
    return emails.filter(
      (e) => e.folderId === 'inbox' && e.category === categoryId && !e.isRead
    ).length;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mailboxes</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* View Mode Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleBtn,
            viewMode === 'smart' && styles.toggleBtnActive,
          ]}
          onPress={() => setViewMode('smart')}
        >
          <Text
            style={[
              styles.toggleText,
              viewMode === 'smart' && styles.toggleTextActive,
            ]}
          >
            Smart
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleBtn,
            viewMode === 'folders' && styles.toggleBtnActive,
          ]}
          onPress={() => setViewMode('folders')}
        >
          <Text
            style={[
              styles.toggleText,
              viewMode === 'folders' && styles.toggleTextActive,
            ]}
          >
            Folders
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {viewMode === 'smart' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SMART INBOX</Text>
            {smartCategories.map((cat) => {
              const count = getCategoryCount(cat.id);
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.navItem,
                    selectedCategoryId === cat.id && styles.navItemActive,
                  ]}
                  onPress={() => {
                    setSelectedCategory(cat.id);
                    setSelectedFolder('inbox');
                    onClose?.();
                  }}
                >
                  <View style={styles.navItemLeft}>
                    <View style={[styles.categoryDot, { backgroundColor: cat.color }]} />
                    <Text style={styles.navItemText}>{cat.name}</Text>
                  </View>
                  {count > 0 && (
                    <View style={[styles.badge, { backgroundColor: cat.color }]}>
                      <Text style={styles.badgeText}>{count}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ACCOUNTS</Text>
            <TouchableOpacity
              style={[
                styles.navItem,
                selectedAccountId === null && styles.navItemActive,
              ]}
              onPress={() => {
                setSelectedAccount(null);
                onClose?.();
              }}
            >
              <View style={styles.navItemLeft}>
                <Ionicons name="mail" size={18} color="#666" style={styles.icon} />
                <Text style={styles.navItemText}>All Accounts</Text>
              </View>
            </TouchableOpacity>
            {accounts.map((acc) => (
              <TouchableOpacity
                key={acc.id}
                style={[
                  styles.navItem,
                  selectedAccountId === acc.id && styles.navItemActive,
                ]}
                onPress={() => {
                  setSelectedAccount(acc.id);
                  onClose?.();
                }}
              >
                <View style={styles.accountItem}>
                  <View style={styles.navItemLeft}>
                    <View style={[styles.accountDot, { backgroundColor: acc.color }]} />
                    <View>
                      <View style={styles.accountNameRow}>
                        <Text style={styles.navItemText}>{acc.name}</Text>
                        {acc.isPrimary && (
                          <View style={styles.primaryBadge}>
                            <Text style={styles.primaryBadgeText}>Primary</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.accountEmail}>{acc.email}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Folders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FOLDERS</Text>
          {folders.map((folder) => {
            const count = getUnreadCount(folder.id, selectedAccountId);
            return (
              <TouchableOpacity
                key={folder.id}
                style={[
                  styles.navItem,
                  selectedFolderId === folder.id && styles.navItemActive,
                ]}
                onPress={() => {
                  setSelectedFolder(folder.id);
                  onClose?.();
                }}
              >
                <View style={styles.navItemLeft}>
                  <Ionicons
                    name={folder.icon as any}
                    size={18}
                    color={selectedFolderId === folder.id ? '#007AFF' : '#666'}
                    style={styles.icon}
                  />
                  <Text
                    style={[
                      styles.navItemText,
                      selectedFolderId === folder.id && styles.navItemTextActive,
                    ]}
                  >
                    {folder.name}
                  </Text>
                </View>
                {count > 0 && (
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>{count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 12,
    backgroundColor: '#F5F5F7',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000',
    letterSpacing: -0.5,
  },
  closeBtn: {
    padding: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#E5E5EA',
    borderRadius: 10,
    padding: 3,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleBtnActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  toggleTextActive: {
    color: '#000',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 8,
    paddingHorizontal: 16,
    letterSpacing: 0.5,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    borderRadius: 10,
  },
  navItemActive: {
    backgroundColor: '#E3EFFF',
  },
  navItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 12,
    width: 20,
  },
  navItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  navItemTextActive: {
    color: '#007AFF',
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 3,
    marginRight: 12,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  countBadge: {
    backgroundColor: '#E5E5EA',
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  accountItem: {
    flex: 1,
  },
  accountDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  accountNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountEmail: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  primaryBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  primaryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#991B1B',
  },
});
