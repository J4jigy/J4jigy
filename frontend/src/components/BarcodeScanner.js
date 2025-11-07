import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { BarcodeFormat } from '@zxing/library';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Camera, X, Keyboard, Scan } from 'lucide-react';

const BarcodeScanner = ({ isOpen, onClose, onScan, title = "Scan Barcode" }) => {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [error, setError] = useState('');
  const [lastScanned, setLastScanned] = useState('');
  const scanningRef = useRef(false);

  useEffect(() => {
    if (isOpen && !showManualInput) {
      startScanning();
    }

    return () => {
      stopScanning();
    };
  }, [isOpen, showManualInput]);

  const startScanning = async () => {
    if (!videoRef.current || scanningRef.current) return;

    try {
      setIsScanning(true);
      setError('');
      scanningRef.current = true;

      // Initialize ZXing reader with optimized settings
      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;

      // Configure for fastest scanning - only essential formats
      const hints = new Map();
      const formats = [
        BarcodeFormat.CODE_128,
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
      ];
      hints.set(2, formats); // DecodeHintType.POSSIBLE_FORMATS = 2

      // Get camera with optimal settings for speed
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 60, max: 60 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      console.log('✅ ZXing Camera ready - 60 FPS scanning started!');

      // Ultra-fast continuous scanning loop
      const scan = async () => {
        if (!scanningRef.current || !videoRef.current) return;

        try {
          const result = await reader.decodeFromVideoElement(videoRef.current);
          if (result && result.getText()) {
            const barcode = result.getText();
            if (barcode !== lastScanned) {
              console.log('⚡ INSTANT SCAN:', barcode);
              setLastScanned(barcode);
              handleScanSuccess(barcode);
            }
          }
        } catch (e) {
          // Continue scanning on error (no barcode found)
        }

        // Request next frame immediately for 60 FPS
        if (scanningRef.current) {
          requestAnimationFrame(scan);
        }
      };

      // Start scanning loop
      scan();

    } catch (err) {
      console.error('❌ Camera error:', err);
      setError(`Camera error: ${err.message}. Please allow camera permissions.`);
      setIsScanning(false);
      scanningRef.current = false;
    }
  };

  const stopScanning = () => {
    scanningRef.current = false;
    
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }

    if (readerRef.current) {
      try {
        readerRef.current.reset();
      } catch (e) {
        // Ignore
      }
    }

    setIsScanning(false);
    setLastScanned('');
  };

  const handleScanSuccess = (barcode) => {
    // Don't stop scanning - allow continuous scanning
    onScan(barcode);
    
    // Ultra-fast reset (11ms) for 60 FPS back-to-back scanning
    setTimeout(() => {
      setLastScanned('');
      console.log('✅ Ready for next scan');
    }, 11);
  };

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      onScan(manualInput.trim());
      setManualInput('');
    }
  };

  const handleClose = () => {
    stopScanning();
    setManualInput('');
    setShowManualInput(false);
    setError('');
    setLastScanned('');
    onClose();
  };

  const toggleInputMethod = () => {
    if (showManualInput) {
      setShowManualInput(false);
      setError('');
      startScanning();
    } else {
      stopScanning();
      setShowManualInput(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/95 flex flex-col items-center justify-center z-50 p-0">
      <div className="bg-slate-900 w-full h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-slate-700 bg-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Scan className="w-6 h-6 text-blue-400" />
            <h2 className="text-white text-lg font-bold">{title}</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700 rounded"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-4 space-y-4 overflow-auto">
          {!showManualInput ? (
            <>
              {/* Camera Scanner - Centered */}
              <div className="flex-1 flex items-center justify-center">
                <div className="relative bg-black rounded-lg overflow-hidden border-2 border-blue-500 w-full max-w-full mx-4">
                  <div 
                    ref={scannerRef}
                    id="barcode-scanner-container"
                    className="w-full aspect-video flex items-center justify-center relative"
                  >
                    {!isScanning && !error && (
                      <div className="absolute inset-0 flex items-center justify-center text-white text-center p-8 z-10">
                        <div>
                          <Camera className="w-16 h-16 mx-auto mb-4 animate-pulse text-blue-400" />
                          <p className="text-lg">Initializing camera...</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Scanning Indicator */}
                  {isScanning && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg z-20">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      SCANNING
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="bg-red-500/20 border-2 border-red-500 rounded-lg p-4 flex-shrink-0">
                  <p className="text-red-300 text-sm font-semibold text-center">{error}</p>
                </div>
              )}

              {/* Instructions */}
              {isScanning && !error && (
                <div className="bg-blue-500/20 border-2 border-blue-500 rounded-lg p-4 flex-shrink-0">
                  <p className="text-blue-300 text-base text-center font-semibold">
                    📷 Hold barcode steady in front of camera
                  </p>
                  <p className="text-blue-400 text-sm text-center mt-2">
                    Scanner will automatically detect and read the barcode
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col justify-center space-y-4 max-w-md mx-auto w-full">
              {/* Manual Input */}
              <div className="space-y-3">
                <Label className="text-white text-base font-semibold">Enter Barcode Manually</Label>
                <Input
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
                  placeholder="Type barcode number..."
                  className="bg-slate-700 border-2 border-slate-600 text-white text-lg h-12"
                  autoFocus
                />
                <p className="text-sm text-slate-400">
                  💡 Press Enter or click Submit to search
                </p>
              </div>

              <Button
                onClick={handleManualSubmit}
                disabled={!manualInput.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 h-12 text-lg font-semibold"
              >
                Submit Barcode
              </Button>
            </div>
          )}

          {/* Toggle Input Method - Fixed at bottom */}
          <div className="flex gap-3 flex-shrink-0">
            <Button
              onClick={toggleInputMethod}
              className="flex-1 bg-slate-700 hover:bg-slate-600 h-12 text-base font-semibold"
            >
              {showManualInput ? (
                <>
                  <Camera className="w-5 h-5 mr-2" />
                  Use Camera
                </>
              ) : (
                <>
                  <Keyboard className="w-5 h-5 mr-2" />
                  Manual Input
                </>
              )}
            </Button>
            <Button
              onClick={handleClose}
              className="flex-1 bg-red-600 hover:bg-red-700 h-12 text-base font-semibold"
            >
              <X className="w-5 h-5 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;
