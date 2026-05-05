import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../i18n/translations';
import './GuestInfo.css';

function fmtDate(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${parseInt(d)}/${parseInt(m)}/${y}`;
}

function guestFullName(g) {
  if (!g) return '—';
  return [g.nickName, g.firstName, g.middleName, g.lastName].filter(Boolean).join(' ') || '—';
}

function guestInitials(g) {
  const first = (g.nickName || g.firstName || '').trim();
  return first.slice(0, 2).toUpperCase() || '?';
}

export default function GuestInfo({ guests, onBack }) {
  const { lang, toggleLang } = useLanguage();
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return guests;
    return guests.filter(g => {
      const name = guestFullName(g).toLowerCase();
      return (
        name.includes(q) ||
        (g.phone      && g.phone.includes(q)) ||
        (g.idCard     && g.idCard.toLowerCase().includes(q)) ||
        (g.passportId && g.passportId.toLowerCase().includes(q))
      );
    });
  }, [guests, search]);

  return (
    <div className="gi-root">

      {/* ── Top bar ── */}
      <header className="gi-topbar">
        <button className="gi-back-btn" onClick={onBack}>
          &#8249; {t.back[lang]}
        </button>
        <h1 className="gi-title">{t.guestInfo[lang]}</h1>
        <button className="gi-lang-pill" onClick={toggleLang}>
          {lang === 'lo' ? 'EN' : 'ລາວ'}
        </button>
      </header>

      {/* ── Search bar ── */}
      <div className="gi-searchbar">
        <SearchIcon />
        <input
          className="gi-search-input"
          placeholder={t.searchGuestPlaceholder[lang]}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button className="gi-search-clear" onClick={() => setSearch('')}>✕</button>
        )}
      </div>

      {/* ── Guest list ── */}
      <div className="gi-list">
        {filtered.length === 0 ? (
          <p className="gi-empty">
            {guests.length === 0 ? t.noCurrentGuests[lang] : t.noRoomsFound[lang]}
          </p>
        ) : (
          filtered.map(guest => (
            <GuestCard
              key={guest.id}
              guest={guest}
              lang={lang}
              onClick={() => setSelected(guest)}
            />
          ))
        )}
      </div>

      {/* ── Detail modal ── */}
      {selected && (
        <DetailModal
          guest={selected}
          lang={lang}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

/* ── Guest card ── */

function GuestCard({ guest, lang, onClick }) {
  const fullName    = guestFullName(guest);
  const initials    = guestInitials(guest);
  const currentStay = guest.stays.find(s => s.status === 'current');
  const stayCount   = guest.stays.length;

  return (
    <button className="gi-card" onClick={onClick}>
      <div className={`gi-avatar gi-avatar--${guest.guestType}`}>{initials}</div>

      <div className="gi-card-body">
        <div className="gi-card-name-row">
          <span className="gi-card-name">{fullName}</span>
          <span className={`gi-type-chip gi-type-chip--${guest.guestType}`}>
            {t[guest.guestType]?.[lang]}
          </span>
        </div>
        {guest.phone && <span className="gi-card-phone">📞 {guest.phone}</span>}
        <div className="gi-card-meta">
          {currentStay && (
            <span className="gi-current-badge">
              {t.roomNo[lang]} {currentStay.roomNum}
            </span>
          )}
          <span className="gi-stay-count">
            {stayCount} {t.stayCount[lang]}
          </span>
        </div>
      </div>

      <ChevronIcon />
    </button>
  );
}

/* ── Detail modal ── */

function DetailModal({ guest, lang, onClose }) {
  const fullName    = guestFullName(guest);
  const initials    = guestInitials(guest);
  const genderLabel = guest.gender ? (t[guest.gender]?.[lang] ?? guest.gender) : '—';

  function handleOverlay(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className="gi-overlay" onClick={handleOverlay}>
      <div className="gi-modal" role="dialog" aria-modal="true">

        <button className="gi-modal-x" onClick={onClose} aria-label="Close">✕</button>

        {/* ── Modal header ── */}
        <div className="gi-modal-header">
          <div className={`gi-avatar gi-avatar--lg gi-avatar--${guest.guestType}`}>
            {initials}
          </div>
          <div className="gi-modal-header-info">
            <p className="gi-modal-name">{fullName}</p>
            <span className={`gi-type-chip gi-type-chip--${guest.guestType}`}>
              {t[guest.guestType]?.[lang]}
            </span>
          </div>
        </div>

        <div className="gi-modal-rule" />

        {/* ── Personal info ── */}
        <p className="gi-modal-section-title">{t.guestInfo[lang]}</p>
        <div className="gi-modal-rows">
          <MRow label={t.nickName[lang]}   value={guest.nickName} />
          <MRow label={t.firstName[lang]}  value={guest.firstName} />
          <MRow label={t.middleName[lang]} value={guest.middleName} />
          <MRow label={t.lastName[lang]}   value={guest.lastName} />
          <MRow label={t.age[lang]}        value={guest.age} />
          <MRow label={t.gender[lang]}     value={genderLabel} />
          <MRow label={t.phone[lang]}      value={guest.phone} />
          <MRow label={t.idCard[lang]}     value={guest.idCard} />
          <MRow label={t.passportId[lang]} value={guest.passportId} />
        </div>

        <div className="gi-modal-rule" />

        {/* ── Stay history ── */}
        <p className="gi-modal-section-title">{t.stayHistory[lang]}</p>
        {guest.stays.length === 0 ? (
          <p className="gi-modal-no-stays">{t.noStayHistory[lang]}</p>
        ) : (
          <div className="gi-stays-wrap">
            <table className="gi-stays-table">
              <thead>
                <tr>
                  <th>{t.roomNo[lang]}</th>
                  <th>{t.checkIn[lang]}</th>
                  <th>{t.checkOut[lang]}</th>
                  <th>{t.nights[lang]}</th>
                  <th>{t.status[lang]}</th>
                </tr>
              </thead>
              <tbody>
                {guest.stays.map(stay => (
                  <tr key={stay.id}>
                    <td>{stay.roomNum}</td>
                    <td>{fmtDate(stay.checkIn)}</td>
                    <td>{stay.checkOut ? fmtDate(stay.checkOut) : '—'}</td>
                    <td>{stay.nights ?? '—'}</td>
                    <td>
                      <span className={`gi-stay-status gi-stay-status--${stay.status}`}>
                        {stay.status === 'current' ? t.currentStay[lang] : t.completed[lang]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button className="gi-modal-close-btn" onClick={onClose}>
          {t.close[lang]}
        </button>
      </div>
    </div>
  );
}

function MRow({ label, value }) {
  return (
    <div className="gi-modal-row">
      <span className="gi-modal-label">{label}</span>
      <span className="gi-modal-value">{value || '—'}</span>
    </div>
  );
}

/* ── Icons ── */

function SearchIcon() {
  return (
    <svg className="gi-search-icon" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg className="gi-chevron" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
