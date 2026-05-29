'use client';

import * as React from 'react';
import { Camera, CameraOff, User, Video, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const VoiceRecorder = () => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const [permissionState, setPermissionState] = React.useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [cameraActive, setCameraActive] = React.useState(true);
  const [loading, setLoading] = React.useState(false);

  const startCamera = React.useCallback(async () => {
    setLoading(true);
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false, // Audio is handled by SpeechRecognition separately
      });

      setStream(mediaStream);
      setPermissionState('granted');
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Webcam access error:', error);
      setPermissionState('denied');
      setCameraActive(false);
    } finally {
      setLoading(false);
    }
  }, [stream]);

  const stopCamera = React.useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  React.useEffect(() => {
    if (cameraActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraActive]);

  const handleToggleCamera = () => {
    setCameraActive((prev) => !prev);
  };

  return (
    <div className="relative w-full h-full min-h-[320px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex flex-col justify-between group">
      
      {/* Video stream container */}
      <div className="absolute inset-0 flex items-center justify-center bg-slate-950 z-0">
        <AnimatePresence mode="wait">
          {cameraActive && permissionState === 'granted' ? (
            <motion.video
              key="video"
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          ) : (
            <motion.div
              key="placeholder"
              className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900 text-slate-400 p-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative mb-4">
                <div className="w-20 h-20 rounded-full bg-slate-800/80 flex items-center justify-center border border-slate-700">
                  {permissionState === 'denied' ? (
                    <CameraOff className="w-8 h-8 text-rose-500" />
                  ) : (
                    <User className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                {permissionState === 'granted' && !cameraActive && (
                  <span className="absolute bottom-0 right-0 w-4 h-4 bg-amber-500 border-2 border-slate-900 rounded-full" />
                )}
                {permissionState === 'denied' && (
                  <span className="absolute bottom-0 right-0 w-4 h-4 bg-rose-500 border-2 border-slate-900 rounded-full animate-ping" />
                )}
              </div>
              
              <h3 className="text-sm font-semibold text-slate-200">
                {permissionState === 'denied' 
                  ? 'Camera Access Denied' 
                  : !cameraActive 
                    ? 'Camera Feed Paused'
                    : 'Awaiting Permission'}
              </h3>
              <p className="text-xs text-slate-500 max-w-[240px] mt-1">
                {permissionState === 'denied' 
                  ? 'Please check your browser permissions to enable video coaching feedback.' 
                  : 'Toggle your camera from the controls below to resume live visual monitoring.'}
              </p>

              {permissionState === 'denied' && (
                <button
                  onClick={startCamera}
                  className="mt-4 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-300 transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  Retry Permission
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Decorative scanning line animation when camera is active */}
      {cameraActive && permissionState === 'granted' && (
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent shadow-[0_0_8px_rgba(99,102,241,0.5)] pointer-events-none animate-[scan_3s_linear_infinite]" />
      )}

      {/* Top Controls Overlay */}
      <div className="p-4 flex items-center justify-between z-10 bg-gradient-to-b from-slate-950/80 to-transparent pointer-events-none">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-800 pointer-events-auto">
          <span className={`w-2 h-2 rounded-full ${cameraActive && permissionState === 'granted' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">Candidate Feed</span>
        </div>

        <button
          onClick={handleToggleCamera}
          className="p-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800/95 border border-slate-800 backdrop-blur-md text-slate-300 hover:text-white transition-all pointer-events-auto shadow-md"
          title={cameraActive ? 'Turn off camera' : 'Turn on camera'}
        >
          {cameraActive ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4 text-rose-400" />}
        </button>
      </div>

      {/* Bottom overlay (gradient transition) */}
      <div className="h-16 bg-gradient-to-t from-slate-950/90 to-transparent pointer-events-none z-10" />

      {/* Embedded Scan animation keyframes style tag */}
      <style jsx global>{`
        @keyframes scan {
          0% { transform: translateY(0); }
          50% { transform: translateY(320px); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
