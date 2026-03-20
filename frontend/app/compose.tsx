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
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEmailStore } from '../src/store/emailStore';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.backendUrl || 
  process.env.EXPO_PUBLIC_BACKEND_URL || 
  'https://agency-mail-hub.preview.emergentagent.com';

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
  
  // AI states
  const [aiEnabled, setAiEnabled] = useState(true);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedTone, setSelectedTone] = useState('professional');

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);
  const styles = createStyles(theme);

  const tones = [
    { id: 'professional', label: 'Professional', icon: 'briefcase' },
    { id: 'friendly', label: 'Friendly', icon: 'happy' },
    { id: 'formal', label: 'Formal', icon: 'school' },
    { id: 'casual', label: 'Casual', icon: 'cafe' },
  ];

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

  // AI Functions
  const callAiApi = async (endpoint: string, data: any) => {
    try {
      const response = await fetch(`${API_URL}/api/ai/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('AI API error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const handleAiWrite = async () => {
    if (!aiPrompt.trim()) {
      Alert.alert('Enter a prompt', 'Please describe what you want to write.');
      return;
    }

    setAiLoading(true);
    const result = await callAiApi('write', {
      prompt: aiPrompt,
      tone: selectedTone,
      length: 'medium',
    });
    setAiLoading(false);

    if (result.success) {
      setBody(result.content);
      setShowAiPanel(false);
      setAiPrompt('');
    } else {
      Alert.alert('AI Error', result.error || 'Failed to generate email');
    }
  };

  const handleAiImprove = async () => {
    if (!body.trim()) {
      Alert.alert('No content', 'Please write some content first to improve.');
      return;
    }

    setAiLoading(true);
    const result = await callAiApi('improve', {
      original_text: body,
      instruction: `improve and make it more ${selectedTone}`,
    });
    setAiLoading(false);

    if (result.success) {
      setBody(result.content);
    } else {
      Alert.alert('AI Error', result.error || 'Failed to improve email');
    }
  };

  const handleAiSubject = async () => {
    if (!body.trim()) {
      Alert.alert('No content', 'Please write email content first.');
      return;
    }

    setAiLoading(true);
    const result = await callAiApi('subject', {
      email_body: body,
      style: selectedTone,
    });
    setAiLoading(false);

    if (result.success) {
      setSubject(result.content);
    } else {
      Alert.alert('AI Error', result.error || 'Failed to generate subject');
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

        {/* AI Toggle Bar */}
        <View style={styles.aiToggleBar}>
          <View style={styles.aiToggleLeft}>
            <Ionicons 
              name="sparkles" 
              size={18} 
              color={aiEnabled ? theme.primary : theme.textSecondary} 
            />
            <Text style={[styles.aiToggleText, { color: aiEnabled ? theme.primary : theme.textSecondary }]}>
              AI Writing
            </Text>
          </View>
          <Switch
            value={aiEnabled}
            onValueChange={setAiEnabled}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor="#fff"
          />
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

          {/* Subject Field with AI button */}
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Subject:</Text>
            <TextInput
              style={[styles.fieldInput, { flex: 1 }]}
              value={subject}
              onChangeText={setSubject}
              placeholder="Subject"
              placeholderTextColor={theme.textSecondary}
            />
            {aiEnabled && body.trim() && (
              <TouchableOpacity 
                onPress={handleAiSubject}
                style={styles.aiMiniBtn}
                disabled={aiLoading}
              >
                {aiLoading ? (
                  <ActivityIndicator size="small" color={theme.primary} />
                ) : (
                  <Ionicons name="sparkles" size={18} color={theme.primary} />
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* AI Writing Panel */}
          {aiEnabled && showAiPanel && (
            <View style={styles.aiPanel}>
              <View style={styles.aiPanelHeader}>
                <Text style={styles.aiPanelTitle}>AI Email Writer</Text>
                <TouchableOpacity onPress={() => setShowAiPanel(false)}>
                  <Ionicons name="close" size={24} color={theme.text} />
                </TouchableOpacity>
              </View>
              
              {/* Tone selector */}
              <Text style={styles.aiSectionLabel}>Tone</Text>
              <View style={styles.toneSelector}>
                {tones.map((tone) => (
                  <TouchableOpacity
                    key={tone.id}
                    style={[
                      styles.toneOption,
                      selectedTone === tone.id && { backgroundColor: theme.primary },
                    ]}
                    onPress={() => setSelectedTone(tone.id)}
                  >
                    <Ionicons 
                      name={tone.icon as any} 
                      size={16} 
                      color={selectedTone === tone.id ? '#fff' : theme.textSecondary} 
                    />
                    <Text style={[
                      styles.toneLabel,
                      selectedTone === tone.id && { color: '#fff' },
                    ]}>
                      {tone.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Prompt input */}
              <Text style={styles.aiSectionLabel}>What do you want to write?</Text>
              <TextInput
                style={styles.aiPromptInput}
                value={aiPrompt}
                onChangeText={setAiPrompt}
                placeholder="e.g., Follow up on our meeting about the Q3 budget..."
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={3}
              />

              {/* Generate button */}
              <TouchableOpacity
                style={[styles.aiGenerateBtn, { backgroundColor: theme.primary }]}
                onPress={handleAiWrite}
                disabled={aiLoading}
              >
                {aiLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="sparkles" size={20} color="#fff" />
                    <Text style={styles.aiGenerateBtnText}>Generate Email</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

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
          
          {aiEnabled && (
            <>
              <View style={styles.toolbarDivider} />
              <TouchableOpacity 
                style={styles.toolbarBtn}
                onPress={() => setShowAiPanel(true)}
              >
                <Ionicons name="create" size={24} color={theme.primary} />
                <Ionicons 
                  name="sparkles" 
                  size={12} 
                  color={theme.primary} 
                  style={styles.sparkleOverlay}
                />
              </TouchableOpacity>
              {body.trim() && (
                <TouchableOpacity 
                  style={styles.toolbarBtn}
                  onPress={handleAiImprove}
                  disabled={aiLoading}
                >
                  {aiLoading ? (
                    <ActivityIndicator size="small" color={theme.primary} />
                  ) : (
                    <>
                      <Ionicons name="color-wand" size={24} color={theme.primary} />
                    </>
                  )}
                </TouchableOpacity>
              )}
            </>
          )}
          
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
  aiToggleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: theme.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  aiToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiToggleText: {
    fontSize: 15,
    fontWeight: '600',
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
  aiMiniBtn: {
    padding: 8,
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
  // AI Panel
  aiPanel: {
    backgroundColor: theme.background,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  aiPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  aiPanelTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
  },
  aiSectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textSecondary,
    marginBottom: 8,
    marginTop: 12,
  },
  toneSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  toneOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 6,
  },
  toneLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.textSecondary,
  },
  aiPromptInput: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: theme.text,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: theme.border,
  },
  aiGenerateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  aiGenerateBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  bodyContainer: {
    flex: 1,
    minHeight: 200,
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
    marginRight: 12,
    position: 'relative',
  },
  toolbarDivider: {
    width: 1,
    height: 24,
    backgroundColor: theme.border,
    marginHorizontal: 8,
  },
  sparkleOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  toolbarSpacer: {
    flex: 1,
  },
});
