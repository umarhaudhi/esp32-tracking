// Konfigurasi Firebase untuk menerima data dari ESP32
export const firebaseConfig = {
  // Nanti akan diisi dengan konfigurasi Firebase Anda
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id",
}

// Struktur data yang akan dikirim ESP32 ke Firebase
export interface TrackingData {
  deviceId: string
  timestamp: string
  location: {
    lat: number
    lng: number
    accuracy?: number
  }
  emergency?: {
    activated: boolean
    timestamp: string
  }
  battery?: number
  signal?: number
}

// Fungsi untuk mengirim data ke Firebase (akan digunakan di ESP32)
export const sendDataToFirebase = async (data: TrackingData) => {
  // Implementasi akan ditambahkan setelah setup Firebase
  console.log("Sending data to Firebase:", data)
}
