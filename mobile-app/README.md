# Mobile Application (React Native)

This directory houses the cross-platform React Native client application (targeting Android for the MVP release with zero barrier to future iOS rollout).

## Key User Experience Pillars
1. **Reels-First Launch Screen**: Opens immediately into a vertical full-screen short video feed without forcing prior sign-up or profile creation.
2. **One-Tap Identity Dashboard**: Bottom navigation tab `My Profile` provides instant access to the personal identity dashboard.
3. **Dedicated Reel Creator (`+`)**: Prominent action on My Profile allowing camera capture or gallery selection, trimming, cover selection, and audience privacy selection.
4. **Privacy-Preserving Mobile Discovery**: Exact phone number search screen that only reveals profiles if the owner explicitly opted in.
5. **Universal Sharing**: Profile link generator, native WhatsApp share, and dynamic QR code generation.

## Reusable Component Architecture
- `components/atoms/`: `<Typography />`, `<AppButton />`, `<AppTextInput />`, `<Avatar />`, `<IconBadge />`
- `components/molecules/`: `<SectionItem />`, `<MetricCounter />`, `<SearchInput />`, `<PrivacyToggle />`
- `components/organisms/`:
  - `<ReelPlayerItem />`: Vertical full-screen video player with swipe gesture handlers and overlay controls.
  - `<ReelCreatorModal />`: Video trim, cover picker, and caption input.
  - `<ProfileHeaderCard />`: User photo, handle, completion progress bar.
  - `<ProfileSectionList />`: Dynamic list of profile sections.
  - `<QrCodeDisplayCard />`: QR card with share, save, and copy link actions.

## Directory Layout
```
mobile-app/
├── src/
│   ├── assets/               # Fonts, local placeholders, lotties
│   ├── components/           # Atoms, Molecules, Organisms, Templates
│   ├── navigation/           # React Navigation (BottomTab, Auth, Root)
│   ├── screens/
│   │   ├── splash/
│   │   ├── auth/             # Login & OTP screens
│   │   ├── feed/             # ReelsHomeScreen
│   │   ├── profile/          # MyProfileScreen, EditProfileScreen
│   │   ├── reel-creation/    # Camera, Trim, Editor, Publish
│   │   └── discovery/        # PhoneLookupScreen
│   ├── services/             # API client, video cache, analytics
│   ├── store/                # Zustand / Redux state stores
│   ├── hooks/                # Custom React hooks
│   └── theme/                # Color palettes, spacing tokens
├── package.json
└── App.js
```
