import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type EmailProvider = 'gmail' | 'outlook' | 'imap';

export interface Account {
  id: string;
  name: string;
  email: string;
  provider: EmailProvider;
  isPrimary: boolean;
  color: string;
  isEnabled: boolean;
  signature: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Email {
  id: string;
  accountId: string;
  folderId: string;
  category: string;
  fromName: string;
  fromEmail: string;
  to: string;
  subject: string;
  snippet: string;
  body: string;
  date: string;
  timestamp: number;
  isRead: boolean;
  isFlagged: boolean;
  hasAttachments: boolean;
  labels: string[];
}

export interface Folder {
  id: string;
  name: string;
  icon: string;
  isSystem: boolean;
  isVisible: boolean;
  count?: number;
}

export interface SmartCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface ColorTheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  isDark: boolean;
}

export interface WorkEmailSettings {
  defaultSubjects: string[];
  quickReplies: string[];
}

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  badge: boolean;
  preview: boolean;
}

export interface SearchFilter {
  hasAttachment: boolean;
  isUnread: boolean;
  isFlagged: boolean;
  dateRange: 'all' | 'today' | 'week' | 'month';
  labels: string[];
}

export interface AppSettings {
  workEmail: WorkEmailSettings;
  expandedSections: string[];
  aiEnabled: boolean;
  aiTone: string;
  notifications: NotificationSettings;
  labels: Label[];
}

// 50 Color themes (25 light + 25 dark)
export const colorThemes: ColorTheme[] = [
  // Light themes
  { id: 'light-default', name: 'Default Blue', primary: '#007AFF', secondary: '#5856D6', accent: '#FF9500', background: '#F5F5F7', surface: '#FFFFFF', text: '#000000', textSecondary: '#8E8E93', border: '#E5E5EA', isDark: false },
  { id: 'light-ocean', name: 'Ocean', primary: '#0077B6', secondary: '#00B4D8', accent: '#90E0EF', background: '#F0F9FF', surface: '#FFFFFF', text: '#03045E', textSecondary: '#6B7280', border: '#CAF0F8', isDark: false },
  { id: 'light-forest', name: 'Forest', primary: '#2D6A4F', secondary: '#40916C', accent: '#95D5B2', background: '#F0FDF4', surface: '#FFFFFF', text: '#1B4332', textSecondary: '#6B7280', border: '#D8F3DC', isDark: false },
  { id: 'light-sunset', name: 'Sunset', primary: '#F97316', secondary: '#FB923C', accent: '#FED7AA', background: '#FFF7ED', surface: '#FFFFFF', text: '#9A3412', textSecondary: '#6B7280', border: '#FFEDD5', isDark: false },
  { id: 'light-lavender', name: 'Lavender', primary: '#7C3AED', secondary: '#8B5CF6', accent: '#C4B5FD', background: '#FAF5FF', surface: '#FFFFFF', text: '#5B21B6', textSecondary: '#6B7280', border: '#EDE9FE', isDark: false },
  { id: 'light-rose', name: 'Rose', primary: '#E11D48', secondary: '#FB7185', accent: '#FECDD3', background: '#FFF1F2', surface: '#FFFFFF', text: '#9F1239', textSecondary: '#6B7280', border: '#FFE4E6', isDark: false },
  { id: 'light-mint', name: 'Mint', primary: '#059669', secondary: '#10B981', accent: '#A7F3D0', background: '#ECFDF5', surface: '#FFFFFF', text: '#065F46', textSecondary: '#6B7280', border: '#D1FAE5', isDark: false },
  { id: 'light-sky', name: 'Sky', primary: '#0284C7', secondary: '#38BDF8', accent: '#BAE6FD', background: '#F0F9FF', surface: '#FFFFFF', text: '#075985', textSecondary: '#6B7280', border: '#E0F2FE', isDark: false },
  { id: 'light-amber', name: 'Amber', primary: '#D97706', secondary: '#F59E0B', accent: '#FDE68A', background: '#FFFBEB', surface: '#FFFFFF', text: '#92400E', textSecondary: '#6B7280', border: '#FEF3C7', isDark: false },
  { id: 'light-indigo', name: 'Indigo', primary: '#4F46E5', secondary: '#6366F1', accent: '#C7D2FE', background: '#EEF2FF', surface: '#FFFFFF', text: '#3730A3', textSecondary: '#6B7280', border: '#E0E7FF', isDark: false },
  { id: 'light-teal', name: 'Teal', primary: '#0D9488', secondary: '#14B8A6', accent: '#99F6E4', background: '#F0FDFA', surface: '#FFFFFF', text: '#115E59', textSecondary: '#6B7280', border: '#CCFBF1', isDark: false },
  { id: 'light-pink', name: 'Pink', primary: '#DB2777', secondary: '#EC4899', accent: '#FBCFE8', background: '#FDF2F8', surface: '#FFFFFF', text: '#9D174D', textSecondary: '#6B7280', border: '#FCE7F3', isDark: false },
  { id: 'light-cyan', name: 'Cyan', primary: '#0891B2', secondary: '#06B6D4', accent: '#A5F3FC', background: '#ECFEFF', surface: '#FFFFFF', text: '#155E75', textSecondary: '#6B7280', border: '#CFFAFE', isDark: false },
  { id: 'light-lime', name: 'Lime', primary: '#65A30D', secondary: '#84CC16', accent: '#D9F99D', background: '#F7FEE7', surface: '#FFFFFF', text: '#3F6212', textSecondary: '#6B7280', border: '#ECFCCB', isDark: false },
  { id: 'light-fuchsia', name: 'Fuchsia', primary: '#C026D3', secondary: '#D946EF', accent: '#F5D0FE', background: '#FDF4FF', surface: '#FFFFFF', text: '#86198F', textSecondary: '#6B7280', border: '#FAE8FF', isDark: false },
  { id: 'light-emerald', name: 'Emerald', primary: '#059669', secondary: '#10B981', accent: '#6EE7B7', background: '#ECFDF5', surface: '#FFFFFF', text: '#047857', textSecondary: '#6B7280', border: '#A7F3D0', isDark: false },
  { id: 'light-violet', name: 'Violet', primary: '#7C3AED', secondary: '#8B5CF6', accent: '#DDD6FE', background: '#F5F3FF', surface: '#FFFFFF', text: '#6D28D9', textSecondary: '#6B7280', border: '#EDE9FE', isDark: false },
  { id: 'light-coral', name: 'Coral', primary: '#EF4444', secondary: '#F87171', accent: '#FECACA', background: '#FEF2F2', surface: '#FFFFFF', text: '#DC2626', textSecondary: '#6B7280', border: '#FEE2E2', isDark: false },
  { id: 'light-slate', name: 'Slate', primary: '#475569', secondary: '#64748B', accent: '#CBD5E1', background: '#F8FAFC', surface: '#FFFFFF', text: '#334155', textSecondary: '#6B7280', border: '#E2E8F0', isDark: false },
  { id: 'light-gold', name: 'Gold', primary: '#CA8A04', secondary: '#EAB308', accent: '#FEF08A', background: '#FEFCE8', surface: '#FFFFFF', text: '#854D0E', textSecondary: '#6B7280', border: '#FEF9C3', isDark: false },
  { id: 'light-bronze', name: 'Bronze', primary: '#B45309', secondary: '#D97706', accent: '#FED7AA', background: '#FFFBEB', surface: '#FFFFFF', text: '#92400E', textSecondary: '#6B7280', border: '#FFEDD5', isDark: false },
  { id: 'light-sage', name: 'Sage', primary: '#4D7C0F', secondary: '#65A30D', accent: '#BEF264', background: '#F7FEE7', surface: '#FFFFFF', text: '#365314', textSecondary: '#6B7280', border: '#D9F99D', isDark: false },
  { id: 'light-berry', name: 'Berry', primary: '#BE185D', secondary: '#DB2777', accent: '#F9A8D4', background: '#FDF2F8', surface: '#FFFFFF', text: '#9D174D', textSecondary: '#6B7280', border: '#FBCFE8', isDark: false },
  { id: 'light-steel', name: 'Steel', primary: '#4B5563', secondary: '#6B7280', accent: '#D1D5DB', background: '#F9FAFB', surface: '#FFFFFF', text: '#374151', textSecondary: '#6B7280', border: '#E5E7EB', isDark: false },
  { id: 'light-peach', name: 'Peach', primary: '#EA580C', secondary: '#F97316', accent: '#FDBA74', background: '#FFF7ED', surface: '#FFFFFF', text: '#C2410C', textSecondary: '#6B7280', border: '#FED7AA', isDark: false },
  
  // Dark themes
  { id: 'dark-default', name: 'Dark Default', primary: '#0A84FF', secondary: '#5E5CE6', accent: '#FF9F0A', background: '#000000', surface: '#1C1C1E', text: '#FFFFFF', textSecondary: '#8E8E93', border: '#38383A', isDark: true },
  { id: 'dark-midnight', name: 'Midnight', primary: '#60A5FA', secondary: '#818CF8', accent: '#FBBF24', background: '#0F172A', surface: '#1E293B', text: '#F8FAFC', textSecondary: '#94A3B8', border: '#334155', isDark: true },
  { id: 'dark-ocean', name: 'Dark Ocean', primary: '#22D3EE', secondary: '#06B6D4', accent: '#0891B2', background: '#0C1929', surface: '#0F2942', text: '#E0F2FE', textSecondary: '#7DD3FC', border: '#164E63', isDark: true },
  { id: 'dark-forest', name: 'Dark Forest', primary: '#4ADE80', secondary: '#22C55E', accent: '#16A34A', background: '#052E16', surface: '#14532D', text: '#DCFCE7', textSecondary: '#86EFAC', border: '#166534', isDark: true },
  { id: 'dark-sunset', name: 'Dark Sunset', primary: '#FB923C', secondary: '#F97316', accent: '#EA580C', background: '#1C1917', surface: '#292524', text: '#FED7AA', textSecondary: '#FDBA74', border: '#44403C', isDark: true },
  { id: 'dark-purple', name: 'Dark Purple', primary: '#A78BFA', secondary: '#8B5CF6', accent: '#7C3AED', background: '#1E1B4B', surface: '#312E81', text: '#EDE9FE', textSecondary: '#C4B5FD', border: '#4338CA', isDark: true },
  { id: 'dark-rose', name: 'Dark Rose', primary: '#FB7185', secondary: '#F43F5E', accent: '#E11D48', background: '#1C1917', surface: '#27272A', text: '#FFE4E6', textSecondary: '#FDA4AF', border: '#3F3F46', isDark: true },
  { id: 'dark-emerald', name: 'Dark Emerald', primary: '#34D399', secondary: '#10B981', accent: '#059669', background: '#022C22', surface: '#064E3B', text: '#D1FAE5', textSecondary: '#6EE7B7', border: '#065F46', isDark: true },
  { id: 'dark-amber', name: 'Dark Amber', primary: '#FBBF24', secondary: '#F59E0B', accent: '#D97706', background: '#1C1917', surface: '#292524', text: '#FEF3C7', textSecondary: '#FCD34D', border: '#44403C', isDark: true },
  { id: 'dark-cyan', name: 'Dark Cyan', primary: '#22D3EE', secondary: '#06B6D4', accent: '#0891B2', background: '#083344', surface: '#164E63', text: '#CFFAFE', textSecondary: '#67E8F9', border: '#155E75', isDark: true },
  { id: 'dark-pink', name: 'Dark Pink', primary: '#F472B6', secondary: '#EC4899', accent: '#DB2777', background: '#1F1218', surface: '#2D1A24', text: '#FCE7F3', textSecondary: '#F9A8D4', border: '#500724', isDark: true },
  { id: 'dark-indigo', name: 'Dark Indigo', primary: '#818CF8', secondary: '#6366F1', accent: '#4F46E5', background: '#1E1B4B', surface: '#312E81', text: '#E0E7FF', textSecondary: '#A5B4FC', border: '#3730A3', isDark: true },
  { id: 'dark-teal', name: 'Dark Teal', primary: '#2DD4BF', secondary: '#14B8A6', accent: '#0D9488', background: '#042F2E', surface: '#134E4A', text: '#CCFBF1', textSecondary: '#5EEAD4', border: '#115E59', isDark: true },
  { id: 'dark-lime', name: 'Dark Lime', primary: '#A3E635', secondary: '#84CC16', accent: '#65A30D', background: '#1A1D12', surface: '#1F2718', text: '#ECFCCB', textSecondary: '#BEF264', border: '#3F6212', isDark: true },
  { id: 'dark-fuchsia', name: 'Dark Fuchsia', primary: '#E879F9', secondary: '#D946EF', accent: '#C026D3', background: '#1A0A1E', surface: '#2E1534', text: '#FAE8FF', textSecondary: '#F0ABFC', border: '#701A75', isDark: true },
  { id: 'dark-slate', name: 'Dark Slate', primary: '#94A3B8', secondary: '#64748B', accent: '#475569', background: '#0F172A', surface: '#1E293B', text: '#F1F5F9', textSecondary: '#CBD5E1', border: '#334155', isDark: true },
  { id: 'dark-coral', name: 'Dark Coral', primary: '#F87171', secondary: '#EF4444', accent: '#DC2626', background: '#1C1917', surface: '#292524', text: '#FEE2E2', textSecondary: '#FCA5A5', border: '#44403C', isDark: true },
  { id: 'dark-gold', name: 'Dark Gold', primary: '#FACC15', secondary: '#EAB308', accent: '#CA8A04', background: '#1C1917', surface: '#292524', text: '#FEF9C3', textSecondary: '#FDE047', border: '#44403C', isDark: true },
  { id: 'dark-violet', name: 'Dark Violet', primary: '#A78BFA', secondary: '#8B5CF6', accent: '#7C3AED', background: '#0C0A1D', surface: '#1A1625', text: '#EDE9FE', textSecondary: '#C4B5FD', border: '#2E2649', isDark: true },
  { id: 'dark-sky', name: 'Dark Sky', primary: '#38BDF8', secondary: '#0EA5E9', accent: '#0284C7', background: '#0C1929', surface: '#0F2942', text: '#E0F2FE', textSecondary: '#7DD3FC', border: '#075985', isDark: true },
  { id: 'dark-bronze', name: 'Dark Bronze', primary: '#F59E0B', secondary: '#D97706', accent: '#B45309', background: '#1C1917', surface: '#292524', text: '#FFEDD5', textSecondary: '#FBBF24', border: '#44403C', isDark: true },
  { id: 'dark-sage', name: 'Dark Sage', primary: '#84CC16', secondary: '#65A30D', accent: '#4D7C0F', background: '#111712', surface: '#1A231A', text: '#ECFCCB', textSecondary: '#A3E635', border: '#365314', isDark: true },
  { id: 'dark-berry', name: 'Dark Berry', primary: '#F472B6', secondary: '#DB2777', accent: '#BE185D', background: '#1A0A12', surface: '#27141C', text: '#FCE7F3', textSecondary: '#F9A8D4', border: '#4A1D2F', isDark: true },
  { id: 'dark-steel', name: 'Dark Steel', primary: '#9CA3AF', secondary: '#6B7280', accent: '#4B5563', background: '#111827', surface: '#1F2937', text: '#F3F4F6', textSecondary: '#D1D5DB', border: '#374151', isDark: true },
  { id: 'dark-abyss', name: 'Abyss', primary: '#60A5FA', secondary: '#3B82F6', accent: '#2563EB', background: '#030712', surface: '#111827', text: '#F9FAFB', textSecondary: '#9CA3AF', border: '#1F2937', isDark: true },
];

interface EmailState {
  accounts: Account[];
  emails: Email[];
  folders: Folder[];
  smartCategories: SmartCategory[];
  selectedAccountId: string | null;
  selectedFolderId: string;
  selectedCategoryId: string;
  selectedEmailId: string | null;
  selectedEmailIds: string[];
  isSelectionMode: boolean;
  viewMode: 'all' | 'account' | 'folder';
  searchQuery: string;
  currentThemeId: string;
  appSettings: AppSettings;
  
  // Actions
  setSelectedAccount: (id: string | null) => void;
  setSelectedFolder: (id: string) => void;
  setSelectedCategory: (id: string) => void;
  setSelectedEmail: (id: string | null) => void;
  setViewMode: (mode: 'all' | 'account' | 'folder') => void;
  setSearchQuery: (query: string) => void;
  toggleEmailRead: (id: string) => void;
  toggleEmailFlag: (id: string) => void;
  markAsRead: (id: string) => void;
  deleteEmail: (id: string) => void;
  sendEmail: (email: Partial<Email>) => void;
  addAccount: (account: Omit<Account, 'id'>) => void;
  toggleAccountEnabled: (id: string) => void;
  toggleFolderVisible: (id: string) => void;
  setTheme: (themeId: string) => void;
  getFilteredEmails: () => Email[];
  getWorkEmails: () => Email[];
  getCurrentTheme: () => ColorTheme;
  
  // Settings actions
  toggleSection: (sectionId: string) => void;
  updateWorkEmailSettings: (settings: Partial<WorkEmailSettings>) => void;
  addDefaultSubject: (subject: string) => void;
  removeDefaultSubject: (index: number) => void;
  
  // Selection actions
  toggleSelectionMode: () => void;
  toggleEmailSelection: (id: string) => void;
  selectAllEmails: () => void;
  deselectAllEmails: () => void;
  markSelectedAsRead: () => void;
  markSelectedAsUnread: () => void;
  deleteSelectedEmails: () => void;
  flagSelectedEmails: () => void;
  archiveSelectedEmails: () => void;
  
  // Single email actions
  archiveEmail: (id: string) => void;
  
  // Label actions
  addLabel: (label: Omit<Label, 'id'>) => void;
  removeLabel: (labelId: string) => void;
  addLabelToEmail: (emailId: string, labelId: string) => void;
  removeLabelFromEmail: (emailId: string, labelId: string) => void;
  addLabelToSelected: (labelId: string) => void;
  
  // Account signature
  updateAccountSignature: (accountId: string, signature: string) => void;
  
  // Search with filters
  searchWithFilters: (query: string, filters: Partial<SearchFilter>) => Email[];
  
  // Notification settings
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  
  // Conversation/Thread helpers
  getConversations: () => { threadId: string; subject: string; emails: Email[]; latestDate: string; }[];
}

// Default labels
const defaultLabels: Label[] = [
  { id: 'l1', name: 'Important', color: '#FF3B30' },
  { id: 'l2', name: 'Work', color: '#007AFF' },
  { id: 'l3', name: 'Personal', color: '#34C759' },
  { id: 'l4', name: 'Finance', color: '#FF9500' },
  { id: 'l5', name: 'Travel', color: '#AF52DE' },
];

// Demo accounts including custom domain with signatures
const demoAccounts: Account[] = [
  {
    id: 'a1',
    name: 'Primary',
    email: 'john.doe@gmail.com',
    provider: 'gmail',
    isPrimary: true,
    color: '#4285F4',
    isEnabled: true,
    signature: 'Best regards,\nJohn Doe\n\nSent from my iPhone',
  },
  {
    id: 'a2',
    name: 'Robert – Farmers',
    email: 'robert.dkarsky@farmersagency.com',
    provider: 'imap',
    isPrimary: false,
    color: '#FF6B00',
    isEnabled: true,
    signature: 'Robert D. Karsky\nSenior Insurance Agent\nFarmers Insurance Agency\nPhone: (555) 123-4567\nwww.farmersagency.com',
  },
  {
    id: 'a3',
    name: 'Work',
    email: 'john.doe@outlook.com',
    provider: 'outlook',
    isPrimary: false,
    color: '#0078D4',
    isEnabled: true,
    signature: 'John Doe\nSenior Manager | Product Division\nAcme Corporation\njohn.doe@outlook.com | (555) 987-6543',
  },
];

const demoFolders: Folder[] = [
  { id: 'inbox', name: 'Inbox', icon: 'mail', isSystem: true, isVisible: true, count: 24 },
  { id: 'sent', name: 'Sent', icon: 'send', isSystem: true, isVisible: true },
  { id: 'drafts', name: 'Drafts', icon: 'document-text', isSystem: true, isVisible: true, count: 3 },
  { id: 'archive', name: 'Archive', icon: 'archive', isSystem: true, isVisible: false },
  { id: 'trash', name: 'Trash', icon: 'trash', isSystem: true, isVisible: true },
  { id: 'spam', name: 'Spam', icon: 'warning', isSystem: true, isVisible: false, count: 5 },
];

const smartCategories: SmartCategory[] = [
  { id: 'all', name: 'All Mail', icon: 'mail', color: '#007AFF' },
  { id: 'unread', name: 'Unread', icon: 'mail-unread', color: '#FF3B30' },
  { id: 'flagged', name: 'Flagged', icon: 'flag', color: '#FF9500' },
];

// Generate demo emails
const generateDemoEmails = (): Email[] => {
  const now = Date.now();
  return [
    {
      id: 'e1',
      accountId: 'a2',
      folderId: 'inbox',
      category: 'priority',
      fromName: 'Farmers Insurance Updates',
      fromEmail: 'updates@farmersagency.com',
      to: 'robert.dkarsky@farmersagency.com',
      subject: 'Policy Renewal Reminder - Action Required',
      snippet: 'Your auto insurance policy #FA-2024-789 is due for renewal on August 15th...',
      body: 'Dear Robert,\n\nYour auto insurance policy #FA-2024-789 is due for renewal on August 15th, 2025.\n\nPolicy Details:\n- Coverage Type: Comprehensive\n- Current Premium: $1,245.00/year\n- Renewal Premium: $1,189.00/year (5% discount applied)\n\nPlease review and confirm your renewal at your earliest convenience.\n\nBest regards,\nFarmers Insurance Team',
      date: 'Today',
      timestamp: now - 3600000,
      isRead: false,
      isFlagged: true,
      hasAttachments: true,
      labels: ['l1', 'l4'],
    },
    {
      id: 'e2',
      accountId: 'a1',
      folderId: 'inbox',
      category: 'primary',
      fromName: 'Sarah Mitchell',
      fromEmail: 'sarah.mitchell@company.com',
      to: 'john.doe@gmail.com',
      subject: 'Re: Q3 Marketing Campaign Review',
      snippet: 'Thanks for sending over the deck! I have a few thoughts on the social media strategy...',
      body: 'Hi John,\n\nThanks for sending over the deck! I have a few thoughts on the social media strategy section:\n\n1. The Instagram engagement metrics look promising\n2. We should consider increasing the TikTok budget\n3. The influencer partnerships need more vetting\n\nCan we schedule a call tomorrow to discuss?\n\nBest,\nSarah',
      date: 'Today',
      timestamp: now - 7200000,
      isRead: true,
      isFlagged: false,
      hasAttachments: false,
      labels: ['l2'],
    },
    {
      id: 'e3',
      accountId: 'a3',
      folderId: 'inbox',
      category: 'primary',
      fromName: 'Microsoft Teams',
      fromEmail: 'noreply@microsoft.com',
      to: 'john.doe@outlook.com',
      subject: 'You have 3 unread messages in General',
      snippet: 'Alex Chen, Maria Garcia, and 1 other sent messages in the General channel...',
      body: 'You have 3 unread messages in General\n\n• Alex Chen: "Great work on the presentation!"\n• Maria Garcia: "Team lunch tomorrow at noon?"\n• Tom Wilson: "Updated the project timeline"\n\nOpen Teams to view all messages.',
      date: 'Today',
      timestamp: now - 10800000,
      isRead: false,
      isFlagged: false,
      hasAttachments: false,
      labels: ['l2'],
    },
    {
      id: 'e4',
      accountId: 'a1',
      folderId: 'inbox',
      category: 'news',
      fromName: 'TechCrunch Daily',
      fromEmail: 'newsletters@techcrunch.com',
      to: 'john.doe@gmail.com',
      subject: 'AI Breakthroughs: What July 2025 Brought Us',
      snippet: 'This week in tech: OpenAI announces GPT-5, Apple reveals new M4 chips...',
      body: 'TECHCRUNCH DAILY\n\n📰 TOP STORIES\n\n🤖 AI Breakthroughs Continue\nOpenAI has announced GPT-5, promising 10x improvements in reasoning capabilities...\n\n💻 Apple M4 Pro Benchmarks\nNew benchmarks reveal the M4 Pro outperforms previous generation by 40%...\n\n🚗 Tesla Robotaxi Update\nFull self-driving achieves new milestone in urban environments...\n\nRead more at techcrunch.com',
      date: 'Yesterday',
      timestamp: now - 86400000,
      isRead: true,
      isFlagged: false,
      hasAttachments: false,
      labels: [],
    },
    {
      id: 'e5',
      accountId: 'a2',
      folderId: 'inbox',
      category: 'primary',
      fromName: 'Client Services',
      fromEmail: 'support@farmersagency.com',
      to: 'robert.dkarsky@farmersagency.com',
      subject: 'New Client Inquiry - Home Insurance Quote',
      snippet: 'A new client has requested a quote for home insurance coverage. Details below...',
      body: 'Hello Robert,\n\nA new client has submitted a quote request:\n\n📋 Client Details:\n- Name: Jennifer Thompson\n- Phone: (555) 123-4567\n- Property: 2,450 sq ft single-family home\n- Location: 1234 Oak Street, Springfield\n\n🏠 Coverage Requested:\n- Dwelling coverage\n- Personal property\n- Liability protection\n\nPlease contact the client within 24 hours.\n\nBest,\nClient Services Team',
      date: 'Yesterday',
      timestamp: now - 90000000,
      isRead: false,
      isFlagged: true,
      hasAttachments: true,
      labels: ['l1', 'l2'],
    },
    {
      id: 'e6',
      accountId: 'a1',
      folderId: 'inbox',
      category: 'promos',
      fromName: 'Apple',
      fromEmail: 'no_reply@email.apple.com',
      to: 'john.doe@gmail.com',
      subject: 'Your July rewards are here 🎁',
      snippet: 'Exclusive offers just for you. Get 20% off accessories with Apple Card...',
      body: 'YOUR JULY REWARDS\n\n🎁 Exclusive Offers Just for You\n\n✨ 20% off all accessories with Apple Card\n✨ Free engraving on AirPods\n✨ Trade in and save up to $500 on iPhone\n\nOffers valid through July 31, 2025.\n\nShop now at apple.com',
      date: 'Jul 18',
      timestamp: now - 172800000,
      isRead: true,
      isFlagged: false,
      hasAttachments: false,
      labels: ['l3'],
    },
    {
      id: 'e7',
      accountId: 'a3',
      folderId: 'inbox',
      category: 'social',
      fromName: 'LinkedIn',
      fromEmail: 'messages-noreply@linkedin.com',
      to: 'john.doe@outlook.com',
      subject: 'David Chen sent you a message',
      snippet: 'Hi John, I came across your profile and wanted to connect about potential opportunities...',
      body: 'LinkedIn\n\nDavid Chen sent you a message:\n\n"Hi John,\n\nI came across your profile and was impressed by your experience in product management. We\'re currently hiring for a Senior PM role at our company.\n\nWould you be open to a quick chat this week?\n\nBest,\nDavid"\n\nReply to this message on LinkedIn.',
      date: 'Jul 17',
      timestamp: now - 259200000,
      isRead: true,
      isFlagged: false,
      hasAttachments: false,
      labels: ['l2', 'l3'],
    },
    {
      id: 'e8',
      accountId: 'a1',
      folderId: 'sent',
      category: 'primary',
      fromName: 'John Doe',
      fromEmail: 'john.doe@gmail.com',
      to: 'sarah.mitchell@company.com',
      subject: 'Q3 Marketing Campaign Review',
      snippet: 'Hi Sarah, Please find attached the Q3 marketing campaign deck for your review...',
      body: 'Hi Sarah,\n\nPlease find attached the Q3 marketing campaign deck for your review.\n\nKey highlights:\n- Projected 25% increase in social engagement\n- New influencer partnership strategy\n- Updated content calendar\n\nLet me know your thoughts!\n\nBest,\nJohn',
      date: 'Jul 16',
      timestamp: now - 345600000,
      isRead: true,
      isFlagged: false,
      hasAttachments: true,
      labels: ['l2'],
    },
  ];
};

export const useEmailStore = create<EmailState>((set, get) => ({
  accounts: demoAccounts,
  emails: generateDemoEmails(),
  folders: demoFolders,
  smartCategories: smartCategories,
  selectedAccountId: null,
  selectedFolderId: 'inbox',
  selectedCategoryId: 'all',
  selectedEmailId: null,
  selectedEmailIds: [],
  isSelectionMode: false,
  viewMode: 'all',
  searchQuery: '',
  currentThemeId: 'light-default',
  appSettings: {
    workEmail: {
      defaultSubjects: [
        'Weekly Status Update',
        'Meeting Follow-up',
        'Project Update',
        'Quick Question',
        'Action Required',
      ],
      quickReplies: [
        'Thanks for the update!',
        'I\'ll look into this.',
        'Let\'s schedule a call.',
      ],
    },
    notifications: {
      enabled: true,
      sound: true,
      badge: true,
      preview: true,
    },
    labels: defaultLabels,
    expandedSections: [],
    aiEnabled: true,
    aiTone: 'professional',
  },

  setSelectedAccount: (id) => set({ selectedAccountId: id, selectedEmailIds: [], isSelectionMode: false }),
  setSelectedFolder: (id) => set({ selectedFolderId: id, selectedEmailIds: [], isSelectionMode: false }),
  setSelectedCategory: (id) => set({ selectedCategoryId: id, selectedEmailIds: [], isSelectionMode: false }),
  setSelectedEmail: (id) => set({ selectedEmailId: id }),
  setViewMode: (mode) => set({ viewMode: mode, selectedEmailIds: [], isSelectionMode: false }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  setTheme: (themeId) => set({ currentThemeId: themeId }),
  
  getCurrentTheme: () => {
    const state = get();
    return colorThemes.find(t => t.id === state.currentThemeId) || colorThemes[0];
  },

  // Settings actions
  toggleSection: (sectionId) => set((state) => ({
    appSettings: {
      ...state.appSettings,
      expandedSections: state.appSettings.expandedSections.includes(sectionId)
        ? state.appSettings.expandedSections.filter(s => s !== sectionId)
        : [...state.appSettings.expandedSections, sectionId],
    },
  })),

  updateWorkEmailSettings: (settings) => set((state) => ({
    appSettings: {
      ...state.appSettings,
      workEmail: { ...state.appSettings.workEmail, ...settings },
    },
  })),

  addDefaultSubject: (subject) => set((state) => ({
    appSettings: {
      ...state.appSettings,
      workEmail: {
        ...state.appSettings.workEmail,
        defaultSubjects: [...state.appSettings.workEmail.defaultSubjects, subject],
      },
    },
  })),

  removeDefaultSubject: (index) => set((state) => ({
    appSettings: {
      ...state.appSettings,
      workEmail: {
        ...state.appSettings.workEmail,
        defaultSubjects: state.appSettings.workEmail.defaultSubjects.filter((_, i) => i !== index),
      },
    },
  })),

  getWorkEmails: () => {
    const state = get();
    // Work account is 'a3' (john.doe@outlook.com)
    return state.emails
      .filter((e) => e.accountId === 'a3' && e.folderId === 'inbox')
      .sort((a, b) => b.timestamp - a.timestamp);
  },

  toggleAccountEnabled: (id) => set((state) => ({
    accounts: state.accounts.map((a) =>
      a.id === id ? { ...a, isEnabled: !a.isEnabled } : a
    ),
  })),

  toggleFolderVisible: (id) => set((state) => ({
    folders: state.folders.map((f) =>
      f.id === id ? { ...f, isVisible: !f.isVisible } : f
    ),
  })),

  toggleEmailRead: (id) => set((state) => ({
    emails: state.emails.map((e) =>
      e.id === id ? { ...e, isRead: !e.isRead } : e
    ),
  })),

  toggleEmailFlag: (id) => set((state) => ({
    emails: state.emails.map((e) =>
      e.id === id ? { ...e, isFlagged: !e.isFlagged } : e
    ),
  })),

  markAsRead: (id) => set((state) => ({
    emails: state.emails.map((e) =>
      e.id === id ? { ...e, isRead: true } : e
    ),
  })),

  deleteEmail: (id) => set((state) => ({
    emails: state.emails.map((e) =>
      e.id === id ? { ...e, folderId: 'trash' } : e
    ),
  })),

  sendEmail: (email) => set((state) => {
    const newEmail: Email = {
      id: `e${Date.now()}`,
      accountId: email.accountId || state.accounts[0].id,
      folderId: 'sent',
      category: 'primary',
      fromName: state.accounts.find(a => a.id === email.accountId)?.name || 'You',
      fromEmail: state.accounts.find(a => a.id === email.accountId)?.email || '',
      to: email.to || '',
      subject: email.subject || '(No subject)',
      snippet: (email.body || '').substring(0, 100),
      body: email.body || '',
      date: 'Just now',
      timestamp: Date.now(),
      isRead: true,
      isFlagged: false,
      hasAttachments: false,
    };
    return { emails: [newEmail, ...state.emails] };
  }),

  addAccount: (account) => set((state) => ({
    accounts: [...state.accounts, { ...account, id: `a${Date.now()}`, isEnabled: true }],
  })),

  // Selection actions
  toggleSelectionMode: () => set((state) => ({
    isSelectionMode: !state.isSelectionMode,
    selectedEmailIds: state.isSelectionMode ? [] : state.selectedEmailIds,
  })),

  toggleEmailSelection: (id) => set((state) => ({
    selectedEmailIds: state.selectedEmailIds.includes(id)
      ? state.selectedEmailIds.filter((eid) => eid !== id)
      : [...state.selectedEmailIds, id],
  })),

  selectAllEmails: () => {
    const filtered = get().getFilteredEmails();
    set({ selectedEmailIds: filtered.map((e) => e.id), isSelectionMode: true });
  },

  deselectAllEmails: () => set({ selectedEmailIds: [] }),

  markSelectedAsRead: () => set((state) => ({
    emails: state.emails.map((e) =>
      state.selectedEmailIds.includes(e.id) ? { ...e, isRead: true } : e
    ),
    selectedEmailIds: [],
    isSelectionMode: false,
  })),

  markSelectedAsUnread: () => set((state) => ({
    emails: state.emails.map((e) =>
      state.selectedEmailIds.includes(e.id) ? { ...e, isRead: false } : e
    ),
    selectedEmailIds: [],
    isSelectionMode: false,
  })),

  deleteSelectedEmails: () => set((state) => ({
    emails: state.emails.map((e) =>
      state.selectedEmailIds.includes(e.id) ? { ...e, folderId: 'trash' } : e
    ),
    selectedEmailIds: [],
    isSelectionMode: false,
  })),

  flagSelectedEmails: () => set((state) => ({
    emails: state.emails.map((e) =>
      state.selectedEmailIds.includes(e.id) ? { ...e, isFlagged: true } : e
    ),
    selectedEmailIds: [],
    isSelectionMode: false,
  })),

  archiveSelectedEmails: () => set((state) => ({
    emails: state.emails.map((e) =>
      state.selectedEmailIds.includes(e.id) ? { ...e, folderId: 'archive' } : e
    ),
    selectedEmailIds: [],
    isSelectionMode: false,
  })),

  archiveEmail: (id) => set((state) => ({
    emails: state.emails.map((e) =>
      e.id === id ? { ...e, folderId: 'archive' } : e
    ),
  })),

  getConversations: () => {
    const state = get();
    const enabledAccountIds = state.accounts.filter(a => a.isEnabled).map(a => a.id);
    
    // Get inbox emails
    const inboxEmails = state.emails.filter(
      (e) => e.folderId === 'inbox' && enabledAccountIds.includes(e.accountId)
    );

    // Group by subject (removing Re: and Fwd: prefixes)
    const threadMap = new Map<string, Email[]>();
    
    inboxEmails.forEach((email) => {
      const cleanSubject = email.subject
        .replace(/^(Re:|Fwd:|RE:|FWD:)\s*/gi, '')
        .trim()
        .toLowerCase();
      
      if (!threadMap.has(cleanSubject)) {
        threadMap.set(cleanSubject, []);
      }
      threadMap.get(cleanSubject)!.push(email);
    });

    // Convert to array and sort by latest date
    const conversations = Array.from(threadMap.entries()).map(([subject, emails]) => {
      const sorted = emails.sort((a, b) => b.timestamp - a.timestamp);
      return {
        threadId: subject,
        subject: sorted[0].subject,
        emails: sorted,
        latestDate: sorted[0].date,
      };
    });

    return conversations.sort((a, b) => 
      b.emails[0].timestamp - a.emails[0].timestamp
    );
  },

  getFilteredEmails: () => {
    const state = get();
    const enabledAccountIds = state.accounts.filter(a => a.isEnabled).map(a => a.id);
    
    // Start with all emails from enabled accounts in the selected folder
    let filtered = state.emails.filter(
      (e) => e.folderId === state.selectedFolderId && enabledAccountIds.includes(e.accountId)
    );

    // Filter by account if specific account is selected
    if (state.viewMode === 'account' && state.selectedAccountId) {
      filtered = filtered.filter((e) => e.accountId === state.selectedAccountId);
    }

    // Apply category filter
    if (state.selectedCategoryId === 'unread') {
      filtered = filtered.filter((e) => !e.isRead);
    } else if (state.selectedCategoryId === 'flagged') {
      filtered = filtered.filter((e) => e.isFlagged);
    }

    // Apply search filter
    if (state.searchQuery.trim()) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.subject.toLowerCase().includes(query) ||
          e.fromName.toLowerCase().includes(query) ||
          e.fromEmail.toLowerCase().includes(query) ||
          e.snippet.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  },
}));
