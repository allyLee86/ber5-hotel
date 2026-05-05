import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../i18n/translations';
import './UserManagement.css';

const EMPTY_FORM = { name: '', username: '', role: 'staff', password: '', confirmPassword: '' };

function initials(name) {
  return name.trim().split(/\s+/).map(w => w[0] ?? '').join('').toUpperCase().slice(0, 2) || '?';
}

export default function UserManagement({ users, onSave, onBack }) {
  const { lang, toggleLang } = useLanguage();

  const [form, setForm]     = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null); // null = ADD, user.id = EDIT
  const [errors, setErrors] = useState({});
  const [showPwd, setShowPwd]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isEditMode = editId !== null;

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: false }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim())     e.name = true;
    if (!form.username.trim()) e.username = true;
    if (!e.username) {
      const dupe = users.some(u => u.username === form.username.trim() && u.id !== editId);
      if (dupe) e.usernameDupe = true;
    }
    if (!isEditMode && !form.password) e.password = true;
    if (form.password && form.password !== form.confirmPassword) e.confirmPassword = true;
    return e;
  }

  function handleSubmit() {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    let updated;
    if (!isEditMode) {
      updated = [...users, {
        id:       Date.now(),
        name:     form.name.trim(),
        username: form.username.trim(),
        role:     form.role,
        password: form.password,
        active:   true,
      }];
    } else {
      updated = users.map(u => {
        if (u.id !== editId) return u;
        const patched = { ...u, name: form.name.trim(), username: form.username.trim(), role: form.role };
        if (form.password) patched.password = form.password;
        return patched;
      });
    }
    onSave(updated);
    resetForm();
  }

  function startEdit(user) {
    setEditId(user.id);
    setForm({ name: user.name, username: user.username, role: user.role, password: '', confirmPassword: '' });
    setErrors({});
    setShowPwd(false);
    setShowConfirm(false);
  }

  function resetForm() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setShowPwd(false);
    setShowConfirm(false);
  }

  function handleDelete(user) {
    if (!window.confirm(`${t.confirmDelete[lang]} "${user.name}"?`)) return;
    onSave(users.filter(u => u.id !== user.id));
    if (editId === user.id) resetForm();
  }

  function toggleActive(user) {
    onSave(users.map(u => u.id === user.id ? { ...u, active: !u.active } : u));
  }

  const roleLabel = role =>
    role === 'admin' ? t.adminRole[lang] : t.staffRole[lang];

  return (
    <div className="um-root">

      {/* ── Top bar ── */}
      <header className="um-topbar">
        <button className="um-back-btn" onClick={onBack}>
          &#8249; {t.back[lang]}
        </button>
        <h1 className="um-title">{t.manageUsers[lang]}</h1>
        <button className="um-lang-pill" onClick={toggleLang}>
          {lang === 'lo' ? 'EN' : 'ລາວ'}
        </button>
      </header>

      {/* ── Demo notice ── */}
      <div className="um-notice">
        <NoticeIcon /> {t.demoNotice[lang]}
      </div>

      {/* ── Body ── */}
      <div className="um-body">

        {/* ─── LEFT: user list ─── */}
        <div className="um-list-wrap">
          {users.map(user => (
            <div
              key={user.id}
              className={`um-user-row ${editId === user.id ? 'um-user-row--active' : ''} ${!user.active ? 'um-user-row--inactive' : ''}`}
            >
              {/* Avatar */}
              <div className={`um-avatar um-avatar--${user.role}`}>
                {initials(user.name)}
              </div>

              {/* Identity */}
              <div className="um-identity">
                <span className="um-identity-name">{user.name}</span>
                <span className="um-identity-username">@{user.username}</span>
              </div>

              {/* Role badge */}
              <span className={`um-role-badge um-role-badge--${user.role}`}>
                {roleLabel(user.role)}
              </span>

              {/* Active toggle */}
              <label className="um-toggle" title={user.active ? t.active[lang] : t.inactive[lang]}>
                <input
                  type="checkbox"
                  checked={user.active}
                  onChange={() => toggleActive(user)}
                />
                <span className="um-toggle-track">
                  <span className="um-toggle-thumb" />
                </span>
              </label>

              {/* Actions */}
              <div className="um-row-actions">
                <button
                  className="um-icon-btn um-icon-btn--edit"
                  onClick={() => startEdit(user)}
                  title={t.editUser[lang]}
                >
                  <PencilIcon />
                </button>
                <button
                  className="um-icon-btn um-icon-btn--del"
                  onClick={() => handleDelete(user)}
                  title={t.confirmDelete[lang]}
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ─── RIGHT: add / edit form ─── */}
        <div className="um-panel">
          <h2 className="um-panel-title">
            {isEditMode ? t.editUser[lang] : t.addNewUser[lang]}
          </h2>
          <div className="um-divider" />

          {/* Full name */}
          <div className={`um-field ${errors.name ? 'um-field--error' : ''}`}>
            <label className="um-label">
              {t.fullName[lang]} <span className="um-required">*</span>
            </label>
            <input
              className="um-input"
              type="text"
              value={form.name}
              onChange={e => handleChange('name', e.target.value)}
            />
            {errors.name && <span className="um-error-msg">{t.required[lang]}</span>}
          </div>

          {/* Username */}
          <div className={`um-field ${errors.username || errors.usernameDupe ? 'um-field--error' : ''}`}>
            <label className="um-label">
              {t.username[lang]} <span className="um-required">*</span>
            </label>
            <input
              className="um-input"
              type="text"
              value={form.username}
              autoCapitalize="none"
              onChange={e => handleChange('username', e.target.value)}
            />
            {errors.username     && <span className="um-error-msg">{t.required[lang]}</span>}
            {errors.usernameDupe && <span className="um-error-msg">{t.usernameExists[lang]}</span>}
          </div>

          {/* Role */}
          <div className="um-field">
            <label className="um-label">{t.role[lang]}</label>
            <select
              className="um-input um-select"
              value={form.role}
              onChange={e => handleChange('role', e.target.value)}
            >
              <option value="admin">{t.adminRole[lang]}</option>
              <option value="staff">{t.staffRole[lang]}</option>
            </select>
          </div>

          {/* Password */}
          <div className={`um-field ${errors.password ? 'um-field--error' : ''}`}>
            <label className="um-label">
              {t.password[lang]}
              {!isEditMode && <span className="um-required"> *</span>}
              {isEditMode  && <span className="um-hint"> ({lang === 'lo' ? 'ຖ້າຕ້ອງການປ່ຽນ' : 'leave blank to keep'})</span>}
            </label>
            <div className="um-pwd-wrap">
              <input
                className="um-input um-input--pwd"
                type={showPwd ? 'text' : 'password'}
                value={form.password}
                onChange={e => handleChange('password', e.target.value)}
              />
              <button type="button" className="um-eye-btn" onClick={() => setShowPwd(v => !v)}>
                {showPwd ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {errors.password && <span className="um-error-msg">{t.required[lang]}</span>}
          </div>

          {/* Confirm password */}
          <div className={`um-field ${errors.confirmPassword ? 'um-field--error' : ''}`}>
            <label className="um-label">{t.confirmPassword[lang]}</label>
            <div className="um-pwd-wrap">
              <input
                className="um-input um-input--pwd"
                type={showConfirm ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={e => handleChange('confirmPassword', e.target.value)}
              />
              <button type="button" className="um-eye-btn" onClick={() => setShowConfirm(v => !v)}>
                {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {errors.confirmPassword && <span className="um-error-msg">{t.passwordMismatch[lang]}</span>}
          </div>

          <button className="um-btn um-btn--primary" onClick={handleSubmit}>
            {isEditMode ? t.saveChanges[lang] : t.addUser[lang]}
          </button>

          {isEditMode && (
            <button className="um-btn um-btn--outline" onClick={resetForm}>
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

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function NoticeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
