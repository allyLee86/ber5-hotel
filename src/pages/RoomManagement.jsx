import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../i18n/translations';
import { ROOM_TYPES, TYPE_ORDER, PRICES, createRoom } from '../data/rooms';
import './RoomManagement.css';

const EMPTY_FORM = { num: '', type: 'twin-s', price: String(PRICES['twin-s']) };

export default function RoomManagement({ rooms, onSave, onBack }) {
  const { lang, toggleLang } = useLanguage();

  const [form, setForm]       = useState(EMPTY_FORM);
  const [editNum, setEditNum] = useState(null); // null = ADD, room.num string = EDIT
  const [errors, setErrors]   = useState({});

  const isEditMode = editNum !== null;

  function handleTypeChange(type) {
    setForm(prev => ({ ...prev, type, price: String(PRICES[type] ?? '') }));
  }

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: false }));
  }

  function validate() {
    const e = {};
    const trimmed = form.num.trim();
    if (!trimmed) e.num = true;
    if (!e.num && !isEditMode && rooms.some(r => r.num === trimmed)) e.numDupe = true;
    if (!form.type) e.type = true;
    return e;
  }

  function handleSubmit() {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    let updated;
    if (!isEditMode) {
      updated = [...rooms, createRoom(form.num.trim(), form.type)];
    } else {
      updated = rooms.map(r =>
        r.num === editNum ? { ...r, type: form.type } : r
      );
    }
    onSave(updated);
    setForm(EMPTY_FORM);
    setEditNum(null);
    setErrors({});
  }

  function startEdit(room) {
    setEditNum(room.num);
    setForm({ num: room.num, type: room.type, price: String(PRICES[room.type] ?? '') });
    setErrors({});
  }

  function cancelEdit() {
    setEditNum(null);
    setForm(EMPTY_FORM);
    setErrors({});
  }

  function handleDelete(room) {
    if (!window.confirm(`${t.confirmDelete[lang]} ${t.roomNo[lang]} ${room.num}?`)) return;
    onSave(rooms.filter(r => r.num !== room.num));
  }

  return (
    <div className="rm-root">

      {/* ── Top bar ── */}
      <header className="rm-topbar">
        <button className="rm-back-btn" onClick={onBack}>
          &#8249; {t.back[lang]}
        </button>
        <h1 className="rm-title">{t.manageRooms[lang]}</h1>
        <button className="rm-lang-pill" onClick={toggleLang}>
          {lang === 'lo' ? 'EN' : 'ລາວ'}
        </button>
      </header>

      {/* ── Body ── */}
      <div className="rm-body">

        {/* ─── LEFT: room list table ─── */}
        <div className="rm-table-wrap">
          <table className="rm-table">
            <thead>
              <tr>
                <th>{t.roomNo[lang]}</th>
                <th>{t.type[lang]}</th>
                <th>{t.pricePerNight[lang]}</th>
                <th>{t.status[lang]}</th>
                <th>{t.actions[lang]}</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map(room => (
                <tr
                  key={room.num}
                  className={editNum === room.num ? 'rm-row--active' : ''}
                >
                  <td className="rm-cell-num">{room.num}</td>
                  <td>{t[ROOM_TYPES[room.type]]?.[lang] ?? room.type}</td>
                  <td>{(PRICES[room.type] ?? 0).toLocaleString()}</td>
                  <td>
                    <span className={`rm-badge rm-badge--${room.status}`}>
                      {t[room.status]?.[lang] ?? room.status}
                    </span>
                  </td>
                  <td className="rm-cell-actions">
                    <button
                      className="rm-icon-btn rm-icon-btn--edit"
                      onClick={() => startEdit(room)}
                      title={t.editRoom[lang]}
                    >
                      <PencilIcon />
                    </button>
                    <button
                      className="rm-icon-btn rm-icon-btn--del"
                      onClick={() => handleDelete(room)}
                      title={t.confirmDelete[lang]}
                    >
                      <TrashIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ─── RIGHT: add / edit form ─── */}
        <div className="rm-panel">
          <h2 className="rm-panel-title">
            {isEditMode ? t.editRoom[lang] : t.addNewRoom[lang]}
          </h2>
          <div className="rm-divider" />

          {/* Room number */}
          <div className={`rm-field ${errors.num || errors.numDupe ? 'rm-field--error' : ''}`}>
            <label className="rm-label">
              {t.roomNo[lang]} <span className="rm-required">*</span>
            </label>
            <input
              className="rm-input"
              type="text"
              value={form.num}
              readOnly={isEditMode}
              onChange={e => handleChange('num', e.target.value)}
            />
            {errors.num    && <span className="rm-error-msg">{t.required[lang]}</span>}
            {errors.numDupe && <span className="rm-error-msg">{t.roomNumExists[lang]}</span>}
          </div>

          {/* Room type */}
          <div className={`rm-field ${errors.type ? 'rm-field--error' : ''}`}>
            <label className="rm-label">
              {t.type[lang]} <span className="rm-required">*</span>
            </label>
            <select
              className="rm-input rm-select"
              value={form.type}
              onChange={e => handleTypeChange(e.target.value)}
            >
              {TYPE_ORDER.map(typeKey => (
                <option key={typeKey} value={typeKey}>
                  {t[ROOM_TYPES[typeKey]]?.[lang] ?? typeKey}
                </option>
              ))}
            </select>
          </div>

          {/* Price (auto-filled, informational) */}
          <div className="rm-field">
            <label className="rm-label">{t.pricePerNight[lang]}</label>
            <input
              className="rm-input rm-input--readonly"
              type="number"
              min="0"
              readOnly
              value={form.price}
              onChange={e => handleChange('price', e.target.value)}
            />
          </div>

          <button className="rm-btn rm-btn--primary" onClick={handleSubmit}>
            {isEditMode ? t.saveChanges[lang] : t.addRoom[lang]}
          </button>

          {isEditMode && (
            <button className="rm-btn rm-btn--outline" onClick={cancelEdit}>
              {t.cancel[lang]}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

/* ── Icons ── */

function PencilIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}
