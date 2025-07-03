import { db } from './firebase'; // Assumes you have a firebase.js exporting a Firestore db instance

// Save data to the shared/global Firestore document under a dynamic key
export const saveData = async (key, data) => {
  try {
    const docRef = db.collection('sharedData').doc('globalDoc');
    const doc = await docRef.get();
    const oldData = doc.exists ? doc.data() : {};
    await docRef.set({ ...oldData, [key]: data });
  } catch (error) {
    console.error("Error saving to Firestore", error);
  }
};

// Load data from the shared/global Firestore document by key
export const loadData = async (key, defaultValue = null) => {
  try {
    const doc = await db.collection('sharedData').doc('globalDoc').get();
    if (doc.exists) {
      const data = doc.data();
      return data && data[key] !== undefined ? data[key] : defaultValue;
    }
    return defaultValue;
  } catch (error) {
    console.error("Error loading from Firestore", error);
    return defaultValue;
  }
};

export const studentDetailFields = [
  { id: 'class', label: 'Class', type: 'text' },
  { id: 'regNo', label: 'Registration Number', type: 'text' },
  { id: 'address', label: 'Address', type: 'textarea' },
  { id: 'dob', label: 'Date of Birth', type: 'date' },
  { id: 'houseName', label: 'House Name', type: 'text' },
  { id: 'fatherName', label: 'Father\'s Name', type: 'text' },
  { id: 'phone', label: 'Phone Number', type: 'tel' },
  { id: 'email', label: 'Email Address', type: 'email' },
  { id: 'photo', label: 'Student Photo', type: 'png' },
];

export const initialStudentData = () => {
  const data = {};
  studentDetailFields.forEach(field => {
    data[field.id] = '';
  });
  return data;
};
