import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Email } from '../store/emailStore';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 80;

interface SwipeableEmailItemProps {
  item: Email;
  theme: any;
  isSelected: boolean;
  isSelectionMode: boolean;
  accountColor: string;
  onPress: () => void;
  onLongPress: () => void;
  onToggleSelection: () => void;
  onToggleFlag: () => void;
  onDelete: () => void;
  onArchive: () => void;
  onToggleRead: () => void;
}

export default function SwipeableEmailItem({
  item,
  theme,
  isSelected,
  isSelectionMode,
  accountColor,
  onPress,
  onLongPress,
  onToggleSelection,
  onToggleFlag,
  onDelete,
  onArchive,
  onToggleRead,
}: SwipeableEmailItemProps) {
  const translateX = React.useRef(new Animated.Value(0)).current;
  const [swipeDirection, setSwipeDirection] = React.useState<'left' | 'right' | null>(null);

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isSelectionMode,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return !isSelectionMode && Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx > 0) {
          setSwipeDirection('right');
        } else {
          setSwipeDirection('left');
        }
        translateX.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > SWIPE_THRESHOLD) {
          // Swipe right - Archive
          Animated.timing(translateX, {
            toValue: SCREEN_WIDTH,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onArchive();
            translateX.setValue(0);
          });
        } else if (gestureState.dx < -SWIPE_THRESHOLD) {
          // Swipe left - Delete
          Animated.timing(translateX, {
            toValue: -SCREEN_WIDTH,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onDelete();
            translateX.setValue(0);
          });
        } else {
          // Snap back
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 10,
          }).start();
        }
        setSwipeDirection(null);
      },
    })
  ).current;

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      {/* Left action (Archive - green) */}
      <View style={[styles.actionContainer, styles.leftAction]}>
        <View style={styles.actionContent}>
          <Ionicons name="archive" size={24} color="#fff" />
          <Text style={styles.actionText}>Archive</Text>
        </View>
      </View>

      {/* Right action (Delete - red) */}
      <View style={[styles.actionContainer, styles.rightAction]}>
        <View style={[styles.actionContent, { alignItems: 'flex-end' }]}>
          <Ionicons name="trash" size={24} color="#fff" />
          <Text style={styles.actionText}>Delete</Text>
        </View>
      </View>

      {/* Email content */}
      <Animated.View
        style={[
          styles.emailItem,
          isSelected && styles.emailItemSelected,
          { transform: [{ translateX }] },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={styles.touchable}
          onPress={onPress}
          onLongPress={onLongPress}
          activeOpacity={0.7}
        >
          {isSelectionMode && (
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={onToggleSelection}
            >
              <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
              </View>
            </TouchableOpacity>
          )}
          <View style={styles.emailContent}>
            <View style={styles.emailHeader}>
              <View style={styles.senderRow}>
                <View
                  style={[
                    styles.accountIndicator,
                    { backgroundColor: accountColor },
                  ]}
                />
                <Text style={[styles.sender, !item.isRead && styles.unread]} numberOfLines={1}>
                  {item.fromName}
                </Text>
              </View>
              <View style={styles.dateRow}>
                {item.hasAttachments && (
                  <Ionicons name="attach" size={14} color={theme.textSecondary} style={styles.attachIcon} />
                )}
                <Text style={styles.date}>{item.date}</Text>
              </View>
            </View>
            <View style={styles.subjectRow}>
              {!item.isRead && <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />}
              <Text style={[styles.subject, !item.isRead && styles.unread]} numberOfLines={1}>
                {item.subject}
              </Text>
            </View>
            <Text style={styles.snippet} numberOfLines={2}>
              {item.snippet}
            </Text>
          </View>
          {!isSelectionMode && (
            <TouchableOpacity
              style={styles.flagBtn}
              onPress={onToggleFlag}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={item.isFlagged ? 'flag' : 'flag-outline'}
                size={18}
                color={item.isFlagged ? '#FF9500' : theme.textSecondary}
              />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  actionContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    width: '100%',
  },
  leftAction: {
    left: 0,
    backgroundColor: '#34C759',
  },
  rightAction: {
    right: 0,
    backgroundColor: '#FF3B30',
  },
  actionContent: {
    paddingHorizontal: 20,
    alignItems: 'flex-start',
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  emailItem: {
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  emailItemSelected: {
    backgroundColor: theme.isDark ? '#1a3a5c' : '#E3EFFF',
  },
  touchable: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  checkboxContainer: {
    justifyContent: 'center',
    paddingRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  emailContent: {
    flex: 1,
  },
  emailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  senderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accountIndicator: {
    width: 4,
    height: 16,
    borderRadius: 2,
    marginRight: 8,
  },
  sender: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    flex: 1,
  },
  unread: {
    fontWeight: '700',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attachIcon: {
    marginRight: 4,
  },
  date: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  subject: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.text,
    flex: 1,
  },
  snippet: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
  },
  flagBtn: {
    justifyContent: 'center',
    paddingLeft: 12,
  },
});
