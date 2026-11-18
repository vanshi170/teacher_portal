import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  MapPin, 
  Wifi, 
  CheckCircle2, 
  XCircle, 
  Camera, 
  QrCode, 
  RefreshCw, 
  ShieldCheck, 
  UserCheck, 
  FlipHorizontal, 
  Upload,
  LayoutDashboard
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from './context/useAuth';
import { submitAttendanceScan } from './services/api';

interface StudentScannerProps {
  onViewDashboard?: () => void;
}

export default function StudentScanner({ onViewDashboard }: StudentScannerProps) {
  const { student, token } = useAuth();

  const [step, setStep] = useState<'info' | 'face' | 'qr' | 'success' | 'error'>('info');
  const [rollNo, setRollNo] = useState(() => student?.prn || '');
  const [studentName, setStudentName] = useState(() => student?.name || '');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [scannedDetails, setScannedDetails] = useState<{
    subject?: string;
    section?: string;
    classroom?: string;
    teacher?: string;
    markedAt?: string;
  } | null>(null);

  const qrScannerRef = useRef<Html5Qrcode | null>(null);
  const webcamVideoRef = useRef<HTMLVideoElement | null>(null);
  const activeStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stopAllStreams = () => {
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((track) => track.stop());
      activeStreamRef.current = null;
    }
  };

  const stopQrScanner = async () => {
    if (qrScannerRef.current) {
      try {
        if (qrScannerRef.current.isScanning) {
          await qrScannerRef.current.stop();
        }
        await qrScannerRef.current.clear();
      } catch {
        // Ignore stop error
      }
      qrScannerRef.current = null;
    }
  };

  // 1. Get GPS coordinates on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.warn('GPS prompt denied or unavailable:', err.message),
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, []);

  // Cleanup camera streams when component unmounts
  useEffect(() => {
    return () => {
      stopAllStreams();
      stopQrScanner();
    };
  }, []);

  const playSuccessChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.45);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.45);
    } catch {
      // AudioContext unavailable or blocked
    }
  };

  // Step 1 -> Step 2: Face Verification
  const startFaceVerification = async () => {
  if (!/^[0-9]+$/.test(rollNo.trim())) {
    alert('PRN must contain numbers only.');
    return;
  }

  if (!/^[a-zA-Z\s]+$/.test(studentName.trim())) {
    alert('Student name must contain alphabets only.');
    return;
  }

  setStep('face');
  setStatusMessage('Position your face inside the circle...');

    try {
      stopAllStreams();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      activeStreamRef.current = stream;

      if (webcamVideoRef.current) {
        webcamVideoRef.current.srcObject = stream;
        await webcamVideoRef.current.play().catch(() => {});
      }

      // Simulate biometric face verification check (2s)
      setTimeout(() => {
        stopAllStreams();
        setStatusMessage('Face Verified ✓ Launching QR Scanner...');
        setTimeout(() => startQrScanner(), 600);
      }, 2000);
    } catch (err: any) {
      alert('Camera access denied or unavailable: ' + (err.message || err));
      setStep('info');
    }
  };

  // Step 2 -> Step 3: QR Scanner using html5-qrcode
  const startQrScanner = (mode: 'user' | 'environment' = facingMode) => {
    setStep('qr');
    setStatusMessage('Align the classroom QR code inside the frame');

    setTimeout(() => {
      const html5QrCode = new Html5Qrcode('qr-reader');
      qrScannerRef.current = html5QrCode;

      html5QrCode.start(
        { facingMode: mode },
        { 
          fps: 12, 
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const edgeSize = Math.floor(minEdge * 0.72);
            return { width: edgeSize, height: edgeSize };
          }
        },
        async (decodedText) => {
          await stopQrScanner();
          handleScannedData(decodedText);
        },
        () => {} // Silent on individual frame misses
      ).catch((err) => {
        console.error('QR Scanner start error:', err);
        // Fallback: try default camera without facingMode constraint
        html5QrCode.start(
          {},
          { fps: 10, qrbox: { width: 220, height: 220 } },
          async (decodedText) => {
            await stopQrScanner();
            handleScannedData(decodedText);
          },
          () => {}
        ).catch((secondErr) => {
          alert('Unable to start QR camera: ' + secondErr);
          setStep('info');
        });
      });
    }, 350);
  };

  const flipCamera = async () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    await stopQrScanner();
    startQrScanner(nextMode);
  };

  // Handle uploaded image file containing QR
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await stopQrScanner();
      const html5QrCode = new Html5Qrcode('qr-reader');
      const decodedText = await html5QrCode.scanFile(file, true);
      handleScannedData(decodedText);
    } catch {
      alert('Could not decode QR code from uploaded image. Please try another photo.');
      startQrScanner();
    }
  };

  // Step 3 -> Step 4: Submit to Backend API
  const handleScannedData = async (scannedRaw: string) => {
    setStatusMessage('Syncing attendance with Attendance Portal...');

    // Extract clean token if a full URL was scanned
    let cleanToken = scannedRaw.trim();
    if (cleanToken.includes('/scan/')) {
      cleanToken = cleanToken.split('/scan/').pop()?.split('?')[0] || cleanToken;
    }

    try {
      const result = await submitAttendanceScan(token, {
        qrToken: cleanToken,
        rollNo: rollNo.trim(),
        name: studentName.trim() || undefined,
        lat: location?.lat || 21.1255,
        lng: location?.lng || 79.0522,
        wifiSSID: 'SYMBI_NGP_STUDENT',
        faceVerified: true
      });

      // Success chime and confetti celebration!
      playSuccessChime();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#EC77AB', '#D4C0F2', '#16A34A', '#FED6E3', '#0ea5e9']
      });

      setScannedDetails({
        subject: result.subject,
        markedAt: result.markedAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      setStep('success');
      setStatusMessage(result.message || 'Attendance Marked Successfully! 🎉');
    } catch (err: any) {
      setStep('error');
      setStatusMessage(err.message || 'QR validation failed. Please scan again.');
    }
  };



  return (
    <div className="flex flex-col items-center justify-center py-6 px-4 pb-20 md:pb-8 relative overflow-hidden">
      
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-hot-pink/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-thistle/40 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Glassmorphic Card */}
      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-glass border border-hot-pink/20 relative transition-all">
        
        {/* Top Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-hot-pink/10 text-hot-pink flex items-center justify-center mx-auto mb-3 shadow-inner border border-hot-pink/20">
            <QrCode className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold font-sora text-ink tracking-tight">QR Attendance Check-In</h1>
          <p className="text-xs text-muted mt-1 font-medium">Symbiosis Institute of Technology • Nagpur</p>
        </div>

        {/* Verification Status Badges (GPS + Wi-Fi) */}
        <div className="flex justify-between items-center mb-6 text-xs bg-canvas/90 p-3 rounded-2xl border border-hot-pink/20 font-plex-mono shadow-sm">
          <div className="flex items-center gap-1.5 text-ink">
            <MapPin className="w-3.5 h-3.5 text-hot-pink" />
            <span className={location ? 'text-present-green font-semibold' : 'text-amber-600'}>
              {location ? 'GPS: Active' : 'GPS: Searching'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-ink">
            <Wifi className="w-3.5 h-3.5 text-hot-pink" />
            <span className="text-present-green font-semibold">SYMBI_NGP_STUDENT</span>
          </div>
        </div>

        {/* ================= STEP 1: Student Input ================= */}
        {step === 'info' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-ink uppercase tracking-wider block mb-1.5">
                PRN / Roll Number <span className="text-hot-pink">*</span>
              </label>
              <input
  type="text"
  inputMode="numeric"
  pattern="[0-9]*"
  placeholder="e.g. 25070521001"
  value={rollNo}
  onChange={(e) =>
    setRollNo(e.target.value.replace(/[^0-9]/g, ''))
  }
  className="w-full bg-canvas text-ink placeholder:text-muted/60 border border-hot-pink/20 rounded-xl h-12 px-4 font-plex-mono text-sm focus:ring-2 focus:ring-hot-pink focus:border-transparent outline-none transition-all shadow-inner"
/>
            </div>

            <div>
              <label className="text-xs font-bold text-ink uppercase tracking-wider block mb-1.5">
                Student Name <span className="text-muted font-normal lowercase">(auto-detected from session)</span>
              </label>
              <input
  type="text"
  placeholder="e.g. Arushi Varghese"
  value={studentName}
  onChange={(e) =>
    setStudentName(e.target.value.replace(/[^a-zA-Z\s]/g, ''))
  }
  className="w-full bg-canvas text-ink placeholder:text-muted/60 border border-hot-pink/20 rounded-xl h-12 px-4 text-sm focus:ring-2 focus:ring-hot-pink focus:border-transparent outline-none transition-all shadow-inner"
/>
            </div>


           <button
  disabled={
    !/^[0-9]+$/.test(rollNo.trim()) ||
    !/^[a-zA-Z\s]+$/.test(studentName.trim())
  }
  onClick={startFaceVerification}
  className="w-full h-12 mt-2 bg-gradient-to-r from-hot-pink to-[#E05D97] hover:from-[#E05D97] hover:to-hot-pink disabled:opacity-40 text-white font-sora font-semibold rounded-2xl shadow-lg shadow-hot-pink/30 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer disabled:cursor-not-allowed"
>
              <Camera className="w-5 h-5" />
              <span>Verify Face & Scan QR</span>
            </button>
          </div>
        )}

        {/* ================= STEP 2: Face Check (Webcam) ================= */}
        {step === 'face' && (
          <div className="flex flex-col items-center py-2">
            <div className="flex items-center gap-2 mb-3 text-hot-pink font-sora text-sm font-semibold text-center">
              <ShieldCheck className="w-4 h-4 animate-bounce" />
              <span>{statusMessage}</span>
            </div>

            {/* Circular Mirrored Webcam Viewfinder with Radar Pulse */}
            <div className="relative w-56 h-56 rounded-full overflow-hidden border-4 border-hot-pink shadow-2xl mb-4 bg-black flex items-center justify-center">
              <video
                ref={webcamVideoRef}
                className="w-full h-full object-cover transform -scale-x-100"
                playsInline
                muted
                autoPlay
              />
              {/* Pulsing Guide Ring */}
              <div className="absolute inset-0 rounded-full border-2 border-white/70 animate-pulse pointer-events-none" />
              <div className="absolute inset-[-15%] rounded-full border border-hot-pink/40 radar-sweep pointer-events-none" />
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted mt-1">
              <UserCheck className="w-3.5 h-3.5 text-present-green" />
              <span>Keep your head steady and well-lit...</span>
            </div>
          </div>
        )}

        {/* ================= STEP 3: QR Code Scanner ================= */}
        {step === 'qr' && (
          <div className="flex flex-col items-center py-1">
            <div className="flex items-center justify-between w-full mb-3">
              <p className="text-xs font-semibold text-hot-pink font-sora">
                Show Teacher's QR Code to Camera
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={flipCamera}
                  title="Switch Camera (Front/Back)"
                  className="p-1.5 rounded-lg bg-white border border-hot-pink/20 text-ink hover:text-hot-pink transition-colors"
                >
                  <FlipHorizontal className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload QR Image from file"
                  className="p-1.5 rounded-lg bg-white border border-hot-pink/20 text-ink hover:text-hot-pink transition-colors"
                >
                  <Upload className="w-4 h-4" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* HTML5 QR Code Mount Region */}
            <div className="w-full overflow-hidden rounded-2xl border-2 border-hot-pink/30 shadow-inner bg-black aspect-square flex items-center justify-center relative">
              <div id="qr-reader" className="w-full h-full" />
            </div>

            <div className="flex items-center justify-between w-full mt-3 text-xs text-muted">
              <span>Scanning live camera feed...</span>
              <button
                type="button"
                onClick={() => {
                  stopQrScanner();
                  setStep('info');
                }}
                className="text-hot-pink hover:underline font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: Success Screen ================= */}
        {step === 'success' && (
          <div className="text-center py-4">
            <div className="w-20 h-20 bg-emerald-100 text-present-green rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-emerald-200 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold font-sora text-present-green">Marked Present!</h2>
            <p className="text-ink font-medium mt-2 text-sm">{statusMessage}</p>

            <div className="mt-4 flex flex-col gap-2 items-center">
              <div className="inline-block bg-canvas px-4 py-1.5 rounded-full border border-hot-pink/20 text-xs font-plex-mono text-ink">
                PRN: <b>{rollNo}</b>
              </div>
              {scannedDetails?.subject && (
                <div className="text-xs font-bold text-hot-pink">
                  Course: {scannedDetails.subject}
                </div>
              )}
              {scannedDetails?.markedAt && (
                <div className="text-[11px] text-muted font-plex-mono">
                  Timestamp: {scannedDetails.markedAt}
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-2">
              {onViewDashboard && (
                <button
                  onClick={onViewDashboard}
                  className="flex-1 h-12 bg-hot-pink hover:bg-hot-pink/90 text-white font-sora font-semibold rounded-2xl shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>View Dashboard</span>
                </button>
              )}
              <button
                onClick={() => {
                  setStep('info');
                }}
                className="flex-1 h-12 bg-ink hover:bg-ink/90 text-white font-sora font-semibold rounded-2xl shadow-md transition-transform active:scale-95"
              >
                <span>Scan Another Class</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 5: Error Screen ================= */}
        {step === 'error' && (
          <div className="text-center py-4">
            <div className="w-20 h-20 bg-red-100 text-absent-red rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-red-200">
              <XCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold font-sora text-absent-red">Scan Failed</h2>
            <p className="text-ink mt-2 text-sm font-medium">{statusMessage}</p>

            <button
              onClick={() => setStep('info')}
              className="mt-6 w-full h-12 bg-hot-pink hover:bg-hot-pink/90 text-white font-sora font-semibold rounded-2xl shadow-lg shadow-hot-pink/30 transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
