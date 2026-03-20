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
}

export interface Folder {
  id: string;
  name: string;
  icon: string;
  isSystem: boolean;
  count?: number;
}

export interface SmartCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

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
  viewMode: 'smart' | 'folders';
  searchQuery: string;
  
  // Actions
  setSelectedAccount: (id: string | null) => void;
  setSelectedFolder: (id: string) => void;
  setSelectedCategory: (id: string) => void;
  setSelectedEmail: (id: string | null) => void;
  setViewMode: (mode: 'smart' | 'folders') => void;
  setSearchQuery: (query: string) => void;
  toggleEmailRead: (id: string) => void;
  toggleEmailFlag: (id: string) => void;
  markAsRead: (id: string) => void;
  deleteEmail: (id: string) => void;
  sendEmail: (email: Partial<Email>) => void;
  addAccount: (account: Omit<Account, 'id'>) => void;
  getFilteredEmails: () => Email[];
  
  // Selection actions
  toggleSelectionMode: () => void;
  toggleEmailSelection: (id: string) => void;
  selectAllEmails: () => void;
  deselectAllEmails: () => void;
  markSelectedAsRead: () => void;
  markSelectedAsUnread: () => void;
  deleteSelectedEmails: () => void;
  flagSelectedEmails: () => void;
}

// Demo accounts including custom domain
const demoAccounts: Account[] = [
  {
    id: 'a1',
    name: 'Primary',
    email: 'john.doe@gmail.com',
    provider: 'gmail',
    isPrimary: true,
    color: '#4285F4',
  },
  {
    id: 'a2',
    name: 'Robert – Farmers',
    email: 'robert.dkarsky@farmersagency.com',
    provider: 'imap',
    isPrimary: false,
    color: '#FF6B00',
  },
  {
    id: 'a3',
    name: 'Work',
    email: 'john.doe@outlook.com',
    provider: 'outlook',
    isPrimary: false,
    color: '#0078D4',
  },
];

const demoFolders: Folder[] = [
  { id: 'inbox', name: 'Inbox', icon: 'mail', isSystem: true, count: 24 },
  { id: 'sent', name: 'Sent', icon: 'send', isSystem: true },
  { id: 'drafts', name: 'Drafts', icon: 'document-text', isSystem: true, count: 3 },
  { id: 'archive', name: 'Archive', icon: 'archive', isSystem: true },
  { id: 'trash', name: 'Trash', icon: 'trash', isSystem: true },
  { id: 'spam', name: 'Spam', icon: 'warning', isSystem: true, count: 5 },
];

const smartCategories: SmartCategory[] = [
  { id: 'primary', name: 'Primary', icon: 'person', color: '#007AFF' },
  { id: 'priority', name: 'Priority', icon: 'star', color: '#FF9500' },
  { id: 'news', name: 'News', icon: 'newspaper', color: '#34C759' },
  { id: 'promos', name: 'Promos', icon: 'pricetag', color: '#AF52DE' },
  { id: 'social', name: 'Social', icon: 'people', color: '#FF2D55' },
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
  selectedCategoryId: 'primary',
  selectedEmailId: null,
  selectedEmailIds: [],
  isSelectionMode: false,
  viewMode: 'smart',
  searchQuery: '',

  setSelectedAccount: (id) => set({ selectedAccountId: id }),
  setSelectedFolder: (id) => set({ selectedFolderId: id, selectedEmailIds: [], isSelectionMode: false }),
  setSelectedCategory: (id) => set({ selectedCategoryId: id, selectedEmailIds: [], isSelectionMode: false }),
  setSelectedEmail: (id) => set({ selectedEmailId: id }),
  setViewMode: (mode) => set({ viewMode: mode, selectedEmailIds: [], isSelectionMode: false }),
  setSearchQuery: (query) => set({ searchQuery: query }),

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
    accounts: [...state.accounts, { ...account, id: `a${Date.now()}` }],
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

  getFilteredEmails: () => {
    const state = get();
    let filtered = state.emails.filter((e) => e.folderId === state.selectedFolderId);

    if (state.viewMode === 'smart') {
      filtered = filtered.filter((e) => e.category === state.selectedCategoryId);
    } else if (state.selectedAccountId) {
      filtered = filtered.filter((e) => e.accountId === state.selectedAccountId);
    }

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
