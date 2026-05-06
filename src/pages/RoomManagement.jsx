import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../i18n/translations';
import { ROOM_TYPES, TYPE_ORDER, PRICES, createRoom } from '../data/rooms';
import './RoomManagement.css';

const TYPE_SORT_ORDER = { 'twin-s': 0, 'twin-l': 1, 'single-s': 2, 'single-l': 3 };

export default function RoomManagement({ rooms, onSave, onBack, prices, onSavePrices }) {
  const { lang, toggleLang } = useLanguage();
  // PRICES acts as fallback defaults — new types added to TYPE_ORDER always have a base price
  const effectivePrices = { ...PRICES, ...(prices ?? {}) };

  /* ── Room form state ── */
  const [form, setForm]     = useState({ num: '', type: 'twin-s' });
  const [editNum, setEditNum] = useState(null);
  const [errors, setErrors]   = useState({});

  /* ── Price panel state ── */
  const [priceForm, setPriceForm] = useState(() =>
    Object.fromEntries(TYPE_ORDER.map(k => [k, String(effectivePrices[k] ?? '')]))
  );
  const [priceErrors, setPriceErrors] = useState({});
  const [priceSaved, setPriceSaved]   = useState(false);

  /* ── Sort state ── */
  const [sortCol, setSortCol] = useState('num');
  const [sortDir, setSortDir] = useState('asc');

  /* ── Delete modal ── */
  const [deleteTarget, setDeleteTarget] = useState(null);

  const isEditMode = editNum !== null;

  /* ── Sorting ── */
  function handleSort(col) {
    if (col === sortCol) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  }

  const sortedRooms = useMemo(() => {
    return [...rooms].sort((a, b) => {
      let cmp = 0;
      if (sortCol === 'num') {
        cmp = a.num.localeCompare(b.num, undefined, { numeric: true });
      } else if (sortCol === 'type') {
        cmp = (TYPE_SORT_ORDER[a.type] ?? 99) - (TYPE_SORT_ORDER[b.type] ?? 99);
      } else if (sortCol === 'price') {
        cmp = (effectivePrices[a.type] ?? 0) - (effectivePrices[b.type] ?? 0);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [rooms, sortCol, sortDir, effectivePrices]);

  /* ── Room form handlers ── */
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
      updated = rooms.map(r => r.num === editNum ? { ...r, type: form.type } : r);
    }
    onSave(updated);
    setForm({ num: '', type: 'twin-s' });
    setEditNum(null);
    setErrors({});
  }

  function startEdit(room) {
    setEditNum(room.num);
    setForm({ num: room.num, type: room.type });
    setErrors({});
  }

  function cancelEdit() {
    setEditNum(null);
    setForm({ num: '', type: 'twin-s' });
    setErrors({});
  }

  /* ── Price panel handlers ── */
  function handlePriceChange(typeKey, value) {
    setPriceForm(prev => ({ ...prev, [typeKey]: value }));
    if (priceErrors[typeKey]) setPriceErrors(prev => ({ ...prev, [typeKey]: false }));
    if (priceSaved) setPriceSaved(false);
  }

  function handleSavePrices() {
    const errs = {};
    const result = {};
    for (const key of TYPE_ORDER) {
      const v = Number(priceForm[key]);
      if (!priceForm[key] || isNaN(v) || v <= 0) {
        errs[key] = true;
      } else {
        result[key] = v;
      }
    }
    setPriceErrors(errs);
    if (Object.keys(errs).length) return;
    onSavePrices?.(result);
    setPriceSaved(true);
    setTimeout(() => setPriceSaved(false), 2500);
  }

  /* ── Delete confirm ── */
  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    if (editNum === deleteTarget.num) cancelEdit();
    onSave(rooms.filter(r => r.num !== deleteTarget.num));
    setDeleteTarget(null);
  }

  return (
    <div className="rm-root">

      {/* ── Delete confirm modal ── */}
      {deleteTarget && (
        <div className="rm-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="rm-modal" onClick={e => e.stopPropagation()}>
            <h3 className="rm-modal-title">{t.confirmDelete[lang]}</h3>
            <p className="rm-modal-msg">
              {t.roomNo[lang]} <strong>{deleteTarget.num}</strong>
              {' — '}{t[ROOM_TYPES[deleteTarget.type]]?.[lang] ?? deleteTarget.type}
            </p>
            <div className="rm-modal-actions">
              <button className="rm-btn rm-btn--danger" onClick={handleDeleteConfirm}>
                {t.delete[lang]}
              </button>
              <button className="rm-btn rm-btn--outline" onClick={() => setDeleteTarget(null)}>
                {t.cancel[lang]}
              </button>
            </div>
          </div>
        </div>
      )}

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
                <th className="rm-th--sortable" onClick={() => handleSort('num')}>
                  {t.roomNo[lang]} <SortArrow col="num" sortCol={sortCol} sortDir={sortDir} />
                </th>
                <th className="rm-th--sortable" onClick={() => handleSort('type')}>
                  {t.type[lang]} <SortArrow col="type" sortCol={sortCol} sortDir={sortDir} />
                </th>
                <th className="rm-th--sortable" onClick={() => handleSort('price')}>
                  {t.pricePerNight[lang]} <SortArrow col="price" sortCol={sortCol} sortDir={sortDir} />
                </th>
                <th>{t.actions[lang]}</th>
              </tr>
            </thead>
            <tbody>
              {sortedRooms.map(room => (
                <tr
                  key={room.num}
                  className={editNum === room.num ? 'rm-row--active' : ''}
                >
                  <td className="rm-cell-num">{room.num}</td>
                  <td>{t[ROOM_TYPES[room.type]]?.[lang] ?? room.type}</td>
                  <td>{(effectivePrices[room.type] ?? 0).toLocaleString()}</td>
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
                      onClick={() => setDeleteTarget(room)}
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

        {/* ─── RIGHT column: two panels stacked ─── */}
        <div className="rm-right-col">

          {/* Room add / edit panel */}
          <div className={`rm-panel${isEditMode ? ' rm-panel--editing' : ''}`}>
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
              {errors.num     && <span className="rm-error-msg">{t.required[lang]}</span>}
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
                onChange={e => handleChange('type', e.target.value)}
              >
                {TYPE_ORDER.map(typeKey => (
                  <option key={typeKey} value={typeKey}>
                    {t[ROOM_TYPES[typeKey]]?.[lang] ?? typeKey}
                  </option>
                ))}
              </select>
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

          {/* Price by room type panel */}
          <div className="rm-panel rm-price-panel">
            <h2 className="rm-panel-title">{t.priceByType[lang]}</h2>
            <div className="rm-divider" />

            {TYPE_ORDER.map(typeKey => (
              <div className="rm-price-row" key={typeKey}>
                <span className="rm-price-label">
                  {t[ROOM_TYPES[typeKey]]?.[lang] ?? typeKey}
                </span>
                <div className="rm-price-input-wrap">
                  <input
                    className={`rm-price-input${priceErrors[typeKey] ? ' rm-price-input--error' : ''}`}
                    type="number"
                    min="0"
                    value={priceForm[typeKey]}
                    onChange={e => handlePriceChange(typeKey, e.target.value)}
                  />
                  <span className="rm-price-unit">{t.priceUnit[lang]}</span>
                </div>
              </div>
            ))}

            {priceSaved && (
              <div className="rm-price-saved">{t.pricesSaved[lang]}</div>
            )}

            <button className="rm-btn rm-btn--primary" onClick={handleSavePrices}>
              {t.savePrices[lang]}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ── Sort arrow indicator ── */
function SortArrow({ col, sortCol, sortDir }) {
  if (sortCol !== col) return <span className="rm-sort-arrow rm-sort-arrow--inactive">↕</span>;
  return <span className="rm-sort-arrow">{sortDir === 'asc' ? '↑' : '↓'}</span>;
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
