import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../i18n/translations';
import { getGuestName, ROOM_TYPE_KEYS } from '../data/rooms';
import RoomCard from '../components/RoomCard';
import './Dashboard.css';

const TYPE_LABEL = {
  'twin-s':   t.twinSmall,
  'twin-l':   t.twinLarge,
  'single-s': t.singleSmall,
  'single-l': t.singleLarge,
};

function formatDate(date) {
  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
}

export default function Dashboard({ rooms, onBack, onRoomClick }) {
  const { lang, toggleLang } = useLanguage();

  const today = useMemo(() => new Date(2023, 1, 14), []);
  const [currentDate, setCurrentDate] = useState(today);
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState({ vacant: true, occupied: true, booked: true });
  const [typeFilter, setTypeFilter]   = useState(
    Object.fromEntries(ROOM_TYPE_KEYS.map(k => [k, true]))
  );

  const isToday = formatDate(currentDate) === formatDate(today);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rooms.filter(r => {
      if (!statusFilter[r.status]) return false;
      if (!typeFilter[r.type])     return false;
      if (!q) return true;
      const name = getGuestName(r).toLowerCase();
      return (
        r.num.includes(q) ||
        name.includes(q) ||
        TYPE_LABEL[r.type].lo.includes(q) ||
        TYPE_LABEL[r.type].en.toLowerCase().includes(q)
      );
    });
  }, [rooms, statusFilter, typeFilter, search]);

  const grouped = ROOM_TYPE_KEYS.map(key => ({
    key,
    label: TYPE_LABEL[key],
    rooms: filtered.filter(r => r.type === key),
  })).filter(g => g.rooms.length > 0);

  function shiftDate(days) {
    setCurrentDate(d => {
      const n = new Date(d);
      n.setDate(n.getDate() + days);
      return n;
    });
  }

  return (
    <div className="db-root">

      {/* ── Top bar ── */}
      <header className="db-topbar">
        <button className="db-back-btn" onClick={onBack}>
          &#8249; {t.back[lang]}
        </button>
        <h1 className="db-title">{t.roomStatus[lang]}</h1>
        <button className="db-lang-pill" onClick={toggleLang}>
          {lang === 'lo' ? 'EN' : 'ລາວ'}
        </button>
      </header>

      {/* ── Sub-header ── */}
      <div className="db-subheader">
        <div className="db-date-nav">
          <span className="db-date-icon">&#128197;</span>
          <span className="db-date-text">
            {formatDate(currentDate)}
            {isToday && <span className="db-today-badge">{t.today[lang]}</span>}
          </span>
          <button className="db-nav-btn" onClick={() => shiftDate(-1)}>&#8249;</button>
          <button className="db-nav-btn" onClick={() => shiftDate(1)}>&#8250;</button>
        </div>

        <div className="db-legend">
          <span className="db-legend-dot db-legend-dot--vacant" />
          <span className="db-legend-label">{t.vacant[lang]}</span>
          <span className="db-legend-dot db-legend-dot--occupied" />
          <span className="db-legend-label">{t.occupied[lang]}</span>
          <span className="db-legend-dot db-legend-dot--booked" />
          <span className="db-legend-label">{t.booked[lang]}</span>
        </div>

        <input
          className="db-search"
          placeholder={t.searchPlaceholder[lang]}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="db-body">

        {/* ── Sidebar filters ── */}
        <aside className="db-sidebar">
          <p className="db-filter-heading">{t.status[lang]}</p>
          {[
            { key: 'vacant',   label: t.vacant },
            { key: 'occupied', label: t.occupied },
            { key: 'booked',   label: t.booked },
          ].map(s => (
            <label key={s.key} className="db-checkbox-label">
              <input
                type="checkbox"
                checked={statusFilter[s.key]}
                onChange={() => setStatusFilter(p => ({ ...p, [s.key]: !p[s.key] }))}
              />
              <span>{s.label[lang]}</span>
            </label>
          ))}

          <p className="db-filter-heading" style={{ marginTop: 20 }}>{t.type[lang]}</p>
          {ROOM_TYPE_KEYS.map(key => (
            <label key={key} className="db-checkbox-label">
              <input
                type="checkbox"
                checked={typeFilter[key]}
                onChange={() => setTypeFilter(p => ({ ...p, [key]: !p[key] }))}
              />
              <span>{TYPE_LABEL[key][lang]}</span>
            </label>
          ))}
        </aside>

        {/* ── Room grid ── */}
        <main className="db-main">
          {grouped.map(group => (
            <section key={group.key} className="db-section">
              <h2 className="db-section-title">{group.label[lang]}</h2>
              <div className="db-room-grid">
                {group.rooms.map(room => (
                  <RoomCard
                    key={room.num}
                    room={room}
                    onClick={() => onRoomClick?.(room)}
                  />
                ))}
              </div>
            </section>
          ))}
          {grouped.length === 0 && (
            <p className="db-empty">{t.noRoomsFound[lang]}</p>
          )}
        </main>
      </div>
    </div>
  );
}
