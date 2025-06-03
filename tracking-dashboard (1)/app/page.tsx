"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, AlertTriangle, Phone, Navigation, Wifi, WifiOff, RefreshCw, CheckCircle } from "lucide-react"

// ==================== KONFIGURASI FIREBASE ANDA ====================
const firebaseConfig = {
  databaseURL: "https://esp32-tracker-5-default-rtdb.asia-southeast1.firebasedatabase.app",
}

// Device ID harus sama dengan yang di ESP32
const DEVICE_ID = "ESP32_TRACKER_001"

interface LocationData {
  lat: number
  lng: number
  timestamp: number
  accuracy?: number
  satellites?: number
  speed?: number
  isEmergency?: boolean
  deviceId: string
}

interface StatsData {
  todayDistance: number
  locationCount: number
  lastUpdate: number
  deviceId: string
  wifiConnected: boolean
  gsmConnected: boolean
}

interface EmergencyData {
  activated: boolean
  timestamp: number
  lat: number
  lng: number
  deviceId: string
  processed: boolean
}

export default function TrackingDashboard() {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null)
  const [stats, setStats] = useState<StatsData | null>(null)
  const [emergency, setEmergency] = useState<EmergencyData | null>(null)
  const [locationHistory, setLocationHistory] = useState<LocationData[]>([])
  const [isOnline, setIsOnline] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fungsi untuk fetch data dari Firebase
  const fetchFirebaseData = async () => {
    try {
      setIsRefreshing(true)
      setError(null)

      console.log("🔄 Fetching data from Firebase...")
      console.log("📡 Firebase URL:", firebaseConfig.databaseURL)
      console.log("🆔 Device ID:", DEVICE_ID)

      // Fetch current location (ambil yang terbaru)
      const locationsUrl = `${firebaseConfig.databaseURL}/tracking/${DEVICE_ID}/locations.json?orderBy="timestamp"&limitToLast=1`
      console.log("📍 Fetching locations from:", locationsUrl)

      const locationsResponse = await fetch(locationsUrl)
      console.log("📍 Locations response status:", locationsResponse.status)

      if (locationsResponse.ok) {
        const locationsData = await locationsResponse.json()
        console.log("📍 Locations data:", locationsData)

        if (locationsData && Object.keys(locationsData).length > 0) {
          const latestLocation = Object.values(locationsData)[0] as LocationData
          if (latestLocation && typeof latestLocation.lat === "number" && typeof latestLocation.lng === "number") {
            setCurrentLocation(latestLocation)
            setLastUpdate(new Date(latestLocation.timestamp))
            setIsOnline(Date.now() - latestLocation.timestamp < 120000) // Online jika update < 2 menit
            console.log("✅ Current location updated:", latestLocation)
          }
        } else {
          console.log("⚠️ No location data found")
        }
      } else {
        console.log("❌ Failed to fetch locations:", locationsResponse.statusText)
      }

      // Fetch stats
      const statsUrl = `${firebaseConfig.databaseURL}/tracking/${DEVICE_ID}/stats.json`
      console.log("📊 Fetching stats from:", statsUrl)

      const statsResponse = await fetch(statsUrl)
      console.log("📊 Stats response status:", statsResponse.status)

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        console.log("📊 Stats data:", statsData)

        if (statsData && typeof statsData.todayDistance === "number") {
          setStats(statsData)
          console.log("✅ Stats updated:", statsData)
        }
      }

      // Fetch emergency status
      const emergencyUrl = `${firebaseConfig.databaseURL}/tracking/${DEVICE_ID}/emergency.json`
      console.log("🚨 Fetching emergency from:", emergencyUrl)

      const emergencyResponse = await fetch(emergencyUrl)
      console.log("🚨 Emergency response status:", emergencyResponse.status)

      if (emergencyResponse.ok) {
        const emergencyData = await emergencyResponse.json()
        console.log("🚨 Emergency data:", emergencyData)

        if (emergencyData && typeof emergencyData.lat === "number" && typeof emergencyData.lng === "number") {
          setEmergency(emergencyData)
          console.log("✅ Emergency updated:", emergencyData)
        }
      }

      // Fetch location history (10 terakhir)
      const historyUrl = `${firebaseConfig.databaseURL}/tracking/${DEVICE_ID}/locations.json?orderBy="timestamp"&limitToLast=10`
      console.log("📜 Fetching history from:", historyUrl)

      const historyResponse = await fetch(historyUrl)
      console.log("📜 History response status:", historyResponse.status)

      if (historyResponse.ok) {
        const historyData = await historyResponse.json()
        console.log("📜 History data:", historyData)

        if (historyData && Object.keys(historyData).length > 0) {
          const historyArray = Object.values(historyData) as LocationData[]
          // Filter data yang valid
          const validHistory = historyArray.filter(
            (location) => location && typeof location.lat === "number" && typeof location.lng === "number",
          )
          setLocationHistory(validHistory.reverse()) // Urutkan dari terbaru
          console.log("✅ History updated:", validHistory.length, "locations")
        }
      }

      setIsLoading(false)
      console.log("✅ Data fetch completed successfully")
    } catch (error) {
      console.error("❌ Error fetching Firebase data:", error)
      setError(`Gagal mengambil data dari Firebase: ${error instanceof Error ? error.message : "Unknown error"}`)
      setIsOnline(false)
      setIsLoading(false)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Auto refresh data setiap 30 detik
  useEffect(() => {
    console.log("🚀 Dashboard started, fetching initial data...")
    fetchFirebaseData() // Load pertama kali

    const interval = setInterval(() => {
      console.log("🔄 Auto refresh triggered...")
      fetchFirebaseData()
    }, 30000) // Refresh setiap 30 detik

    return () => {
      console.log("🛑 Cleanup: stopping auto refresh")
      clearInterval(interval)
    }
  }, [])

  const formatTime = (timestamp: number) => {
    if (!timestamp || isNaN(timestamp)) return "Waktu tidak valid"
    return new Date(timestamp).toLocaleString("id-ID")
  }

  const getTimeSince = (timestamp: number) => {
    if (!timestamp || isNaN(timestamp)) return "Waktu tidak valid"

    const now = Date.now()
    const diffMs = now - timestamp
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMins / 60)

    if (diffHours > 0) {
      return `${diffHours} jam ${diffMins % 60} menit yang lalu`
    }
    return `${diffMins} menit yang lalu`
  }

  const getLocationAddress = (lat?: number, lng?: number) => {
    if (typeof lat !== "number" || typeof lng !== "number" || isNaN(lat) || isNaN(lng)) {
      return "Koordinat tidak valid"
    }
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
  }

  const createMapsUrl = (lat?: number, lng?: number) => {
    if (typeof lat !== "number" || typeof lng !== "number" || isNaN(lat) || isNaN(lng)) {
      return "#"
    }
    return `https://maps.google.com/?q=${lat},${lng}`
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data dari Firebase...</p>
          <p className="text-sm text-gray-500 mt-2">Pastikan ESP32 sudah mengirim data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Tracking ESP32</h1>
            <p className="text-gray-600">Monitor lokasi dan status perangkat secara real-time</p>
            <p className="text-sm text-gray-500">Device ID: {DEVICE_ID}</p>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={fetchFirebaseData} variant="outline" size="sm" disabled={isRefreshing}>
              {isRefreshing ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Refresh Data
            </Button>
            <Badge variant={isOnline ? "default" : "destructive"} className="flex items-center gap-1">
              {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {isOnline ? "Online" : "Offline"}
            </Badge>
          </div>
        </div>

        {/* Configuration Status */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800 font-medium">Dashboard Siap Digunakan!</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-green-600">Firebase URL:</p>
              <p className="font-mono text-xs break-all">{firebaseConfig.databaseURL}</p>
            </div>
            <div>
              <p className="text-green-600">Status:</p>
              <p className="text-green-700">✅ Terkonfigurasi dengan benar</p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <p className="text-red-800 font-medium">Error</p>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
            <div className="mt-3 space-y-2 text-sm text-red-600">
              <p>• Pastikan ESP32 terhubung ke WiFi</p>
              <p>• Cek URL Firebase di kode ESP32: {firebaseConfig.databaseURL}</p>
              <p>• Pastikan Firebase rules mengizinkan read/write</p>
            </div>
            <Button onClick={fetchFirebaseData} variant="outline" size="sm" className="mt-2">
              Coba Lagi
            </Button>
          </div>
        )}

        {/* Last Update Info */}
        {lastUpdate && (
          <div className="text-sm text-gray-600 text-center">
            Update terakhir: {lastUpdate.toLocaleString("id-ID")} ({getTimeSince(lastUpdate.getTime())})
          </div>
        )}

        {/* No Data Message */}
        {!currentLocation && !stats && !emergency && !isLoading && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <MapPin className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-yellow-800 mb-2">Menunggu Data dari ESP32</h3>
            <p className="text-yellow-700 mb-4">Dashboard sudah siap, tapi belum menerima data dari perangkat ESP32.</p>
            <div className="space-y-2 text-sm text-yellow-600 text-left max-w-md mx-auto">
              <p>
                📋 <strong>Langkah selanjutnya:</strong>
              </p>
              <p>1. Pastikan ESP32 terhubung ke WiFi</p>
              <p>2. Update kode ESP32 dengan URL Firebase ini:</p>
              <div className="bg-yellow-100 p-2 rounded font-mono text-xs break-all">{firebaseConfig.databaseURL}</div>
              <p>3. Upload kode ke ESP32 dan cek Serial Monitor</p>
              <p>4. Tunggu beberapa menit untuk data pertama</p>
            </div>
            <Button onClick={fetchFirebaseData} className="mt-4">
              Coba Ambil Data Lagi
            </Button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status Perangkat</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${isOnline ? "text-green-600" : "text-red-600"}`}>
                {isOnline ? "Online" : "Offline"}
              </div>
              {currentLocation ? (
                <>
                  <p className="text-xs text-muted-foreground">
                    {getLocationAddress(currentLocation.lat, currentLocation.lng)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{getTimeSince(currentLocation.timestamp)}</p>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">Menunggu data GPS...</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jarak Hari Ini</CardTitle>
              <Navigation className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats && typeof stats.todayDistance === "number" ? `${stats.todayDistance.toFixed(1)} km` : "0.0 km"}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats && typeof stats.locationCount === "number"
                  ? `${stats.locationCount} titik lokasi`
                  : "0 titik lokasi"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status Darurat</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {emergency?.activated ? (
                <div className="text-2xl font-bold text-red-600">AKTIF</div>
              ) : (
                <div className="text-2xl font-bold text-green-600">Normal</div>
              )}
              {emergency && emergency.timestamp && (
                <p className="text-xs text-muted-foreground">{getTimeSince(emergency.timestamp)}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Konektivitas</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>WiFi:</span>
                  <Badge variant={stats?.wifiConnected ? "default" : "secondary"} className="text-xs">
                    {stats?.wifiConnected ? "Connected" : "Disconnected"}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>GSM:</span>
                  <Badge variant={stats?.gsmConnected ? "default" : "secondary"} className="text-xs">
                    {stats?.gsmConnected ? "Connected" : "Disconnected"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="location" className="space-y-4">
          <TabsList>
            <TabsTrigger value="location">Lokasi Real-time</TabsTrigger>
            <TabsTrigger value="history">Riwayat Tracking</TabsTrigger>
            <TabsTrigger value="emergency">Status Darurat</TabsTrigger>
            <TabsTrigger value="setup">Setup ESP32</TabsTrigger>
          </TabsList>

          <TabsContent value="location" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Lokasi Terkini</CardTitle>
                  <CardDescription>Posisi GPS perangkat saat ini</CardDescription>
                </CardHeader>
                <CardContent>
                  {currentLocation ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-3 h-3 rounded-full ${isOnline ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
                          />
                          <div>
                            <p className="font-medium">GPS Valid</p>
                            <p className="text-sm text-gray-600">
                              {getLocationAddress(currentLocation.lat, currentLocation.lng)}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <a
                            href={createMapsUrl(currentLocation.lat, currentLocation.lng)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Buka Maps
                          </a>
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Latitude</p>
                          <p className="font-mono">{currentLocation.lat?.toFixed(6) || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Longitude</p>
                          <p className="font-mono">{currentLocation.lng?.toFixed(6) || "N/A"}</p>
                        </div>
                        {currentLocation.satellites && (
                          <div>
                            <p className="text-gray-600">Satelit</p>
                            <p className="font-mono">{currentLocation.satellites}</p>
                          </div>
                        )}
                        {currentLocation.speed && (
                          <div>
                            <p className="text-gray-600">Kecepatan</p>
                            <p className="font-mono">{currentLocation.speed.toFixed(1)} km/h</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Menunggu data GPS dari ESP32...</p>
                      <p className="text-sm mt-2">Pastikan perangkat terhubung ke WiFi</p>
                      <Button onClick={fetchFirebaseData} variant="outline" size="sm" className="mt-3">
                        Refresh Data
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Statistik Pergerakan</CardTitle>
                  <CardDescription>Data tracking hari ini</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Jarak</span>
                        <span className="font-bold">
                          {typeof stats.todayDistance === "number" ? `${stats.todayDistance.toFixed(1)} km` : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Titik Lokasi</span>
                        <span className="font-bold">
                          {typeof stats.locationCount === "number" ? stats.locationCount : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Update Terakhir</span>
                        <span className="text-sm">{stats.lastUpdate ? getTimeSince(stats.lastUpdate) : "N/A"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Device ID</span>
                        <span className="text-sm font-mono">{stats.deviceId || "N/A"}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Navigation className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Menunggu data statistik...</p>
                      <Button onClick={fetchFirebaseData} variant="outline" size="sm" className="mt-3">
                        Refresh Data
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Riwayat Lokasi</CardTitle>
                <CardDescription>10 lokasi terakhir yang tercatat</CardDescription>
              </CardHeader>
              <CardContent>
                {locationHistory.length > 0 ? (
                  <div className="space-y-3">
                    {locationHistory.map((location, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                        <div className="flex-shrink-0">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              location.isEmergency ? "bg-red-100" : "bg-blue-100"
                            }`}
                          >
                            {location.isEmergency ? (
                              <AlertTriangle className="w-4 h-4 text-red-600" />
                            ) : (
                              <MapPin className="w-4 h-4 text-blue-600" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">
                            {getLocationAddress(location.lat, location.lng)}
                            {location.isEmergency && (
                              <Badge variant="destructive" className="ml-2 text-xs">
                                DARURAT
                              </Badge>
                            )}
                          </p>
                          <p className="text-sm text-gray-600">
                            {location.lat?.toFixed(6) || "N/A"}, {location.lng?.toFixed(6) || "N/A"}
                          </p>
                          {location.speed && (
                            <p className="text-xs text-gray-500">Kecepatan: {location.speed.toFixed(1)} km/h</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{formatTime(location.timestamp)}</p>
                          <p className="text-xs text-gray-500">{getTimeSince(location.timestamp)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Belum ada riwayat lokasi</p>
                    <p className="text-sm mt-2">Data akan muncul setelah ESP32 mengirim lokasi</p>
                    <Button onClick={fetchFirebaseData} variant="outline" size="sm" className="mt-3">
                      Refresh Data
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="emergency" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Status Darurat</CardTitle>
                <CardDescription>Monitoring tombol darurat dan aktivasi</CardDescription>
              </CardHeader>
              <CardContent>
                {emergency ? (
                  <div className="space-y-4">
                    <div
                      className={`p-4 rounded-lg border ${
                        emergency.activated ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${emergency.activated ? "bg-red-500" : "bg-green-500"}`}
                        />
                        <div>
                          <p className={`font-medium ${emergency.activated ? "text-red-800" : "text-green-800"}`}>
                            {emergency.activated ? "DARURAT AKTIF!" : "Status Normal"}
                          </p>
                          <p className={`text-sm ${emergency.activated ? "text-red-600" : "text-green-600"}`}>
                            {emergency.activated ? "Tombol darurat telah ditekan!" : "Tidak ada aktivasi darurat"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-3">Detail Aktivasi Terakhir</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Waktu</span>
                          <span className="font-medium">{formatTime(emergency.timestamp)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Lokasi</span>
                          <span className="font-medium">{getLocationAddress(emergency.lat, emergency.lng)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status</span>
                          <Badge variant={emergency.activated ? "destructive" : "outline"}>
                            {emergency.activated ? "Aktif" : "Selesai"}
                          </Badge>
                        </div>
                        <div className="mt-3">
                          <Button size="sm" variant="outline" asChild>
                            <a
                              href={createMapsUrl(emergency.lat, emergency.lng)}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Lihat Lokasi Darurat
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Belum ada data darurat</p>
                    <p className="text-sm mt-2">Status akan muncul jika tombol darurat ditekan</p>
                    <Button onClick={fetchFirebaseData} variant="outline" size="sm" className="mt-3">
                      Refresh Data
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="setup" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Setup ESP32</CardTitle>
                <CardDescription>Konfigurasi yang diperlukan di kode ESP32 Anda</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">1. Update URL Firebase di ESP32:</h4>
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Ganti baris ini di kode ESP32:</p>
                      <code className="text-sm">const char* firebaseURL = "{firebaseConfig.databaseURL}";</code>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">2. Pastikan Device ID sama:</h4>
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <code className="text-sm">const char* deviceId = "{DEVICE_ID}";</code>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">3. Update WiFi credentials:</h4>
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <code className="text-sm">
                        const char* ssid = "NAMA_WIFI_ANDA";
                        <br />
                        const char* password = "PASSWORD_WIFI_ANDA";
                      </code>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">4. Test koneksi:</h4>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-700">
                        Setelah upload kode, buka Serial Monitor dan ketik <code>test</code> untuk test koneksi ke
                        Firebase.
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Status Konfigurasi:</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Dashboard: Siap</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full ${
                            currentLocation ? "bg-green-600" : "bg-gray-400"
                          } flex items-center justify-center`}
                        >
                          {currentLocation ? "✓" : "?"}
                        </div>
                        <span className="text-sm">ESP32: {currentLocation ? "Terhubung" : "Belum terhubung"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
