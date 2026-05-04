import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../i18n/translations';
import { PRICES } from '../data/rooms';
import './CheckIn.css';

const TYPE_LABEL_KEY = {
  'twin-s':   'twinSmall',
  'twin-l':   'twinLarge',
  'single-s': 'singleSmall',
  'single-l': 'singleLarge',
};

export default function CheckIn({ room, onBack, onConfirm }) {
  const { lang, toggleLang } = useLanguage();

  const price      = PRICES[room?.type] ?? 80000;
  const typeKey    = TYPE_LABEL_KEY[room?.type] ?? 'twinSmall';
  const roomId     = room?.num ?? '??';

  const [form, setForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    age: '',
    gender: '',
    phone: '',
    checkIn: '',
    checkOut: '',
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  /* ── Auto-calculate nights + total ── */
  const nights = (() => {
    if (!form.checkIn || !form.checkOut) return 0;
    const diff = (new Date(form.checkOut) - new Date(form.checkIn)) / 86400000;
    return diff > 0 ? Math.round(diff) : 0;
  })();
  const totalAmount = nights * price;

  /* ── Live validation ── */
  useEffect(() => {
    if (!submitted) return;
    setErrors(validate(form));
  }, [form, submitted]);

  function validate(f) {
    const e = {};
    if (!f.firstName.trim()) e.firstName = true;
    if (!f.checkIn)           e.checkIn  = true;
    if (!f.checkOut)          e.checkOut = true;
    if (f.checkIn && f.checkOut && new Date(f.checkOut) <= new Date(f.checkIn))
      e.checkOut = true;
    return e;
  }

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) {
      alert(t.required[lang]);
      return;
    }
    onConfirm?.({
      room,
      guest: form,
      nights,
      totalAmount,
      price,
    });
  }

  return (
    <div className="ci-root">

      {/* ── Top bar ── */}
      <header className="ci-topbar">
        <button className="ci-back-btn" onClick={onBack}>
          &#8249; {t.back[lang]}
        </button>
        <h1 className="ci-title">{t.guestInfo[lang]}</h1>
        <button className="ci-lang-pill" onClick={toggleLang}>
          {lang === 'lo' ? 'EN' : 'ລາວ'}
        </button>
      </header>

      {/* ── Body ── */}
      <div className="ci-body">

        {/* ─── Left: form ─── */}
        <form className="ci-form" onSubmit={handleSubmit} noValidate>

          {/* Section 1: Guest Info */}
          <div className="ci-section">
            <h2 className="ci-section-title">{t.guestInfo[lang]}</h2>
            <div className="ci-divider" />

            {/* First name (full width, required) */}
            <div className={`ci-field ${errors.firstName ? 'ci-field--error' : ''}`}>
              <label className="ci-label">
                {t.firstName[lang]} <span className="ci-required">*</span>
              </label>
              <input
                className="ci-input"
                type="text"
                value={form.firstName}
                onChange={e => handleChange('firstName', e.target.value)}
              />
              {errors.firstName && (
                <span className="ci-error-msg">{t.required[lang]}</span>
              )}
            </div>

            {/* Middle name | Last name */}
            <div className="ci-row">
              <div className="ci-field ci-field--flex">
                <label className="ci-label">{t.middleName[lang]}</label>
                <input
                  className="ci-input"
                  type="text"
                  value={form.middleName}
                  onChange={e => handleChange('middleName', e.target.value)}
                />
              </div>
              <div className="ci-field ci-field--flex">
                <label className="ci-label">{t.lastName[lang]}</label>
                <input
                  className="ci-input"
                  type="text"
                  value={form.lastName}
                  onChange={e => handleChange('lastName', e.target.value)}
                />
              </div>
            </div>

            {/* Age | Gender */}
            <div className="ci-row">
              <div className="ci-field ci-field--narrow">
                <label className="ci-label">{t.age[lang]}</label>
                <input
                  className="ci-input"
                  type="number"
                  min="1"
                  max="120"
                  value={form.age}
                  onChange={e => handleChange('age', e.target.value)}
                />
              </div>
              <div className="ci-field ci-field--flex">
                <label className="ci-label">{t.gender[lang]}</label>
                <select
                  className="ci-input ci-select"
                  value={form.gender}
                  onChange={e => handleChange('gender', e.target.value)}
                >
                  <option value="">{t.select[lang]}</option>
                  <option value="male">{t.male[lang]}</option>
                  <option value="female">{t.female[lang]}</option>
                  <option value="other">{t.other[lang]}</option>
                </select>
              </div>
            </div>

            {/* Phone */}
            <div className="ci-field ci-field--half">
              <label className="ci-label">{t.phone[lang]}</label>
              <input
                className="ci-input"
                type="tel"
                value={form.phone}
                onChange={e => handleChange('phone', e.target.value)}
              />
            </div>
          </div>

          {/* Section 2: Stay Period */}
          <div className="ci-section">
            <h2 className="ci-section-title">{t.stayPeriod[lang]}</h2>
            <div className="ci-divider" />

            {/* Check-in | Check-out */}
            <div className="ci-row">
              <div className={`ci-field ci-field--flex ${errors.checkIn ? 'ci-field--error' : ''}`}>
                <label className="ci-label">
                  {t.checkIn[lang]} <span className="ci-required">*</span>
                </label>
                <input
                  className="ci-input"
                  type="date"
                  value={form.checkIn}
                  onChange={e => handleChange('checkIn', e.target.value)}
                />
                {errors.checkIn && (
                  <span className="ci-error-msg">{t.required[lang]}</span>
                )}
              </div>

              <div className="ci-date-dash">—</div>

              <div className={`ci-field ci-field--flex ${errors.checkOut ? 'ci-field--error' : ''}`}>
                <label className="ci-label">
                  {t.checkOut[lang]} <span className="ci-required">*</span>
                </label>
                <input
                  className="ci-input"
                  type="date"
                  value={form.checkOut}
                  min={form.checkIn || undefined}
                  onChange={e => handleChange('checkOut', e.target.value)}
                />
                {errors.checkOut && (
                  <span className="ci-error-msg">{t.required[lang]}</span>
                )}
              </div>
            </div>

            {/* Summary: nights + total */}
            <div className="ci-summary">
              <div className="ci-nights-row">
                <span className="ci-nights-label">{t.totalNights[lang]}:</span>
                <span className="ci-nights-value">
                  {nights > 0 ? `${nights} ${t.nights[lang]}` : '—'}
                </span>
              </div>
              <div className="ci-total-box">
                <span className="ci-star">★</span>
                <span className="ci-total-label">{t.totalAmount[lang]}:</span>
                <span className="ci-total-value">
                  {nights > 0 ? `${totalAmount.toLocaleString()} ກີບ` : '—'}
                </span>
              </div>
            </div>
          </div>
        </form>

        {/* ─── Right: sidebar ─── */}
        <aside className="ci-sidebar">
          <div className="ci-room-badge">{roomId}</div>
          <p className="ci-room-type">{t[typeKey][lang]}</p>
          <p className="ci-price-row">
            <span className="ci-price-label">{t.pricePerNight[lang]}</span>
            <span className="ci-price-value">{price.toLocaleString()} ກີບ</span>
          </p>

          <div className="ci-sidebar-divider" />

          <button className="ci-confirm-btn" onClick={handleSubmit}>
            {t.confirm[lang]}
          </button>
          <button className="ci-cancel-btn" type="button" onClick={onBack}>
            {t.cancel[lang]}
          </button>
        </aside>
      </div>
    </div>
  );
}
