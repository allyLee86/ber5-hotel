import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../i18n/translations';
import './Login.css';

export default function Login({ onLogin }) {
  const { lang, toggleLang } = useLanguage();

  const [username, setUsername]     = useState('');
  const [password, setPassword]     = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [errors, setErrors]         = useState({});
  const [authError, setAuthError]   = useState('');
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const e = {};
    if (!username.trim()) e.username = true;
    if (!password)         e.password = true;
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setAuthError('');
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    try {
      await onLogin(username, password);
    } catch {
      setAuthError(t.invalidCredentials[lang]);
    } finally {
      setSubmitting(false);
    }
  }

  function clearFieldError(field) {
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    setAuthError('');
  }

  return (
    <div className="login-page">

      {/* Language toggle — top right */}
      <button className="login-lang-pill" onClick={toggleLang}>
        {lang === 'lo' ? 'EN' : 'ລາວ'}
      </button>

      <div className="login-card">

        {/* Brand */}
        <div className="login-brand">
          <div className="login-logo"><HotelIcon /></div>
          <h1 className="login-name-lo">{t.appName[lang]}</h1>
          <p className="login-name-en">{t.systemName[lang]}</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>

          {/* Username */}
          <div className={`login-field ${errors.username ? 'login-field--error' : ''}`}>
            <label className="login-label">{t.username[lang]}</label>
            <div className="login-input-wrap">
              <span className="login-input-icon"><UserIcon /></span>
              <input
                className="login-input"
                type="text"
                placeholder={t.username[lang]}
                value={username}
                autoComplete="username"
                onChange={e => { setUsername(e.target.value); clearFieldError('username'); }}
              />
            </div>
            {errors.username && (
              <p className="login-error-text">{t.enterUsername[lang]}</p>
            )}
          </div>

          {/* Password */}
          <div className={`login-field ${errors.password ? 'login-field--error' : ''}`}>
            <label className="login-label">{t.password[lang]}</label>
            <div className="login-input-wrap">
              <span className="login-input-icon"><LockIcon /></span>
              <input
                className="login-input"
                type={showPass ? 'text' : 'password'}
                placeholder={t.password[lang]}
                value={password}
                autoComplete="current-password"
                onChange={e => { setPassword(e.target.value); clearFieldError('password'); }}
              />
              <button
                type="button"
                className="login-eye-btn"
                onClick={() => setShowPass(v => !v)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {errors.password && (
              <p className="login-error-text">{t.enterPassword[lang]}</p>
            )}
          </div>

          {/* Auth error */}
          {authError && (
            <div className="login-auth-error">
              <span>{authError}</span>
            </div>
          )}

          {/* Forgot password */}
          <div className="login-forgot-row">
            <button type="button" className="login-forgot-btn">
              {t.forgotPassword[lang]}
            </button>
          </div>

          {/* Submit */}
          <button type="submit" className="login-submit-btn" disabled={submitting}>
            {submitting ? t.loggingIn[lang] : t.login[lang]}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ── Icons ── */
function HotelIcon() {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="56" height="56" rx="14" fill="#3B4FBF" />
      <rect x="8" y="22" width="40" height="26" rx="2" fill="white" opacity="0.15" />
      <rect x="8" y="22" width="40" height="26" rx="2" stroke="white" strokeWidth="2" />
      <path d="M8 24L28 10L48 24" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="22" y="32" width="12" height="16" rx="1" fill="white" opacity="0.9" />
      <rect x="14" y="28" width="7" height="7" rx="1" fill="white" opacity="0.7" />
      <rect x="35" y="28" width="7" height="7" rx="1" fill="white" opacity="0.7" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      <circle cx="12" cy="16" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
