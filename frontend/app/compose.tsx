import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEmailStore } from '../src/store/emailStore';

export default function ComposeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    replyTo?: string;
    subject?: string;
    body?: string;
    accountId?: string;
  }>();

  const { accounts, sendEmail, getCurrentTheme } = useEmailStore();
  const theme = getCurrentTheme();

  const [selectedAccountId, setSelectedAccountId] = useState(
    params.accountId || accounts[0]?.id || ''
  );
  const [to, setTo] = useState(params.replyTo || '');
  const [cc, setCc] = useState('');
  const [subject, setSubject] = useState(params.subject || '');
  const [body, setBody] = useState(params.body || '');
  const [showCc, setShowCc] = useState(false);
  const [showAccountPicker, setShowAccountPicker] = useState(false);

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);
  const styles = createStyles(theme);

  const handleSend = () => {
    if (!to.trim()) {
      Alert.alert('Missing Recipient', 'Please enter a recipient email address.');
      return;
    }

    sendEmail({
      accountId: selectedAccountId,
      to: to.trim(),
      subject: subject.trim(),
      body: body.trim(),
    });

    Alert.alert('Sent', 'Your email has been sent.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  const handleDiscard = () => {
    if (to || subject || body) {
      Alert.alert('Discard Draft?', 'Your draft will be lost.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => router.back() },
      ]);
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleDiscard} style={styles.headerBtn}>
            <Text style={[styles.cancelText, { color: theme.primary }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Message</Text>
          <TouchableOpacity
            onPress={handleSend}
            style={[styles.sendBtn, { backgroundColor: theme.primary }]}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.formContainer} keyboardShouldPersistTaps="handled">
          {/* From Account Selector */}
          <TouchableOpacity
            style={styles.fieldRow}
            onPress={() => setShowAccountPicker(!showAccountPicker)}
          >
            <Text style={styles.fieldLabel}>From:</Text>
            <View style={styles.accountSelector}>
              <View
                style={[
                  styles.accountDot,
                  { backgroundColor: selectedAccount?.color || theme.primary },
                ]}
              />
              <Text style={styles.accountEmail} numberOfLines={1}>
                {selectedAccount?.email || 'Select account'}
              </Text>
              <Ionicons name="chevron-down" size={18} color={theme.textSecondary} />
            </View>
          </TouchableOpacity>

          {showAccountPicker && (
            <View style={styles.accountPickerContainer}>
              {accounts.filter(a => a.isEnabled).map((acc) => (
                <TouchableOpacity
                  key={acc.id}
                  style={[
                    styles.accountOption,
                    acc.id === selectedAccountId && styles.accountOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedAccountId(acc.id);
                    setShowAccountPicker(false);
                  }}
                >
                  <View
                    style={[
                      styles.accountDot,
                      { backgroundColor: acc.color },
                    ]}
                  />
                  <View style={styles.accountOptionInfo}>
                    <Text style={styles.accountOptionName}>{acc.name}</Text>
                    <Text style={styles.accountOptionEmail}>{acc.email}</Text>
                  </View>
                  {acc.id === selectedAccountId && (
                    <Ionicons name="checkmark" size={20} color={theme.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* To Field */}
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>To:</Text>
            <TextInput
              style={styles.fieldInput}
              value={to}
              onChangeText={setTo}
              placeholder="recipient@example.com"
              placeholderTextColor={theme.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {!showCc && (
              <TouchableOpacity onPress={() => setShowCc(true)}>
                <Text style={[styles.ccToggle, { color: theme.primary }]}>Cc/Bcc</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Cc Field */}
          {showCc && (
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Cc:</Text>
              <TextInput
                style={styles.fieldInput}
                value={cc}
                onChangeText={setCc}
                placeholder="cc@example.com"
                placeholderTextColor={theme.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          )}

          {/* Subject Field */}
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Subject:</Text>
            <TextInput
              style={styles.fieldInput}
              value={subject}
              onChangeText={setSubject}
              placeholder="Subject"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          {/* Body */}
          <View style={styles.bodyContainer}>
            <TextInput
              style={styles.bodyInput}
              value={body}
              onChangeText={setBody}
              placeholder="Compose your message..."
              placeholderTextColor={theme.textSecondary}
              multiline
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        {/* Bottom Toolbar */}
        <View style={styles.toolbar}>
          <TouchableOpacity style={styles.toolbarBtn}>
            <Ionicons name="attach" size={24} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolbarBtn}>
            <Ionicons name="image-outline" size={24} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolbarBtn}>
            <Ionicons name="link" size={24} color={theme.primary} />
          </TouchableOpacity>
          <View style={styles.toolbarSpacer} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.surface,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.text,
  },
  cancelText: {
    fontSize: 17,
  },
  sendBtn: {
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContainer: {
    flex: 1,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  fieldLabel: {
    fontSize: 16,
    color: theme.textSecondary,
    width: 70,
  },
  fieldInput: {
    flex: 1,
    fontSize: 16,
    color: theme.text,
  },
  ccToggle: {
    fontSize: 14,
    fontWeight: '500',
  },
  accountSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  accountEmail: {
    flex: 1,
    fontSize: 16,
    color: theme.text,
  },
  accountPickerContainer: {
    backgroundColor: theme.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  accountOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  accountOptionSelected: {
    backgroundColor: theme.isDark ? '#1a3a5c' : '#E3EFFF',
  },
  accountOptionInfo: {
    flex: 1,
    marginLeft: 4,
  },
  accountOptionName: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.text,
  },
  accountOptionEmail: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 2,
  },
  bodyContainer: {
    flex: 1,
    minHeight: 300,
  },
  bodyInput: {
    flex: 1,
    fontSize: 16,
    color: theme.text,
    padding: 16,
    lineHeight: 24,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    backgroundColor: theme.background,
    paddingBottom: Platform.OS === 'ios' ? 30 : 12,
  },
  toolbarBtn: {
    padding: 8,
    marginRight: 16,
  },
  toolbarSpacer: {
    flex: 1,
  },
});
