import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../i18n/translations';
import { PRICES, ROOM_TYPES } from '../data/rooms';
import './RoomPanel.css';

const TODAY = new Date().toISOString().split('T')[0];

function calcNights(inDate, outDate) {
  if (!inDate || !outDate) return 0;
  const diff = (new Date(outDate) - new Date(inDate)) / 86400000;
  return diff > 0 ? Math.round(diff) : 0;
}

function fmtDate(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${parseInt(d)}/${parseInt(m)}/${y}`;
}

export default function RoomPanel({ room, onSave, onCancel }) {
  const { lang, toggleLang } = useLanguage();
  const price   = PRICES[room.type]    ?? 80000;
  const typeKey = ROOM_TYPES[room.type] ?? 'twinSmall';

  /* ── Panel A: vacancy form state ── */
  const [form, setForm] = useState({
    firstName:  '',
    middleName: '',
    lastName:   '',
    age:        '',
    gender:     '',
    phone:      '',
    checkIn:    '',
    checkOut:   '',
  });
  const [errors, setErrors]       = useState({});
  const [submitted, setSubmitted] = useState(false);

  /* ── Panel C: checkout date state ── */
  const [checkOutDate, setCheckOutDate] = useState(TODAY);

  /* ── Computed: Panel A ── */
  const bookedNights = calcNights(form.checkIn, form.checkOut);
  const bookedTotal  = bookedNights * price;

  /* ── Computed: Panel C ── */
  const gd            = room.guestData;
  const checkInDate   = gd?.checkIn ?? '';
  const coNights      = calcNights(checkInDate, checkOutDate);
  const coTotal       = coNights * price;
  const fullName      = [gd?.firstName, gd?.middleName, gd?.lastName].filter(Boolean).join(' ') || '—';
  const genderLabel   = gd?.gender ? (t[gd.gender]?.[lang] ?? gd.gender) : '—';

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (submitted) setErrors(validate({ ...form, [field]: value }));
  }

  function validate(f) {
    const e = {};
    if (!f.firstName.trim()) e.firstName = true;
    if (!f.checkIn)          e.checkIn   = true;
    return e;
  }

  function submitForm(newStatus) {
    setSubmitted(true);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) {
      alert(t.required[lang]);
      return;
    }
    onSave({ ...room, status: newStatus, guestData: { ...form } });
  }

  function handleCheckOut() {
    onSave({ ...room, status: 'vacant', guestData: null });
  }

  function handleCancelBooking() {
    if (!window.confirm(t.confirmCancelBooking[lang])) return;
    onSave({ ...room, status: 'vacant', guestData: null });
  }

  /* ── Title per panel ── */
  const titles = {
    vacant:   t.guestInfo[lang],
    booked:   `${t.booked[lang]} — ${t.roomNo[lang]} ${room.num}`,
    occupied: `${t.occupied[lang]} — ${t.roomNo[lang]} ${room.num}`,
  };

  return (
    <div className="rp-root">

      {/* ── Top bar ── */}
      <header className="rp-topbar">
        <button className="rp-back-btn" onClick={onCancel}>
          &#8249; {t.back[lang]}
        </button>
        <h1 className="rp-title">{titles[room.status]}</h1>
        <button className="rp-lang-pill" onClick={toggleLang}>
          {lang === 'lo' ? 'EN' : 'ລາວ'}
        </button>
      </header>

      {/* ── Body ── */}
      <div className="rp-body">

        {/* ─── Main content area ─── */}
        <div className="rp-main">

          {/* ════════ PANEL A — Vacant ════════ */}
          {room.status === 'vacant' && (
            <>
              <div className="rp-section">
                <h2 className="rp-section-title">{t.guestInfo[lang]}</h2>
                <div className="rp-divider" />

                <div className={`rp-field ${errors.firstName ? 'rp-field--error' : ''}`}>
                  <label className="rp-label">
                    {t.firstName[lang]} <span className="rp-required">*</span>
                  </label>
                  <input
                    className="rp-input"
                    type="text"
                    value={form.firstName}
                    onChange={e => handleChange('firstName', e.target.value)}
                  />
                  {errors.firstName && <span className="rp-error-msg">{t.required[lang]}</span>}
                </div>

                <div className="rp-row">
                  <div className="rp-field rp-field--flex">
                    <label className="rp-label">{t.middleName[lang]}</label>
                    <input className="rp-input" type="text" value={form.middleName}
                      onChange={e => handleChange('middleName', e.target.value)} />
                  </div>
                  <div className="rp-field rp-field--flex">
                    <label className="rp-label">{t.lastName[lang]}</label>
                    <input className="rp-input" type="text" value={form.lastName}
                      onChange={e => handleChange('lastName', e.target.value)} />
                  </div>
                </div>

                <div className="rp-row">
                  <div className="rp-field rp-field--narrow">
                    <label className="rp-label">{t.age[lang]}</label>
                    <input className="rp-input" type="number" min="1" max="120"
                      value={form.age} onChange={e => handleChange('age', e.target.value)} />
                  </div>
                  <div className="rp-field rp-field--flex">
                    <label className="rp-label">{t.gender[lang]}</label>
                    <select className="rp-input rp-select" value={form.gender}
                      onChange={e => handleChange('gender', e.target.value)}>
                      <option value="">{t.select[lang]}</option>
                      <option value="male">{t.male[lang]}</option>
                      <option value="female">{t.female[lang]}</option>
                      <option value="other">{t.other[lang]}</option>
                    </select>
                  </div>
                </div>

                <div className="rp-field rp-field--half">
                  <label className="rp-label">{t.phone[lang]}</label>
                  <input className="rp-input" type="tel" value={form.phone}
                    onChange={e => handleChange('phone', e.target.value)} />
                </div>
              </div>

              <div className="rp-section">
                <h2 className="rp-section-title">{t.stayPeriod[lang]}</h2>
                <div className="rp-divider" />

                <div className="rp-row">
                  <div className={`rp-field rp-field--flex ${errors.checkIn ? 'rp-field--error' : ''}`}>
                    <label className="rp-label">
                      {t.checkIn[lang]} <span className="rp-required">*</span>
                    </label>
                    <input className="rp-input" type="date" value={form.checkIn}
                      onChange={e => handleChange('checkIn', e.target.value)} />
                    {errors.checkIn && <span className="rp-error-msg">{t.required[lang]}</span>}
                  </div>

                  <div className="rp-date-dash">—</div>

                  <div className="rp-field rp-field--flex">
                    <label className="rp-label">{t.checkOutOptional[lang]}</label>
                    <input className="rp-input" type="date" value={form.checkOut}
                      min={form.checkIn || undefined}
                      onChange={e => handleChange('checkOut', e.target.value)} />
                  </div>
                </div>

                {bookedNights > 0 && (
                  <div className="rp-summary">
                    <div className="rp-nights-row">
                      <span className="rp-nights-label">{t.totalNights[lang]}:</span>
                      <span className="rp-nights-value">{bookedNights} {t.nights[lang]}</span>
                    </div>
                    <div className="rp-total-box">
                      <span className="rp-star">★</span>
                      <span className="rp-total-label">{t.totalAmount[lang]}:</span>
                      <span className="rp-total-value">{bookedTotal.toLocaleString()} ກີບ</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ════════ PANEL B — Booked ════════ */}
          {room.status === 'booked' && (
            <>
              <ReadSection title={t.guestInfo[lang]}>
                <ReadRow label={t.firstName[lang]} value={fullName} />
                <ReadRow label={t.age[lang]}       value={gd?.age} />
                <ReadRow label={t.gender[lang]}    value={genderLabel} />
                <ReadRow label={t.phone[lang]}     value={gd?.phone} />
              </ReadSection>
              <ReadSection title={t.stayPeriod[lang]}>
                <ReadRow label={t.checkIn[lang]}  value={fmtDate(gd?.checkIn)} />
                <ReadRow label={t.checkOut[lang]} value={fmtDate(gd?.checkOut)} />
              </ReadSection>
            </>
          )}

          {/* ════════ PANEL C — Occupied ════════ */}
          {room.status === 'occupied' && (
            <>
              <ReadSection title={t.guestInfo[lang]}>
                <ReadRow label={t.firstName[lang]} value={fullName} />
                <ReadRow label={t.age[lang]}       value={gd?.age} />
                <ReadRow label={t.gender[lang]}    value={genderLabel} />
                <ReadRow label={t.phone[lang]}     value={gd?.phone} />
                <ReadRow label={t.checkIn[lang]}   value={fmtDate(checkInDate)} />
              </ReadSection>

              <div className="rp-section">
                <h2 className="rp-section-title">{t.checkOutDate[lang]}</h2>
                <div className="rp-divider" />

                <div className="rp-field rp-field--half">
                  <label className="rp-label">{t.checkOutDate[lang]}</label>
                  <input
                    className="rp-input"
                    type="date"
                    value={checkOutDate}
                    min={checkInDate || undefined}
                    onChange={e => setCheckOutDate(e.target.value)}
                  />
                </div>

                <div className="rp-summary">
                  <div className="rp-nights-row">
                    <span className="rp-nights-label">{t.totalNights[lang]}:</span>
                    <span className="rp-nights-value">
                      {coNights > 0 ? `${coNights} ${t.nights[lang]}` : '—'}
                    </span>
                  </div>
                  <div className="rp-total-box">
                    <span className="rp-star">★</span>
                    <span className="rp-total-label">{t.totalAmount[lang]}:</span>
                    <span className="rp-total-value">
                      {coNights > 0 ? `${coTotal.toLocaleString()} ກີບ` : '—'}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>

        {/* ─── Sidebar ─── */}
        <aside className="rp-sidebar">
          <div className="rp-room-badge">{room.num}</div>
          <p className="rp-room-type">{t[typeKey][lang]}</p>
          <p className="rp-price-row">
            <span className="rp-price-label">{t.pricePerNight[lang]}</span>
            <span className="rp-price-value">{price.toLocaleString()} ກີບ</span>
          </p>

          <div className="rp-sidebar-divider" />

          {/* Panel A buttons */}
          {room.status === 'vacant' && (
            <>
              <button className="rp-btn rp-btn--orange" onClick={() => submitForm('booked')}>
                {t.saveBooked[lang]}
              </button>
              <button className="rp-btn rp-btn--primary" onClick={() => submitForm('occupied')}>
                {t.checkInNow[lang]}
              </button>
            </>
          )}

          {/* Panel B buttons */}
          {room.status === 'booked' && (
            <>
              <button className="rp-btn rp-btn--primary" onClick={() => onSave({ ...room, status: 'occupied' })}>
                {t.checkInNow[lang]}
              </button>
              <button className="rp-btn rp-btn--red-outline" onClick={handleCancelBooking}>
                {t.cancelBooking[lang]}
              </button>
            </>
          )}

          {/* Panel C buttons */}
          {room.status === 'occupied' && (
            <>
              <button className="rp-btn rp-btn--primary" onClick={handleCheckOut}>
                {t.checkOutNow[lang]}
              </button>
              <button className="rp-btn rp-btn--outline" onClick={onCancel}>
                {t.close[lang]}
              </button>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

/* ── Read-only helpers ── */

function ReadSection({ title, children }) {
  return (
    <div className="rp-section">
      <h2 className="rp-section-title">{title}</h2>
      <div className="rp-divider" />
      <div className="rp-read-rows">{children}</div>
    </div>
  );
}

function ReadRow({ label, value }) {
  return (
    <div className="rp-read-row">
      <span className="rp-read-label">{label}</span>
      <span className="rp-read-value">{value || '—'}</span>
    </div>
  );
}
