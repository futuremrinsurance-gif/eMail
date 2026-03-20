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
import { useRouter } from 'expo-router';
import { useEmailStore } from '../store/emailStore';

interface EmailViewerProps {
  emailId: string;
}

export default function EmailViewer({ emailId }: EmailViewerProps) {
  const router = useRouter();
  const { emails, accounts, toggleEmailFlag, markAsRead, deleteEmail } = useEmailStore();
  const email = emails.find((e) => e.id === emailId);
  const account = accounts.find((a) => a.id === email?.accountId);

  React.useEffect(() => {
    if (email && !email.isRead) {
      markAsRead(email.id);
    }
  }, [email?.id]);

  if (!email) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="mail-outline" size={64} color="#C7C7CC" />
        <Text style={styles.emptyText}>Select an email</Text>
      </View>
    );
  }

  const handleReply = () => {
    router.push({
      pathname: '/compose',
      params: {
        replyTo: email.fromEmail,
        subject: `Re: ${email.subject}`,
        accountId: email.accountId,
      },
    });
  };

  const handleForward = () => {
    router.push({
      pathname: '/compose',
      params: {
        subject: `Fwd: ${email.subject}`,
        body: `\n\n---------- Forwarded message ----------\nFrom: ${email.fromName} <${email.fromEmail}>\nDate: ${email.date}\nSubject: ${email.subject}\n\n${email.body}`,
        accountId: email.accountId,
      },
    });
  };

  const handleDelete = () => {
    deleteEmail(email.id);
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color="#007AFF" />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => toggleEmailFlag(email.id)}
            style={styles.actionBtn}
          >
            <Ionicons
              name={email.isFlagged ? 'flag' : 'flag-outline'}
              size={22}
              color={email.isFlagged ? '#FF9500' : '#007AFF'}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.actionBtn}>
            <Ionicons name="trash-outline" size={22} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Email Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Subject */}
        <Text style={styles.subject}>{email.subject}</Text>

        {/* Sender Info */}
        <View style={styles.senderSection}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: account?.color || '#007AFF' },
            ]}
          >
            <Text style={styles.avatarText}>
              {email.fromName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.senderInfo}>
            <View style={styles.senderRow}>
              <Text style={styles.senderName}>{email.fromName}</Text>
              <Text style={styles.senderDate}>{email.date}</Text>
            </View>
            <Text style={styles.senderEmail}>{email.fromEmail}</Text>
            <Text style={styles.toText}>To: {email.to}</Text>
          </View>
        </View>

        {/* Attachments indicator */}
        {email.hasAttachments && (
          <View style={styles.attachmentBar}>
            <Ionicons name="attach" size={18} color="#8E8E93" />
            <Text style={styles.attachmentText}>1 attachment</Text>
          </View>
        )}

        {/* Body */}
        <View style={styles.bodyContainer}>
          <Text style={styles.body}>{email.body}</Text>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomAction} onPress={handleReply}>
          <Ionicons name="arrow-undo" size={22} color="#007AFF" />
          <Text style={styles.bottomActionText}>Reply</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomAction} onPress={handleReply}>
          <Ionicons name="arrow-undo-outline" size={22} color="#007AFF" />
          <Text style={styles.bottomActionText}>Reply All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomAction} onPress={handleForward}>
          <Ionicons name="arrow-redo" size={22} color="#007AFF" />
          <Text style={styles.bottomActionText}>Forward</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingHorizontal: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#fff',
  },
  backBtn: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionBtn: {
    padding: 8,
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  subject: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    letterSpacing: -0.3,
  },
  senderSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  senderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  senderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  senderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  senderDate: {
    fontSize: 14,
    color: '#8E8E93',
  },
  senderEmail: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  toText: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  attachmentBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9F9F9',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  attachmentText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 8,
  },
  bodyContainer: {
    padding: 16,
  },
  body: {
    fontSize: 16,
    color: '#000',
    lineHeight: 24,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 30 : 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    backgroundColor: '#fff',
  },
  bottomAction: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  bottomActionText: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 4,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F7',
  },
  emptyText: {
    fontSize: 18,
    color: '#8E8E93',
    marginTop: 16,
  },
});
