import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import EmailViewer from '../../src/components/EmailViewer';
import { useEmailStore } from '../../src/store/emailStore';

export default function EmailDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { markAsRead } = useEmailStore();

  React.useEffect(() => {
    if (id) {
      markAsRead(id);
    }
  }, [id]);

  return <EmailViewer emailId={id || ''} />;
}
