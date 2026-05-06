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
import { PRICES }     from './data/rooms';
import * as api       from './api';

/* Normalise API stays → StayHistory record format */
function normaliseStay(s) {
  return {
    id:           s.id,
    guestData:    { ...s.guestData, checkIn: s.checkIn, checkOut: s.checkOut },
    room:         { num: s.roomNum, type: s.roomType },
    checkOutDate: s.checkOut,
    nights:       s.nights,
    total:        s.total,
  };
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
  const [rooms, setRooms]               = useState([]);
  const [prices, setPrices]             = useState(PRICES);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [lastCheckout, setLastCheckout] = useState(null);
  const [stayHistory, setStayHistory]   = useState([]);
  const [guests, setGuests]             = useState([]);
  const [users, setUsers]               = useState([]);
  const [loading, setLoading]           = useState(false);

  /* ── Load all data from API after login ── */
  async function loadAllData() {
    const [roomsData, pricesData, guestsData, staysData, usersData] = await Promise.all([
      api.getRooms(),
      api.getPrices(),
      api.getGuests(),
      api.getStays(),
      api.getUsers().catch(() => []),  // 403 for staff role
    ]);
    setRooms(roomsData);
    setPrices(pricesData);
    setGuests(guestsData);
    setStayHistory(staysData.map(normaliseStay));
    setUsers(usersData);
  }

  async function loadRooms() {
    const data = await api.getRooms();
    setRooms(data);
  }

  async function loadGuests() {
    const data = await api.getGuests();
    setGuests(data);
  }

  async function loadStayHistory() {
    const data = await api.getStays();
    setStayHistory(data.map(normaliseStay));
  }

  /* ── Login ── */
  async function handleLogin(username, password) {
    const { token, user: u } = await api.login(username, password);
    api.setToken(token);
    setUser(u);
    await loadAllData();
    setScreen('adminmenu');
  }

  /* ── Room panel: save changes for a single room ── */
  async function handleSaveRoom(updatedRoom) {
    if (loading) return;
    const prev = selectedRoom;
    const wasVacant   = prev.status === 'vacant';
    const wasBooked   = prev.status === 'booked';
    const wasOccupied = prev.status === 'occupied';
    const isNowVacant   = updatedRoom.status === 'vacant';
    const isNowBooked   = updatedRoom.status === 'booked';
    const isNowOccupied = updatedRoom.status === 'occupied';

    setLoading(true);
    try {
      if (wasVacant && isNowBooked) {
        await api.bookRoom(updatedRoom.num, updatedRoom.guestData);

      } else if (wasVacant && isNowOccupied) {
        await api.checkInRoom(updatedRoom.num, updatedRoom.guestData);

      } else if (wasBooked && isNowOccupied) {
        await api.checkInRoom(updatedRoom.num, updatedRoom.guestData ?? {});

      } else if (wasBooked && isNowVacant) {
        await api.cancelBooking(updatedRoom.num);

      } else if (wasOccupied && isNowVacant) {
        const checkOutDate = updatedRoom.checkOutDate ?? new Date().toISOString().split('T')[0];
        const result = await api.checkOutRoom(updatedRoom.num, checkOutDate);
        await Promise.all([loadRooms(), loadGuests(), loadStayHistory()]);
        setLastCheckout({
          guest:        prev.guestData,
          room:         prev,
          checkOutDate: result.checkOutDate,
          nights:       result.nights,
          total:        result.total,
        });
        setScreen('receipt');
        return;

      } else if ((wasBooked && isNowBooked) || (wasOccupied && isNowOccupied)) {
        await api.updateRoomGuest(updatedRoom.num, updatedRoom.guestData);
      }

      await Promise.all([loadRooms(), loadGuests()]);
      setScreen('dashboard');
    } catch (err) {
      alert(err.message || 'Server error');
    } finally {
      setLoading(false);
    }
  }

  /* ── Room management: diff old vs new array and call appropriate API endpoints ── */
  async function handleSaveRooms(updatedRooms) {
    if (loading) return;
    setLoading(true);
    try {
      const added       = updatedRooms.filter(r => !rooms.find(o => o.num === r.num));
      const deleted     = rooms.filter(r => !updatedRooms.find(u => u.num === r.num));
      const typeChanged = updatedRooms.filter(r => {
        const old = rooms.find(o => o.num === r.num);
        return old && old.type !== r.type;
      });

      for (const r of added)       await api.createRoom(r.num, r.type);
      for (const r of deleted)     await api.deleteRoom(r.num);
      for (const r of typeChanged) await api.updateRoom(r.num, r.type);

      await loadRooms();
    } catch (err) {
      alert(err.message || 'Server error');
      await loadRooms();
    } finally {
      setLoading(false);
    }
  }

  /* ── Price management ── */
  async function handleSavePrices(newPrices) {
    try {
      const saved = await api.updatePrices(newPrices);
      setPrices(saved);
    } catch (err) {
      alert(err.message || 'Server error');
    }
  }

  /* ── User management: diff old vs new array and call appropriate API endpoints ── */
  async function handleSaveUsers(updatedUsers) {
    if (loading) return;
    setLoading(true);
    try {
      const added   = updatedUsers.filter(u => !users.find(o => o.id === u.id));
      const deleted = users.filter(u => !updatedUsers.find(upd => upd.id === u.id));
      const changed = updatedUsers.filter(u => {
        const old = users.find(o => o.id === u.id);
        if (!old) return false;
        return (
          old.name     !== u.name     ||
          old.username !== u.username ||
          old.role     !== u.role     ||
          old.active   !== u.active   ||
          !!u.password
        );
      });

      for (const u of added)   await api.createUser(u);
      for (const u of deleted) await api.deleteUser(u.id);
      for (const u of changed) await api.updateUser(u.id, u);

      const freshUsers = await api.getUsers().catch(() => []);
      setUsers(freshUsers);
    } catch (err) {
      alert(err.message || 'Server error');
    } finally {
      setLoading(false);
    }
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
      <Login onLogin={handleLogin} />
    );
  }

  if (screen === 'adminmenu') {
    return (
      <AdminMenu
        user={user}
        onNavigate={handleNavigate}
        onLogout={() => { api.setToken(null); setUser(null); setScreen('login'); }}
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
        onSavePrices={handleSavePrices}
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
