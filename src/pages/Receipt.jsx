import React, { useMemo, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../i18n/translations';
import { PRICES, ROOM_TYPES } from '../data/rooms';
import './Receipt.css';

function fmtDate(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${parseInt(d)}/${parseInt(m)}/${y}`;
}

function fmtMoney(n) {
  return Number(n).toLocaleString();
}

export default function Receipt({ checkout, onBack }) {
  const { lang, toggleLang } = useLanguage();

  /* ── All hooks must run unconditionally ── */
  const roomId = checkout?.room?.num ?? '??';

  const invoiceNo = useMemo(() => {
    const base = (roomId + (checkout?.guest?.checkIn ?? '')).replace(/\D/g, '');
    const seed  = parseInt(base || '60000', 10);
    return String((seed % 90000) + 10000);
  }, [roomId, checkout?.guest?.checkIn]);

  useEffect(() => {
    if (!checkout) onBack?.();
  }, [checkout, onBack]);

  if (!checkout) return null;

  /* ── Data from checkout prop ── */
  const { guest, room, checkOutDate, nights, total } = checkout;
  const price       = PRICES[room?.type]     ?? 80000;
  const typeKey     = ROOM_TYPES[room?.type] ?? 'twinSmall';
  const genderLabel = guest?.gender ? (t[guest.gender]?.[lang] ?? guest.gender) : '—';
  const fullName    = [guest?.firstName, guest?.middleName, guest?.lastName]
    .filter(Boolean).join(' ') || '—';

  return (
    <div className="rc-root">

      {/* ── Top bar (screen only) ── */}
      <header className="rc-topbar no-print">
        <button className="rc-back-btn" onClick={onBack}>
          &#8249; {t.back[lang]}
        </button>
        <h1 className="rc-bar-title">{t.receipt[lang]}</h1>
        <div className="rc-bar-right">
          <button className="rc-lang-pill" onClick={toggleLang}>
            {lang === 'lo' ? 'EN' : 'ລາວ'}
          </button>
          <button className="rc-print-btn no-print" onClick={() => window.print()}>
            🖨 {t.print[lang]}
          </button>
        </div>
      </header>

      {/* ── Receipt card ── */}
      <div className="rc-page">
        <div className="rc-card">

          {/* ── Card header row ── */}
          <div className="rc-card-header">
            <span className="rc-hotel-name">{t.appName[lang]}</span>
            <span className="rc-invoice-no">{t.invoiceNo[lang]} #{invoiceNo}</span>
          </div>

          <h2 className="rc-receipt-title">{t.receipt[lang]}</h2>

          <div className="rc-content">

            {/* ─── Left: info sections ─── */}
            <div className="rc-left">

              <div className="rc-section">
                <h3 className="rc-section-title">{t.guestInfo[lang]}</h3>
                <div className="rc-section-rule" />
                <div className="rc-rows">
                  <Row label={t.firstName[lang]} value={fullName}              strong />
                  <Row label={t.age[lang]}        value={guest?.age  || '—'} />
                  <Row label={t.gender[lang]}     value={genderLabel}         />
                  <Row label={t.phone[lang]}      value={guest?.phone || '—'} />
                </div>
              </div>

              <div className="rc-section">
                <h3 className="rc-section-title">{t.roomDetails[lang]}</h3>
                <div className="rc-section-rule" />
                <div className="rc-rows">
                  <Row label={t.roomNo[lang]}        value={roomId}                          />
                  <Row label={t.type[lang]}          value={t[typeKey][lang]}          strong />
                  <Row label={t.pricePerNight[lang]} value={`${fmtMoney(price)} ກີບ`}        />
                </div>
              </div>

              <div className="rc-section">
                <h3 className="rc-section-title">{t.stayPeriod[lang]}</h3>
                <div className="rc-section-rule" />
                <div className="rc-rows">
                  <Row label={t.checkIn[lang]}     value={fmtDate(guest?.checkIn)} strong />
                  <Row label={t.checkOut[lang]}    value={fmtDate(checkOutDate)}   strong />
                  <Row label={t.totalNights[lang]} value={`${nights ?? 0} ${t.nights[lang]}`} />
                </div>
              </div>

              <div className="rc-total-box">
                <span className="rc-star">★</span>
                <span className="rc-total-label">{t.totalAmount[lang]}:</span>
                <span className="rc-total-value">{fmtMoney(total)} ກີບ</span>
              </div>
            </div>

            {/* ─── Right: room badge + actions ─── */}
            <div className="rc-right">
              <div className="rc-room-badge">{roomId}</div>
              <p className="rc-room-type">{t[typeKey][lang]}</p>
              <p className="rc-price-night">{fmtMoney(price)} ກີບ/{t.nights[lang]}</p>

              <div className="rc-right-actions no-print">
                <button className="rc-action-print" onClick={() => window.print()}>
                  {t.print[lang]}
                </button>
                <button className="rc-action-back" onClick={onBack}>
                  {t.back[lang]}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, strong }) {
  return (
    <div className="rc-row">
      <span className="rc-row-label">{label}:</span>
      <span className={`rc-row-value ${strong ? 'rc-row-value--strong' : ''}`}>
        {value ?? '—'}
      </span>
    </div>
  );
}
