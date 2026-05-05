import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../i18n/translations';
import './RoomCard.css';

function fmtCheckIn(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${parseInt(d)}/${parseInt(m)}/${y}`;
}

export default function RoomCard({ room, onClick }) {
  const { lang } = useLanguage();
  const guestFirst = room.guestData?.nickName ?? room.guestData?.firstName ?? '';
  const checkInStr = fmtCheckIn(room.guestData?.checkIn);

  return (
    <button
      className={`room-card room-card--${room.status}`}
      onClick={onClick}
      aria-label={`${t.roomNo[lang]} ${room.num}`}
    >
      <div className="room-card__body">

        {room.status === 'vacant' && (
          <span className="room-card__vacant-text">{t.vacant[lang]}</span>
        )}

        {room.status === 'booked' && (
          <div className="room-card__filled-inner">
            <BookIcon />
            <div className="room-card__guest-info">
              <span className="room-card__guest-name">{guestFirst}</span>
            </div>
          </div>
        )}

        {room.status === 'occupied' && (
          <div className="room-card__filled-inner">
            <PersonIcon />
            <div className="room-card__guest-info">
              <span className="room-card__guest-name">{guestFirst}</span>
              {checkInStr && (
                <span className="room-card__checkin">{checkInStr}</span>
              )}
            </div>
          </div>
        )}

      </div>
      <div className="room-card__footer">
        {t.roomNo[lang]} {room.num}
      </div>
    </button>
  );
}

function PersonIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="rc-icon" aria-hidden="true">
      <circle cx="22" cy="22" r="22" fill="rgba(255,255,255,0.18)" />
      <circle cx="22" cy="17" r="7" fill="rgba(255,255,255,0.85)" />
      <ellipse cx="22" cy="35" rx="12" ry="7" fill="rgba(255,255,255,0.85)" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="rc-icon" aria-hidden="true">
      <circle cx="22" cy="22" r="22" fill="rgba(255,255,255,0.18)" />
      {/* Book cover */}
      <rect x="11" y="10" width="14" height="20" rx="2" fill="rgba(255,255,255,0.9)" />
      {/* Pages */}
      <rect x="13" y="14" width="10" height="1.5" rx="0.75" fill="#E8840A" />
      <rect x="13" y="17" width="10" height="1.5" rx="0.75" fill="#E8840A" />
      <rect x="13" y="20" width="7"  height="1.5" rx="0.75" fill="#E8840A" />
      {/* Open right page */}
      <path d="M25 13 Q33 11 32 28 Q24 29 22 26 L22 13 Z" fill="rgba(255,255,255,0.75)" />
    </svg>
  );
}
