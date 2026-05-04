import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../i18n/translations';
import './AdminMenu.css';

const NAV_ITEMS = [
  { key: 'room-status',      tKey: 'roomStatus',   icon: <GridIcon /> },
  { key: 'guest-info',       tKey: 'guestInfo',    icon: <GuestIcon /> },
  { key: 'stay-history',     tKey: 'stayHistory',  icon: <HistoryIcon /> },
  { key: 'room-management',  tKey: 'manageRooms',  icon: <RoomIcon /> },
  { key: 'user-management',  tKey: 'manageUsers',  icon: <UsersIcon /> },
];

export default function AdminMenu({ user, onNavigate, onLogout }) {
  const { lang, toggleLang } = useLanguage();
  const username = user?.username ?? 'Admin';
  const role     = user?.role     ?? 'Administrator';

  return (
    <div className="am-page">
      <div className="am-card">

        {/* Left: avatar + identity */}
        <div className="am-profile">
          <div className="am-avatar"><AvatarIcon /></div>
          <p className="am-username">{username}</p>
          <p className="am-role">{role}</p>

          {/* Language toggle inside profile panel */}
          <button className="am-lang-pill" onClick={toggleLang}>
            {lang === 'lo' ? 'EN' : 'ລາວ'}
          </button>
        </div>

        <div className="am-divider" />

        {/* Right: navigation buttons */}
        <div className="am-nav">
          <ul className="am-nav-list">
            {NAV_ITEMS.map(item => (
              <li key={item.key}>
                <button className="am-nav-btn" onClick={() => onNavigate(item.key)}>
                  <span className="am-nav-icon">{item.icon}</span>
                  <span className="am-nav-text">
                    <span className="am-nav-lo">{t[item.tKey][lang]}</span>
                    {/* Show the other language as subtitle */}
                    <span className="am-nav-en">
                      {t[item.tKey][lang === 'lo' ? 'en' : 'lo']}
                    </span>
                  </span>
                  <span className="am-nav-arrow">&#8250;</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="am-logout-row">
            <button className="am-logout-btn" onClick={onLogout}>
              {t.logout[lang]}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ── Icons ── */
function AvatarIcon() {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="30" r="18" fill="white" opacity="0.9" />
      <ellipse cx="40" cy="68" rx="26" ry="16" fill="white" opacity="0.9" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function GuestIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 15" />
    </svg>
  );
}

function RoomIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12L12 4l9 8" />
      <path d="M5 10v9a1 1 0 0 0 1 1h4v-5h4v5h4a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3.5" /><path d="M2 20c0-3.5 3.1-6 7-6s7 2.5 7 6" />
      <circle cx="18" cy="8" r="2.5" /><path d="M22 20c0-2.5-2-4.5-4.5-4.5" />
    </svg>
  );
}
