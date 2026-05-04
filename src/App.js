import { useState } from 'react';
import Login from './pages/Login';
import AdminMenu from './pages/AdminMenu';
import Dashboard from './pages/Dashboard';
import RoomPanel from './pages/RoomPanel';
import Receipt from './pages/Receipt';
import { useLanguage } from './context/LanguageContext';
import { t } from './i18n/translations';
import { initialRooms, PRICES } from './data/rooms';

function calculateNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const diff = (new Date(checkOut) - new Date(checkIn)) / 86400000;
  return diff > 0 ? Math.round(diff) : 0;
}

/* AdminMenu fires legacy screen keys — map them to the new names */
const SCREEN_MAP = { 'room-status': 'dashboard' };

export default function App() {
  const { lang } = useLanguage();
  const [screen, setScreen]             = useState('login');
  const [user, setUser]                 = useState(null);
  const [rooms, setRooms]               = useState(initialRooms);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [lastCheckout, setLastCheckout] = useState(null);

  function handleSelectRoom(room) {
    setSelectedRoom(room);
    setScreen('roompanel');
  }

  function handleSaveRoom(updatedRoom) {
    setRooms(prev => prev.map(r => r.num === updatedRoom.num ? updatedRoom : r));

    const wasOccupied = selectedRoom?.status === 'occupied';
    const isNowVacant = updatedRoom.status === 'vacant';

    if (wasOccupied && isNowVacant) {
      const checkOutDate = new Date().toISOString().split('T')[0];
      const nights = calculateNights(selectedRoom.guestData?.checkIn, checkOutDate);
      const price  = PRICES[selectedRoom.type] ?? 80000;
      setLastCheckout({
        guest:        selectedRoom.guestData,
        room:         selectedRoom,
        checkOutDate,
        nights,
        total:        nights * price,
        price,
      });
      setScreen('receipt');
    } else {
      setScreen('dashboard');
    }
  }

  function handleNavigate(key) {
    setScreen(SCREEN_MAP[key] ?? key);
  }

  /* ── Screens ── */

  if (screen === 'login') {
    return <Login onLogin={u => { setUser(u); setScreen('adminmenu'); }} />;
  }

  if (screen === 'adminmenu') {
    return (
      <AdminMenu
        user={user}
        onNavigate={handleNavigate}
        onLogout={() => { setUser(null); setScreen('login'); }}
      />
    );
  }

  if (screen === 'dashboard') {
    return (
      <Dashboard
        rooms={rooms}
        onBack={() => setScreen('adminmenu')}
        onRoomClick={handleSelectRoom}
      />
    );
  }

  if (screen === 'roompanel') {
    return (
      <RoomPanel
        room={selectedRoom}
        onSave={handleSaveRoom}
        onCancel={() => setScreen('dashboard')}
      />
    );
  }

  if (screen === 'receipt') {
    return (
      <Receipt
        checkout={lastCheckout}
        onBack={() => setScreen('dashboard')}
      />
    );
  }

  /* ── Placeholder for unbuilt screens ── */
  const screenLabel = {
    'guest-info':      t.guestInfo,
    'stay-history':    t.stayHistory,
    'room-management': t.manageRooms,
    'user-management': t.manageUsers,
  };
  const label = screenLabel[screen]?.[lang] ?? screen;

  return (
    <div style={{ minHeight: '100vh', background: '#3B4FBF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '40px 48px', textAlign: 'center', fontFamily: "'Noto Sans Lao', Segoe UI, sans-serif" }}>
        <p style={{ color: '#3B4FBF', fontWeight: 700, fontSize: '1.1rem', marginBottom: 12 }}>{label}</p>
        <p style={{ color: '#aaa', fontSize: '0.88rem', marginBottom: 24 }}>Coming soon…</p>
        <button
          onClick={() => setScreen('adminmenu')}
          style={{ background: '#3B4FBF', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}
        >
          &#8249; {t.back[lang]}
        </button>
      </div>
    </div>
  );
}
