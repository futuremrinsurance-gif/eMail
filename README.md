 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/EMAIL_APP_XCODE_STARTER.swift b/EMAIL_APP_XCODE_STARTER.swift
new file mode 100644
index 0000000000000000000000000000000000000000..db761a517c676d5a4cc3307e4d22ea53a2ab7e77
--- /dev/null
+++ b/EMAIL_APP_XCODE_STARTER.swift
@@ -0,0 +1,263 @@
+import SwiftUI
+
+// MARK: - Models
+
+enum MailPlatform: String, CaseIterable, Identifiable {
+    case iCloud = "Apple Mail"
+    case gmail = "Gmail"
+    case outlook = "Outlook"
+
+    var id: String { rawValue }
+
+    var tint: Color {
+        switch self {
+        case .iCloud: return .blue
+        case .gmail: return .red
+        case .outlook: return .indigo
+        }
+    }
+}
+
+struct MailMessage: Identifiable, Hashable {
+    let id = UUID()
+    var platform: MailPlatform
+    var sender: String
+    var subject: String
+    var preview: String
+    var date: Date
+    var isRead: Bool
+
+    // Independent per-provider markers:
+    var isFlaggedApple: Bool
+    var isStarredGmail: Bool
+    var isFlaggedOutlook: Bool
+
+    var hasAnyPriorityMark: Bool {
+        isFlaggedApple || isStarredGmail || isFlaggedOutlook
+    }
+}
+
+// MARK: - ViewModel
+
+final class MailStore: ObservableObject {
+    @Published var selectedPlatform: MailPlatform = .iCloud
+    @Published var searchText: String = ""
+    @Published var messages: [MailMessage] = [
+        MailMessage(
+            platform: .iCloud,
+            sender: "Tim Cook",
+            subject: "WWDC Notes",
+            preview: "Please review this year’s keynote draft.",
+            date: .now.addingTimeInterval(-3_600),
+            isRead: false,
+            isFlaggedApple: true,
+            isStarredGmail: false,
+            isFlaggedOutlook: false
+        ),
+        MailMessage(
+            platform: .gmail,
+            sender: "Google Workspace",
+            subject: "Storage Summary",
+            preview: "You have 72% of storage used.",
+            date: .now.addingTimeInterval(-8_600),
+            isRead: true,
+            isFlaggedApple: false,
+            isStarredGmail: true,
+            isFlaggedOutlook: false
+        ),
+        MailMessage(
+            platform: .outlook,
+            sender: "Microsoft 365",
+            subject: "Security Alert",
+            preview: "We noticed a sign-in from a new location.",
+            date: .now.addingTimeInterval(-20_000),
+            isRead: false,
+            isFlaggedApple: false,
+            isStarredGmail: false,
+            isFlaggedOutlook: true
+        )
+    ]
+
+    var filteredMessages: [MailMessage] {
+        messages
+            .filter { $0.platform == selectedPlatform }
+            .filter {
+                guard !searchText.isEmpty else { return true }
+                return $0.sender.localizedCaseInsensitiveContains(searchText)
+                    || $0.subject.localizedCaseInsensitiveContains(searchText)
+                    || $0.preview.localizedCaseInsensitiveContains(searchText)
+            }
+            .sorted { $0.date > $1.date }
+    }
+
+    func toggleProviderPriority(for message: MailMessage) {
+        guard let idx = messages.firstIndex(where: { $0.id == message.id }) else { return }
+
+        switch selectedPlatform {
+        case .iCloud:
+            messages[idx].isFlaggedApple.toggle()
+        case .gmail:
+            messages[idx].isStarredGmail.toggle()
+        case .outlook:
+            messages[idx].isFlaggedOutlook.toggle()
+        }
+    }
+
+    func providerPriorityIcon(for message: MailMessage) -> String {
+        switch selectedPlatform {
+        case .iCloud:
+            return message.isFlaggedApple ? "flag.fill" : "flag"
+        case .gmail:
+            return message.isStarredGmail ? "star.fill" : "star"
+        case .outlook:
+            return message.isFlaggedOutlook ? "flag.fill" : "flag"
+        }
+    }
+
+    func providerPriorityColor(for message: MailMessage) -> Color {
+        switch selectedPlatform {
+        case .iCloud:
+            return message.isFlaggedApple ? .orange : .secondary
+        case .gmail:
+            return message.isStarredGmail ? .yellow : .secondary
+        case .outlook:
+            return message.isFlaggedOutlook ? .blue : .secondary
+        }
+    }
+
+    func composeMockMessage() {
+        messages.insert(
+            MailMessage(
+                platform: selectedPlatform,
+                sender: "Draft",
+                subject: "New message (\(selectedPlatform.rawValue))",
+                preview: "This is a mock compose action. Connect your backend/API here.",
+                date: .now,
+                isRead: false,
+                isFlaggedApple: false,
+                isStarredGmail: false,
+                isFlaggedOutlook: false
+            ),
+            at: 0
+        )
+    }
+}
+
+// MARK: - App + UI
+
+@main
+struct MailCloneStarterApp: App {
+    @StateObject private var store = MailStore()
+
+    var body: some Scene {
+        WindowGroup {
+            NavigationStack {
+                MailHomeView()
+                    .environmentObject(store)
+            }
+        }
+    }
+}
+
+struct MailHomeView: View {
+    @EnvironmentObject private var store: MailStore
+
+    var body: some View {
+        List {
+            Section {
+                Picker("Provider", selection: $store.selectedPlatform) {
+                    ForEach(MailPlatform.allCases) { platform in
+                        Text(platform.rawValue).tag(platform)
+                    }
+                }
+                .pickerStyle(.segmented)
+            }
+
+            Section("Inbox") {
+                ForEach(store.filteredMessages) { message in
+                    NavigationLink {
+                        MailDetailView(message: message)
+                    } label: {
+                        HStack(alignment: .top, spacing: 10) {
+                            Circle()
+                                .fill(message.platform.tint)
+                                .frame(width: 10, height: 10)
+                                .padding(.top, 5)
+
+                            VStack(alignment: .leading, spacing: 4) {
+                                Text(message.sender)
+                                    .font(.headline)
+                                    .fontWeight(message.isRead ? .regular : .bold)
+
+                                Text(message.subject)
+                                    .font(.subheadline)
+                                    .lineLimit(1)
+
+                                Text(message.preview)
+                                    .font(.caption)
+                                    .foregroundStyle(.secondary)
+                                    .lineLimit(2)
+                            }
+
+                            Spacer()
+
+                            Button {
+                                store.toggleProviderPriority(for: message)
+                            } label: {
+                                Image(systemName: store.providerPriorityIcon(for: message))
+                                    .foregroundStyle(store.providerPriorityColor(for: message))
+                            }
+                            .buttonStyle(.plain)
+                        }
+                        .padding(.vertical, 4)
+                    }
+                }
+            }
+        }
+        .navigationTitle("Mail Hub")
+        .searchable(text: $store.searchText, prompt: "Search mail")
+        .toolbar {
+            ToolbarItem(placement: .topBarTrailing) {
+                Button {
+                    store.composeMockMessage()
+                } label: {
+                    Image(systemName: "square.and.pencil")
+                }
+                .accessibilityLabel("Compose")
+            }
+        }
+    }
+}
+
+struct MailDetailView: View {
+    let message: MailMessage
+
+    var body: some View {
+        ScrollView {
+            VStack(alignment: .leading, spacing: 12) {
+                Text(message.subject)
+                    .font(.title2.bold())
+
+                HStack {
+                    Text("From: \(message.sender)")
+                    Spacer()
+                    Text(message.date.formatted(date: .abbreviated, time: .shortened))
+                }
+                .font(.caption)
+                .foregroundStyle(.secondary)
+
+                Divider()
+
+                Text(message.preview)
+                    .font(.body)
+
+                Text("Provider flags/stars remain separate across Apple Mail, Gmail, and Outlook.")
+                    .font(.footnote)
+                    .foregroundStyle(.secondary)
+            }
+            .padding()
+        }
+        .navigationTitle("Message")
+        .navigationBarTitleDisplayMode(.inline)
+    }
+}
diff --git a/XCODE_EMAIL_APP_SETUP.md b/XCODE_EMAIL_APP_SETUP.md
new file mode 100644
index 0000000000000000000000000000000000000000..a976e9aa6ec916c298e979a3b63088bb872ee8b0
--- /dev/null
+++ b/XCODE_EMAIL_APP_SETUP.md
@@ -0,0 +1,43 @@
+# Xcode setup (SwiftUI starter)
+
+If you asked “how do I put this in Xcode?”, use either option below.
+
+## Option A (fastest): replace your starter files
+
+1. Open **Xcode** → **Create New Project** → **iOS App**.
+2. Product Name: `MailCloneStarter` (or any name).
+3. Interface: **SwiftUI**. Language: **Swift**. Click **Create**.
+4. In the Project Navigator (left panel), delete:
+   - `ContentView.swift`
+   - `<YourProjectName>App.swift`
+5. Right-click the project folder in Xcode → **Add Files to "<YourProjectName>"...**
+6. Select `EMAIL_APP_XCODE_STARTER.swift` from this repo and ensure:
+   - ✅ **Copy items if needed**
+   - ✅ Your app target is checked under “Add to targets”
+7. Click **Add**.
+8. Press **⌘R** (Run) and choose an iPhone simulator.
+
+## Option B: paste code manually into a new Swift file
+
+1. In Xcode, **File → New → File... → Swift File**.
+2. Name it `EMAIL_APP_XCODE_STARTER.swift`.
+3. Paste the full contents of this repo file into the new file.
+4. Delete `ContentView.swift` and `<YourProjectName>App.swift` so there is only one `@main` app entry.
+5. Press **⌘R**.
+
+## Common issue fixes
+
+- **“No such module SwiftUI”**: You are not building in Xcode on macOS/iOS target.
+- **“Multiple @main declarations”**: Remove the default app file (`<YourProjectName>App.swift`) after adding this starter.
+- **File compiles but not launching**: verify the file is included in your app target (File Inspector → Target Membership).
+
+## What this starter includes
+- Apple Mail / Gmail / Outlook provider switching.
+- Inbox list + message detail UI.
+- **Independent** flag/star behavior by provider:
+  - Apple Mail: `isFlaggedApple`
+  - Gmail: `isStarredGmail`
+  - Outlook: `isFlaggedOutlook`
+
+## Important note
+An app "exactly like" Apple Mail/Gmail/Outlook is not realistically possible 1:1 without their proprietary backend systems and design assets. This starter gives you the same core UX structure and independent starring/flagging logic, and is ready for your API integration.
 
EOF
)
