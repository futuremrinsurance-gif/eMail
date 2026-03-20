import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEmailStore } from '../src/store/emailStore';

export default function MailboxesScreen() {
  const router = useRouter();
  const {
    accounts,
    folders,
    toggleAccountEnabled,
    toggleFolderVisible,
    setSelectedAccount,
    setSelectedFolder,
    getCurrentTheme,
    emails,
  } = useEmailStore();

  const [isEditing, setIsEditing] = useState(false);
  const theme = getCurrentTheme();
  const styles = createStyles(theme);

  const getUnreadCount = (accountId: string, folderId: string) => {
    return emails.filter(
      (e) => e.accountId === accountId && e.folderId === folderId && !e.isRead
    ).length;
  };

  const getTotalUnread = (folderId: string) => {
    return emails.filter((e) => e.folderId === folderId && !e.isRead).length;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => router.push('/settings')}
            style={styles.settingsBtn}
          >
            <Ionicons name="settings-outline" size={24} color={theme.primary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>Mailboxes</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => setIsEditing(!isEditing)}
            style={styles.editBtn}
          >
            <Text style={[styles.linkText, { color: theme.primary }]}>
              {isEditing ? 'Done' : 'Edit'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/compose')}
            style={styles.composeBtn}
          >
            <Ionicons name="create-outline" size={24} color={theme.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Accounts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNTS</Text>
          {accounts.map((account) => {
            const unread = getUnreadCount(account.id, 'inbox');
            return (
              <View key={account.id} style={styles.accountRow}>
                {isEditing ? (
                  <View style={styles.editRow}>
                    <View style={[styles.accountDot, { backgroundColor: account.color }]} />
                    <View style={styles.accountInfo}>
                      <Text style={styles.accountName}>{account.name}</Text>
                      <Text style={styles.accountEmail}>{account.email}</Text>
                    </View>
                    <Switch
                      value={account.isEnabled}
                      onValueChange={() => toggleAccountEnabled(account.id)}
                      trackColor={{ false: theme.border, true: theme.primary }}
                    />
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.accountItem}
                    onPress={() => {
                      setSelectedAccount(account.id);
                      router.push('/');
                    }}
                    disabled={!account.isEnabled}
                  >
                    <View style={[styles.accountDot, { backgroundColor: account.color }]} />
                    <View style={styles.accountInfo}>
                      <View style={styles.accountNameRow}>
                        <Text
                          style={[
                            styles.accountName,
                            !account.isEnabled && styles.disabledText,
                          ]}
                        >
                          {account.name}
                        </Text>
                        {account.isPrimary && (
                          <View style={styles.primaryBadge}>
                            <Text style={styles.primaryBadgeText}>Primary</Text>
                          </View>
                        )}
                      </View>
                      <Text
                        style={[
                          styles.accountEmail,
                          !account.isEnabled && styles.disabledText,
                        ]}
                      >
                        {account.email}
                      </Text>
                    </View>
                    {unread > 0 && account.isEnabled && (
                      <View style={[styles.badge, { backgroundColor: theme.primary }]}>
                        <Text style={styles.badgeText}>{unread}</Text>
                      </View>
                    )}
                    <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        {/* Folders Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FOLDERS TO SHOW</Text>
          {folders.map((folder) => {
            const unread = getTotalUnread(folder.id);
            return (
              <View key={folder.id} style={styles.folderRow}>
                {isEditing ? (
                  <View style={styles.editRow}>
                    <Ionicons
                      name={folder.icon as any}
                      size={20}
                      color={theme.textSecondary}
                      style={styles.folderIcon}
                    />
                    <Text style={styles.folderName}>{folder.name}</Text>
                    <Switch
                      value={folder.isVisible}
                      onValueChange={() => toggleFolderVisible(folder.id)}
                      trackColor={{ false: theme.border, true: theme.primary }}
                    />
                  </View>
                ) : folder.isVisible ? (
                  <TouchableOpacity
                    style={styles.folderItem}
                    onPress={() => {
                      setSelectedFolder(folder.id);
                      router.push('/');
                    }}
                  >
                    <Ionicons
                      name={folder.icon as any}
                      size={20}
                      color={theme.primary}
                      style={styles.folderIcon}
                    />
                    <Text style={styles.folderName}>{folder.name}</Text>
                    {unread > 0 && (
                      <View style={[styles.badge, { backgroundColor: theme.primary }]}>
                        <Text style={styles.badgeText}>{unread}</Text>
                      </View>
                    )}
                    <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                  </TouchableOpacity>
                ) : null}
              </View>
            );
          })}
          {!isEditing && folders.filter(f => !f.isVisible).length > 0 && (
            <TouchableOpacity
              style={styles.showHiddenBtn}
              onPress={() => setIsEditing(true)}
            >
              <Text style={[styles.showHiddenText, { color: theme.primary }]}>
                Show {folders.filter(f => !f.isVisible).length} hidden folders
              </Text>
            </TouchableOpacity>
          )}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
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
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.textSecondary,
    marginBottom: 8,
    paddingHorizontal: 16,
    letterSpacing: 0.5,
  },
  accountRow: {
    backgroundColor: theme.surface,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  accountDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  accountInfo: {
    flex: 1,
  },
  accountNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountName: {
    fontSize: 17,
    fontWeight: '500',
    color: theme.text,
  },
  accountEmail: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 2,
  },
  disabledText: {
    color: theme.textSecondary,
  },
  primaryBadge: {
    backgroundColor: theme.isDark ? '#4a2c2c' : '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  primaryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.isDark ? '#FCA5A5' : '#991B1B',
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  folderRow: {
    backgroundColor: theme.surface,
  },
  folderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  folderIcon: {
    marginRight: 12,
    width: 24,
  },
  folderName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '500',
    color: theme.text,
  },
  showHiddenBtn: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: theme.surface,
  },
  showHiddenText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
