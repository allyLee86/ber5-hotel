# Ber 5 Hotel Management

React SPA — no router. Navigation is a `screen` string in `App.js` state.

## Stack
- React (Create React App), CSS modules per page, no UI library
- Bilingual: Lao (`lo`) + English (`en`) via `useLanguage()` + `t` object in `src/i18n/translations.js`
- Font: Noto Sans Lao throughout

## Screen routing
`App.js` holds all state and renders one screen at a time via `if (screen === '...')`.
Screen names: `login` → `adminmenu` → `dashboard` | `roompanel` | `receipt` | `guestinfo` | `stayhistory` | `roommanagement` | `usermanagement`
`AdminMenu` fires nav keys mapped via `SCREEN_MAP` in `App.js`.

## Key data shapes

**Room** (`src/data/rooms.js`):
```js
{ num, type, status: 'vacant'|'booked'|'occupied', guestData: null | GuestData }
```
Room types: `twin-s`, `twin-l`, `single-s`, `single-l`
Prices in `PRICES`, type→translation key in `ROOM_TYPES`.

**GuestData** (stored on room while staying):
```js
{ nickName, firstName, middleName, lastName, age, gender,
  phone, idCard, passportId, checkIn, checkOut }
```
Nick Name is optional (no required validation). Check-in is required.

**Guest record** (`App.js` `guests` state — master deduplicated list):
```js
{ id, nickName, firstName, middleName, lastName, age, gender,
  phone, idCard, passportId,
  guestType: 'identified'|'anonymous',
  stays: [{ id, roomNum, roomType, checkIn, checkOut, nights, total, status: 'current'|'completed' }] }
```
Deduplication: match by phone OR idCard OR passportId.
`guestType` auto-computed: identified = has phone/idCard/passportId.

## CSS convention
Each page has its own `.css` with a scoped prefix:
`ci-` CheckIn, `rp-` RoomPanel, `rc-` Receipt, `gi-` GuestInfo,
`sh-` StayHistory, `rm-` RoomManagement, `um-` UserManagement, `am-` AdminMenu

## Translation pattern
```js
// Add to src/i18n/translations.js:
myKey: { lo: 'ລາວ', en: 'English' }
// Use in components:
t.myKey[lang]
```
Always add new keys to `translations.js` before using them in components.

## Guest checkout flow
`RoomPanel` calls `onSave(updatedRoom)` → `App.handleSaveRoom` detects:
- vacant → occupied/booked: calls `upsertGuest()`, updates `guests` state
- occupied → vacant: records to `stayHistory`, calls `completeGuestStay()`, navigates to `receipt`

## Rules of Hooks
All hooks must be declared before any early `return`. Components that conditionally render a full-screen view (e.g. StayHistory showing Receipt) must declare all `useState`/`useMemo` first, then do the conditional return.
