// Room type codes: 'twin-s' | 'twin-l' | 'single-s' | 'single-l'
// Status:          'vacant' | 'booked'  | 'occupied'

export const initialRooms = [

  // ── Twin Small (ຕຽງຄູ່ນ້ອຍ) ──────────────────────────
  {
    num: '02', type: 'twin-s', status: 'booked',
    guestData: {
      nickName: 'ຄຳດີ',   firstName: '', middleName: '', lastName: 'ທ່າວ',
      age: '32',           gender: 'male', phone: '020-5511-2233',
      checkIn:  '2023-02-14', checkOut: '',
    },
  },
  {
    num: '04', type: 'twin-s', status: 'vacant',
    guestData: null,
  },
  {
    num: '06', type: 'twin-s', status: 'occupied',
    guestData: {
      nickName: 'ເດືອນ',  firstName: '', middleName: '', lastName: '',
      age: '28',           gender: 'female', phone: '030-2244-5566',
      checkIn:  '2023-02-12', checkOut: '2023-02-16',
    },
  },
  {
    num: '08', type: 'twin-s', status: 'occupied',
    guestData: {
      nickName: 'ຄຳຫລາ', firstName: '', middleName: '', lastName: '',
      age: '',              gender: '',      phone: '',
      checkIn:  '2023-02-10', checkOut: '',
    },
  },
  {
    num: '10', type: 'twin-s', status: 'vacant',
    guestData: null,
  },

  // ── Twin Large (ຕຽງຄູ່ໃຫຍ່) ──────────────────────────
  {
    num: '12', type: 'twin-l', status: 'vacant',
    guestData: null,
  },
  {
    num: '14', type: 'twin-l', status: 'vacant',
    guestData: null,
  },
  {
    num: '16', type: 'twin-l', status: 'vacant',
    guestData: null,
  },
  {
    num: '18', type: 'twin-l', status: 'occupied',
    guestData: {
      nickName: 'ກ',      firstName: '', middleName: '', lastName: 'ທ່າວ',
      age: '45',           gender: 'male', phone: '020-9988-7766',
      checkIn:  '2023-02-11', checkOut: '',
    },
  },
  {
    num: '20', type: 'twin-l', status: 'vacant',
    guestData: null,
  },

  // ── Single Small (ຕຽງດ່ຽວນ້ອຍ) ──────────────────────
  { num: '01', type: 'single-s', status: 'vacant', guestData: null },
  { num: '03', type: 'single-s', status: 'vacant', guestData: null },
  { num: '05', type: 'single-s', status: 'vacant', guestData: null },
  { num: '07', type: 'single-s', status: 'vacant', guestData: null },
  { num: '09', type: 'single-s', status: 'vacant', guestData: null },

  // ── Single Large (ຕຽງດ່ຽວໃຫຍ່) ──────────────────────
  {
    num: '28', type: 'single-l', status: 'booked',
    guestData: {
      nickName: 'ແສງ',   firstName: '', middleName: '', lastName: 'ທ່າວ',
      age: '38',          gender: 'male', phone: '021-3344-5599',
      checkIn:  '2023-02-15', checkOut: '',
    },
  },
  {
    num: '29', type: 'single-l', status: 'occupied',
    guestData: {
      nickName: 'ສົມໃຈ', firstName: '', middleName: '', lastName: '',
      age: '25',            gender: 'female', phone: '020-7711-8822',
      checkIn:  '2023-02-13', checkOut: '2023-02-17',
    },
  },
  { num: '30', type: 'single-l', status: 'vacant', guestData: null },
  { num: '31', type: 'single-l', status: 'vacant', guestData: null },
  { num: '32', type: 'single-l', status: 'vacant', guestData: null },
  {
    num: '33', type: 'single-l', status: 'booked',
    guestData: {
      nickName: 'ສົມສີ', firstName: '', middleName: '', lastName: 'ທ່າວ',
      age: '41',            gender: 'male', phone: '030-6655-4433',
      checkIn:  '2023-02-16', checkOut: '',
    },
  },
  { num: '34', type: 'single-l', status: 'vacant', guestData: null },
  { num: '35', type: 'single-l', status: 'vacant', guestData: null },
];

export function getGuestName(room) {
  if (!room.guestData) return '';
  return [room.guestData.nickName, room.guestData.firstName, room.guestData.lastName]
    .filter(Boolean)
    .join(' ');
}

export const ROOM_TYPE_KEYS = ['twin-s', 'twin-l', 'single-s', 'single-l'];

export const TYPE_ORDER = ['twin-s', 'twin-l', 'single-s', 'single-l'];

export function createRoom(num, type) {
  return {
    num,
    type,
    status: 'vacant',
    guestData: null,
  };
}

export const ROOM_TYPES = {
  'twin-s':   'twinSmall',
  'twin-l':   'twinLarge',
  'single-s': 'singleSmall',
  'single-l': 'singleLarge',
};

export const PRICES = {
  'twin-s':   80000,
  'twin-l':   90000,
  'single-s': 70000,
  'single-l': 80000,
};
