import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../i18n/translations';
import { ROOM_TYPES, PRICES } from '../data/rooms';
import Receipt from './Receipt';
import './StayHistory.css';

function fmtDate(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${parseInt(d)}/${parseInt(m)}/${y}`;
}

function guestFullName(gd) {
  if (!gd) return '—';
  return [gd.nickName, gd.firstName, gd.middleName, gd.lastName]
    .filter(Boolean).join(' ') || '—';
}

function invoiceNo(record) {
  const base = (record.room.num + (record.guestData?.checkIn ?? '')).replace(/\D/g, '');
  const seed  = parseInt(base || '60000', 10);
  return String((seed % 90000) + 10000);
}

export default function StayHistory({ history, onBack }) {
  const { lang, toggleLang } = useLanguage();
  const [search, setSearch]     = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo]     = useState('');
  const [viewRecord, setViewRecord] = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return history.filter(rec => {
      if (dateFrom && rec.checkOutDate < dateFrom) return false;
      if (dateTo   && rec.checkOutDate > dateTo)   return false;
      if (!q) return true;
      const name = guestFullName(rec.guestData).toLowerCase();
      return name.includes(q) || rec.room.num.includes(q);
    });
  }, [history, search, dateFrom, dateTo]);

  const totalNights  = filtered.reduce((s, r) => s + (r.nights ?? 0), 0);
  const totalRevenue = filtered.reduce((s, r) => s + (r.total  ?? 0), 0);

  /* ── Show Receipt full-screen when a record is selected ── */
  if (viewRecord) {
    const price = PRICES[viewRecord.room.type] ?? 80000;
    return (
      <Receipt
        checkout={{
          guest:        viewRecord.guestData,
          room:         viewRecord.room,
          checkOutDate: viewRecord.checkOutDate,
          nights:       viewRecord.nights,
          total:        viewRecord.total,
          price,
        }}
        onBack={() => setViewRecord(null)}
      />
    );
  }

  return (
    <div className="sh-root">

      {/* ── Top bar ── */}
      <header className="sh-topbar">
        <button className="sh-back-btn" onClick={onBack}>
          &#8249; {t.back[lang]}
        </button>
        <h1 className="sh-title">{t.stayHistory[lang]}</h1>
        <button className="sh-lang-pill" onClick={toggleLang}>
          {lang === 'lo' ? 'EN' : 'ລາວ'}
        </button>
      </header>

      {/* ── Filters ── */}
      <div className="sh-filters">
        {/* Date range */}
        <div className="sh-filter-group">
          <label className="sh-filter-label">{t.dateFrom[lang]}</label>
          <input
            className="sh-date-input"
            type="date"
            value={dateFrom}
            max={dateTo || undefined}
            onChange={e => setDateFrom(e.target.value)}
          />
        </div>
        <span className="sh-filter-dash">—</span>
        <div className="sh-filter-group">
          <label className="sh-filter-label">{t.dateTo[lang]}</label>
          <input
            className="sh-date-input"
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={e => setDateTo(e.target.value)}
          />
        </div>

        {/* Search */}
        <div className="sh-search-wrap">
          <SearchIcon />
          <input
            className="sh-search"
            placeholder={t.searchPlaceholder[lang]}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="sh-search-clear" onClick={() => setSearch('')}>✕</button>
          )}
        </div>
      </div>

      {/* ── Summary bar ── */}
      <div className="sh-summary">
        <SummaryItem label={t.totalStays[lang]}   value={filtered.length} />
        <div className="sh-summary-divider" />
        <SummaryItem label={t.totalNights[lang]}  value={`${totalNights} ${t.nights[lang]}`} />
        <div className="sh-summary-divider" />
        <SummaryItem label={t.totalRevenue[lang]} value={`${totalRevenue.toLocaleString()} ກີບ`} highlight />
      </div>

      {/* ── Table ── */}
      <div className="sh-table-wrap">
        {filtered.length === 0 ? (
          <p className="sh-empty">{history.length === 0 ? t.noHistory[lang] : t.noRoomsFound[lang]}</p>
        ) : (
          <table className="sh-table">
            <thead>
              <tr>
                <th>{t.invoiceNo[lang]}</th>
                <th>{t.guestName[lang]}</th>
                <th>{t.roomNo[lang]}</th>
                <th>{t.type[lang]}</th>
                <th>{t.checkIn[lang]}</th>
                <th>{t.checkOut[lang]}</th>
                <th>{t.nights[lang]}</th>
                <th>{t.totalAmount[lang]}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(rec => {
                const typeKey = ROOM_TYPES[rec.room.type] ?? 'twinSmall';
                return (
                  <tr key={rec.id}>
                    <td className="sh-cell-invoice">#{invoiceNo(rec)}</td>
                    <td className="sh-cell-name">{guestFullName(rec.guestData)}</td>
                    <td className="sh-cell-room">{rec.room.num}</td>
                    <td>{t[typeKey]?.[lang] ?? rec.room.type}</td>
                    <td>{fmtDate(rec.guestData?.checkIn)}</td>
                    <td>{fmtDate(rec.checkOutDate)}</td>
                    <td className="sh-cell-center">{rec.nights ?? 0}</td>
                    <td className="sh-cell-total">{(rec.total ?? 0).toLocaleString()} ກີບ</td>
                    <td>
                      <button
                        className="sh-view-btn"
                        onClick={() => setViewRecord(rec)}
                      >
                        {t.view[lang]}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function SummaryItem({ label, value, highlight }) {
  return (
    <div className="sh-summary-item">
      <span className="sh-summary-label">{label}</span>
      <span className={`sh-summary-value ${highlight ? 'sh-summary-value--hl' : ''}`}>
        {value}
      </span>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
