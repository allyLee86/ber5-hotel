import { useState } from 'react';
import Login          from './pages/Login';
import AdminMenu      from './pages/AdminMenu';
import Dashboard      from './pages/Dashboard';
import RoomPanel      from './pages/RoomPanel';
import Receipt        from './pages/Receipt';
import GuestInfo      from './pages/GuestInfo';
import StayHistory    from './pages/StayHistory';
import RoomManagement from './pages/RoomManagement';
import UserManagement from './pages/UserManagement';
import { initialRooms, PRICES } from './data/rooms';

function calculateNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const diff = (new Date(checkOut) - new Date(checkIn)) / 86400000;
  return diff > 0 ? Math.round(diff) : 0;
}

function detectGuestType(gd) {
  return (gd.phone || gd.idCard || gd.passportId) ? 'identified' : 'anonymous';
}

function matchesGuest(guest, gd) {
  if (gd.phone      && guest.phone      && gd.phone      === guest.phone)      return true;
  if (gd.idCard     && guest.idCard     && gd.idCard     === guest.idCard)     return true;
  if (gd.passportId && guest.passportId && gd.passportId === guest.passportId) return true;
  return false;
}

function upsertGuest(prev, gd, room) {
  const guestType = detectGuestType(gd);
  const stay = {
    id:       Date.now(),
    roomNum:  room.num,
    roomType: room.type,
    checkIn:  gd.checkIn  ?? null,
    checkOut: gd.checkOut ?? null,
    nights:   null,
    total:    null,
    status:   'current',
  };
  const idx = prev.findIndex(g => matchesGuest(g, gd));
  if (idx >= 0) {
    const g = prev[idx];
    const updated = { ...g, guestType, stays: [...g.stays, stay] };
    ['nickName','firstName','middleName','lastName','age','gender','phone','idCard','passportId']
      .forEach(k => { if (gd[k]) updated[k] = gd[k]; });
    return prev.map((g2, i) => i === idx ? updated : g2);
  }
  return [...prev, {
    id:         String(Date.now()),
    nickName:   gd.nickName   ?? '',
    firstName:  gd.firstName  ?? '',
    middleName: gd.middleName ?? '',
    lastName:   gd.lastName   ?? '',
    age:        gd.age        ?? '',
    gender:     gd.gender     ?? '',
    phone:      gd.phone      ?? '',
    idCard:     gd.idCard     ?? '',
    passportId: gd.passportId ?? '',
    guestType,
    stays: [stay],
  }];
}

function updateGuestInfo(prev, oldGd, newGd, roomNum) {
  return prev.map(g => {
    const byIds = matchesGuest(g, oldGd) || matchesGuest(g, newGd);
    const byRoom = !byIds && g.stays.some(s => s.roomNum === roomNum && s.status === 'current');
    if (!byIds && !byRoom) return g;
    const updated = { ...g, guestType: detectGuestType(newGd) };
    ['nickName','firstName','middleName','lastName','age','gender','phone','idCard','passportId']
      .forEach(k => { if (newGd[k]) updated[k] = newGd[k]; });
    updated.stays = g.stays.map(s =>
      s.roomNum === roomNum && s.status === 'current'
        ? { ...s, checkIn: newGd.checkIn ?? s.checkIn, checkOut: newGd.checkOut ?? s.checkOut }
        : s
    );
    return updated;
  });
}

function completeGuestStay(prev, roomNum, checkOutDate, nights, total) {
  return prev.map(g => {
    const hasCurrent = g.stays.some(s => s.roomNum === roomNum && s.status === 'current');
    if (!hasCurrent) return g;
    return {
      ...g,
      stays: g.stays.map(s =>
        s.roomNum === roomNum && s.status === 'current'
          ? { ...s, checkOut: checkOutDate, nights, total, status: 'completed' }
          : s
      ),
    };
  });
}

/* Map AdminMenu nav keys → internal screen names */
const SCREEN_MAP = {
  'room-status': 'dashboard',
  'guests':      'guestinfo',
  'history':     'stayhistory',
  'rooms':       'roommanagement',
  'users':       'usermanagement',
};

export default function App() {
  const [screen, setScreen]             = useState('login');
  const [user, setUser]                 = useState(null);
  const [rooms, setRooms]               = useState(initialRooms);
  const [prices, setPrices]             = useState(PRICES);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [lastCheckout, setLastCheckout] = useState(null);
  const [stayHistory, setStayHistory]   = useState([]);
  const [guests, setGuests]             = useState([]);
  const [users, setUsers]               = useState([
    { id: 1, name: 'Admin', username: 'admin', role: 'admin', active: true },
  ]);

  /* ── Room panel: save a single room, detect checkout ── */
  function handleSaveRoom(updatedRoom) {
    setRooms(prev => prev.map(r => r.num === updatedRoom.num ? updatedRoom : r));

    const wasVacant   = selectedRoom?.status === 'vacant';
    const wasBooked   = selectedRoom?.status === 'booked';
    const wasOccupied = selectedRoom?.status === 'occupied';
    const isNowVacant    = updatedRoom.status === 'vacant';
    const isNowBooked    = updatedRoom.status === 'booked';
    const isNowOccupied  = updatedRoom.status === 'occupied';
    const isNowActive    = isNowOccupied || isNowBooked;

    if (wasVacant && isNowActive && updatedRoom.guestData) {
      setGuests(prev => upsertGuest(prev, updatedRoom.guestData, updatedRoom));
    }

    /* Info edit: same status, guest data changed */
    if ((wasBooked && isNowBooked) || (wasOccupied && isNowOccupied)) {
      if (updatedRoom.guestData) {
        setGuests(prev => updateGuestInfo(prev, selectedRoom.guestData, updatedRoom.guestData, selectedRoom.num));
      }
    }

    if (wasOccupied && isNowVacant) {
      const checkOutDate = new Date().toISOString().split('T')[0];
      const nights = calculateNights(selectedRoom.guestData?.checkIn, checkOutDate);
      const price  = { ...PRICES, ...prices }[selectedRoom.type] ?? 0;
      setLastCheckout({
        guest: selectedRoom.guestData,
        room:  selectedRoom,
        checkOutDate,
        nights,
        total: nights * price,
        price,
      });
      setStayHistory(prev => [...prev, {
        id:          Date.now(),
        guestData:   { ...selectedRoom.guestData },
        room:        { num: selectedRoom.num, type: selectedRoom.type },
        checkOutDate,
        nights,
        total:       nights * price,
      }]);
      setGuests(prev => completeGuestStay(prev, selectedRoom.num, checkOutDate, nights, nights * price));
      setScreen('receipt');
    } else {
      setScreen('dashboard');
    }
  }

  /* ── Room management: save full rooms array ── */
  function handleSaveRooms(updatedRooms) {
    setRooms(updatedRooms);
  }

  /* ── User management: save full users array ── */
  function handleSaveUsers(updatedUsers) {
    setUsers(updatedUsers);
  }

  function handleSelectRoom(room) {
    setSelectedRoom(room);
    setScreen('roompanel');
  }

  function handleNavigate(key) {
    setScreen(SCREEN_MAP[key] ?? key);
  }

  /* ── Screen router ── */

  if (screen === 'login') {
    return (
      <Login onLogin={u => { setUser(u); setScreen('adminmenu'); }} />
    );
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

  if (screen === 'guestinfo') {
    return (
      <GuestInfo
        guests={guests}
        onBack={() => setScreen('adminmenu')}
      />
    );
  }

  if (screen === 'stayhistory') {
    return (
      <StayHistory
        history={stayHistory}
        onBack={() => setScreen('adminmenu')}
      />
    );
  }

  if (screen === 'roommanagement') {
    return (
      <RoomManagement
        rooms={rooms}
        onSave={handleSaveRooms}
        onBack={() => setScreen('adminmenu')}
        prices={prices}
        onSavePrices={setPrices}
      />
    );
  }

  if (screen === 'usermanagement') {
    return (
      <UserManagement
        users={users}
        onSave={handleSaveUsers}
        onBack={() => setScreen('adminmenu')}
      />
    );
  }

  return null;
}
