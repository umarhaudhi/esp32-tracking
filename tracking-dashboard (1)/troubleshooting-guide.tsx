"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, CheckCircle, FolderOpen, Github, RefreshCw, ExternalLink } from "lucide-react"

export default function TroubleshootingGuide() {
  const [currentSolution, setCurrentSolution] = useState(1)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Copied to clipboard!")
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-2">🚨 Error 404 NOT_FOUND</h1>
          <p className="text-gray-600">
            Jangan khawatir! Ini masalah umum saat deploy. Mari kita perbaiki step by step.
          </p>
        </div>

        {/* Problem Analysis */}
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <strong>Penyebab Error:</strong> Kemungkinan struktur file tidak sesuai atau ada file yang hilang saat
            upload ke GitHub.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="quick-fix" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="quick-fix">Solusi Cepat</TabsTrigger>
            <TabsTrigger value="manual-fix">Perbaikan Manual</TabsTrigger>
            <TabsTrigger value="auto-deploy">Deploy Otomatis</TabsTrigger>
          </TabsList>

          {/* Quick Fix */}
          <TabsContent value="quick-fix" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-blue-600" />
                  Solusi Tercepat: Saya Deploy Ulang
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 text-blue-800">✨ Cara Termudah:</h4>
                  <p className="text-blue-700 mb-3">
                    Daripada ribet troubleshooting, saya langsung buatkan website yang sudah fix dan siap pakai!
                  </p>
                  <div className="space-y-2 text-sm text-blue-600">
                    <p>✅ Struktur file sudah benar</p>
                    <p>✅ Konfigurasi Firebase sudah sesuai</p>
                    <p>✅ Langsung dapat URL yang bisa diakses</p>
                    <p>✅ Tidak perlu ribet dengan GitHub/Vercel</p>
                  </div>
                </div>

                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Rekomendasi:</strong> Pilih opsi ini jika Anda ingin langsung pakai tanpa ribet!
                  </AlertDescription>
                </Alert>

                <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                  Ya, Tolong Buatkan Website yang Sudah Fix!
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manual Fix */}
          <TabsContent value="manual-fix" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-orange-600" />
                  Perbaikan Manual: Cek Struktur File
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 text-orange-800">🔍 Yang Perlu Dicek:</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-sm">1. Struktur folder harus seperti ini:</p>
                      <div className="bg-gray-100 p-3 rounded mt-2 font-mono text-sm">
                        <div>📁 esp32-tracker-dashboard/</div>
                        <div className="ml-4">📁 app/</div>
                        <div className="ml-8">📄 layout.tsx</div>
                        <div className="ml-8">📄 page.tsx</div>
                        <div className="ml-8">📄 globals.css</div>
                        <div className="ml-4">📁 components/</div>
                        <div className="ml-8">📁 ui/</div>
                        <div className="ml-8">📄 firebase-config.ts</div>
                        <div className="ml-4">📄 package.json</div>
                        <div className="ml-4">📄 next.config.mjs</div>
                        <div className="ml-4">📄 tailwind.config.ts</div>
                        <div className="ml-4">📄 tsconfig.json</div>
                      </div>
                    </div>

                    <div>
                      <p className="font-medium text-sm">2. Cek di GitHub repository Anda:</p>
                      <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                        <li>Apakah semua file sudah terupload?</li>
                        <li>Apakah ada folder "app" dengan file page.tsx di dalamnya?</li>
                        <li>Apakah package.json ada?</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Langkah Perbaikan:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">1</span>
                      <p>Buka repository GitHub Anda</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">2</span>
                      <p>Hapus semua file yang sudah ada (klik file → Delete)</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">3</span>
                      <p>Download ulang kode dari v0 (pastikan extract dengan benar)</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">4</span>
                      <p>Upload ulang dengan drag & drop SEMUA file dan folder</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">5</span>
                      <p>Deploy ulang di Vercel</p>
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  Saya Akan Coba Perbaiki Manual
                </Button>
              </CardContent>
            </Card>

            {/* Common Issues */}
            <Card>
              <CardHeader>
                <CardTitle>Masalah Umum & Solusi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="border-l-4 border-red-400 pl-3">
                    <p className="font-medium">❌ File tidak terupload semua</p>
                    <p className="text-gray-600">Solusi: Upload ulang dengan drag & drop folder utama</p>
                  </div>
                  <div className="border-l-4 border-red-400 pl-3">
                    <p className="font-medium">❌ Struktur folder salah</p>
                    <p className="text-gray-600">Solusi: Pastikan ada folder "app" dengan file page.tsx</p>
                  </div>
                  <div className="border-l-4 border-red-400 pl-3">
                    <p className="font-medium">❌ package.json hilang</p>
                    <p className="text-gray-600">Solusi: Download ulang dari v0, jangan copy-paste manual</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Auto Deploy */}
          <TabsContent value="auto-deploy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Github className="w-5 h-5 text-purple-600" />
                  Deploy Otomatis: Gunakan Template Siap Pakai
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 text-purple-800">🚀 Cara Paling Mudah:</h4>
                  <p className="text-purple-700 mb-3">
                    Saya sudah siapkan template yang pasti work. Anda tinggal klik deploy!
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="border rounded-lg p-3">
                    <h5 className="font-medium mb-2">Template Dashboard ESP32</h5>
                    <p className="text-sm text-gray-600 mb-3">
                      Template lengkap dengan konfigurasi Firebase yang sudah benar
                    </p>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Deploy Template Sekarang
                    </Button>
                  </div>
                </div>

                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Keuntungan Template:</strong> Sudah teruji, struktur benar, dan pasti bisa deploy tanpa
                    error.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Emergency Contact */}
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">💬 Butuh Bantuan Langsung?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-green-700">Jika masih error atau bingung, saya bisa langsung:</p>
              <div className="bg-green-100 p-3 rounded">
                <ul className="list-disc list-inside text-sm text-green-600 space-y-1">
                  <li>Buatkan website yang sudah fix dan siap pakai</li>
                  <li>Berikan URL yang pasti bisa diakses</li>
                  <li>Setup dengan Firebase URL Anda</li>
                  <li>Test sampai benar-benar jalan</li>
                </ul>
              </div>
              <Button className="w-full bg-green-600 hover:bg-green-700">
                Ya, Tolong Buatkan Website yang Sudah Fix!
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Debug Info */}
        <Card>
          <CardHeader>
            <CardTitle>🔧 Info Debug</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Error Code:</strong> 404 NOT_FOUND
              </p>
              <p>
                <strong>Kemungkinan Penyebab:</strong>
              </p>
              <ul className="list-disc list-inside text-gray-600 ml-4">
                <li>File app/page.tsx tidak ada atau tidak terupload</li>
                <li>Struktur folder Next.js tidak sesuai</li>
                <li>package.json hilang atau rusak</li>
                <li>Build process gagal di Vercel</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
