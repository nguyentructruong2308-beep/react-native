import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export default function Settings() {
  const router = useRouter();
  const { theme, themeMode, setThemeMode, isDark } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const colors = theme.colors;

  const SettingItem = ({ 
    icon, 
    title, 
    value, 
    onPress, 
    showArrow = true,
    rightComponent
  }: {
    icon: string;
    title: string;
    value?: string;
    onPress?: () => void;
    showArrow?: boolean;
    rightComponent?: React.ReactNode;
  }) => (
    <TouchableOpacity 
      style={[styles.settingItem, { backgroundColor: colors.card }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.iconWrapper, { backgroundColor: colors.primaryLight }]}>
        <Ionicons name={icon as any} size={22} color={colors.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
        {value && <Text style={[styles.settingValue, { color: colors.textSecondary }]}>{value}</Text>}
      </View>
      {rightComponent}
      {showArrow && !rightComponent && (
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      )}
    </TouchableOpacity>
  );

  const SectionTitle = ({ title }: { title: string }) => (
    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{title}</Text>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('settings')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* 🎨 Giao diện */}
        <SectionTitle title={t('appearance')} />
        
        <SettingItem
          icon="moon-outline"
          title={t('darkMode')}
          rightComponent={
            <Switch
              value={isDark}
              onValueChange={(value) => setThemeMode(value ? 'dark' : 'light')}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={isDark ? '#FFF' : '#FFF'}
            />
          }
          showArrow={false}
        />
        
        <View style={[styles.themeOptions, { backgroundColor: colors.card }]}>
          {(['light', 'dark', 'system'] as const).map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[
                styles.themeOption,
                themeMode === mode && { backgroundColor: colors.primaryLight, borderColor: colors.primary }
              ]}
              onPress={() => setThemeMode(mode)}
            >
              <Ionicons 
                name={mode === 'light' ? 'sunny' : mode === 'dark' ? 'moon' : 'phone-portrait'} 
                size={20} 
                color={themeMode === mode ? colors.primary : colors.textSecondary} 
              />
              <Text style={[
                styles.themeOptionText,
                { color: themeMode === mode ? colors.primary : colors.textSecondary }
              ]}>
                {t(mode)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 🌐 Ngôn ngữ */}
        <SectionTitle title={t('language')} />
        
        <View style={[styles.languageOptions, { backgroundColor: colors.card }]}>
          <TouchableOpacity
            style={[
              styles.languageOption,
              language === 'vi' && { backgroundColor: colors.primaryLight, borderColor: colors.primary }
            ]}
            onPress={() => setLanguage('vi')}
          >
            <Text style={styles.flag}>🇻🇳</Text>
            <Text style={[
              styles.languageText,
              { color: language === 'vi' ? colors.primary : colors.text }
            ]}>
              {t('vietnamese')}
            </Text>
            {language === 'vi' && (
              <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
          
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          
          <TouchableOpacity
            style={[
              styles.languageOption,
              language === 'en' && { backgroundColor: colors.primaryLight, borderColor: colors.primary }
            ]}
            onPress={() => setLanguage('en')}
          >
            <Text style={styles.flag}>🇺🇸</Text>
            <Text style={[
              styles.languageText,
              { color: language === 'en' ? colors.primary : colors.text }
            ]}>
              {t('english')}
            </Text>
            {language === 'en' && (
              <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        </View>

        {/* 🔔 Thông báo */}
        <SectionTitle title={t('notifications')} />
        
        <SettingItem
          icon="notifications-outline"
          title={t('notifications')}
          rightComponent={
            <Switch
              value={true}
              onValueChange={() => {}}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFF"
            />
          }
          showArrow={false}
        />

        {/* 🔐 Bảo mật */}
        <SectionTitle title="Bảo mật" />
        
        <SettingItem
          icon="lock-closed-outline"
          title={t('changePassword')}
          onPress={() => router.push('/auth/change-password' as any)}
        />

        {/* ℹ️ Thông tin */}
        <SectionTitle title="Thông tin" />
        
        <SettingItem
          icon="information-circle-outline"
          title="Phiên bản"
          value="1.0.0"
          showArrow={false}
        />

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 24,
    marginBottom: 12,
    marginLeft: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 13,
    marginTop: 2,
  },
  themeOptions: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 8,
    gap: 8,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeOptionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  languageOptions: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  flag: {
    fontSize: 24,
  },
  languageText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
});