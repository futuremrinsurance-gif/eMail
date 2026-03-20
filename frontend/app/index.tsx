import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Sidebar from '../src/components/Sidebar';
import EmailList from '../src/components/EmailList';
import EmailViewer from '../src/components/EmailViewer';
import { useEmailStore } from '../src/store/emailStore';

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const { selectedEmailId, setSelectedEmail } = useEmailStore();

  // Responsive breakpoints
  const isTablet = width >= 768;
  const isLargeScreen = width >= 1024;

  const handleMenuPress = useCallback(() => {
    setSidebarVisible(true);
  }, []);

  const handleComposePress = useCallback(() => {
    router.push('/compose');
  }, [router]);

  const handleCloseSidebar = useCallback(() => {
    setSidebarVisible(false);
  }, []);

  // Large screen: 3-pane layout
  if (isLargeScreen) {
    return (
      <View style={styles.container}>
        <View style={styles.sidebarLarge}>
          <Sidebar />
        </View>
        <View style={styles.listPaneLarge}>
          <EmailList onComposePress={handleComposePress} />
        </View>
        <View style={styles.viewerPaneLarge}>
          {selectedEmailId ? (
            <EmailViewer emailId={selectedEmailId} />
          ) : (
            <View style={styles.emptyViewer}>
              <EmailViewer emailId="" />
            </View>
          )}
        </View>
      </View>
    );
  }

  // Tablet: 2-pane layout
  if (isTablet) {
    return (
      <View style={styles.container}>
        <Modal
          visible={sidebarVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={handleCloseSidebar}
        >
          <SafeAreaView style={styles.modalSidebar}>
            <Sidebar onClose={handleCloseSidebar} />
          </SafeAreaView>
        </Modal>
        <View style={styles.listPaneTablet}>
          <EmailList
            onMenuPress={handleMenuPress}
            onComposePress={handleComposePress}
          />
        </View>
        <View style={styles.viewerPaneTablet}>
          {selectedEmailId ? (
            <EmailViewer emailId={selectedEmailId} />
          ) : (
            <EmailViewer emailId="" />
          )}
        </View>
      </View>
    );
  }

  // Mobile: Single pane with modal sidebar
  return (
    <View style={styles.container}>
      <Modal
        visible={sidebarVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseSidebar}
      >
        <SafeAreaView style={styles.modalSidebar}>
          <Sidebar onClose={handleCloseSidebar} />
        </SafeAreaView>
      </Modal>
      <EmailList
        onMenuPress={handleMenuPress}
        onComposePress={handleComposePress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F5F5F7',
  },
  // Large screen (3-pane)
  sidebarLarge: {
    width: 280,
    borderRightWidth: 1,
    borderRightColor: '#E5E5EA',
  },
  listPaneLarge: {
    width: 380,
    borderRightWidth: 1,
    borderRightColor: '#E5E5EA',
  },
  viewerPaneLarge: {
    flex: 1,
  },
  // Tablet (2-pane)
  listPaneTablet: {
    width: 380,
    borderRightWidth: 1,
    borderRightColor: '#E5E5EA',
  },
  viewerPaneTablet: {
    flex: 1,
  },
  // Mobile & shared
  modalSidebar: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  emptyViewer: {
    flex: 1,
  },
});
