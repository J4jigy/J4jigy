import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Camera, X, Keyboard } from 'lucide-react';

const BarcodeScanner = ({ isOpen, onClose, onScan, title = "Scan Barcode" }) => {
  const scannerRef = useRef(null);
  const [html5QrCode, setHtml5QrCode] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && !showManualInput) {
      startScanning();
    }

    return () => {
      stopScanning();
    };
  }, [isOpen, showManualInput]);

  const startScanning = async () => {
    if (scannerRef.current && !isScanning) {
      try {
        const qrCodeScanner = new Html5Qrcode("barcode-reader");
        setHtml5QrCode(qrCodeScanner);

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.777778,
          formatsToSupport: [
            Html5Qrcode.SCAN_TYPE_BARCODE.CODE_128,
            Html5Qrcode.SCAN_TYPE_BARCODE.CODE_39,
            Html5Qrcode.SCAN_TYPE_BARCODE.EAN_13,
            Html5Qrcode.SCAN_TYPE_BARCODE.EAN_8,
            Html5Qrcode.SCAN_TYPE_BARCODE.UPC_A,
            Html5Qrcode.SCAN_TYPE_BARCODE.UPC_E,
          ]
        };

        await qrCodeScanner.start(
          { facingMode: "environment" },
          config,
          (decodedText, decodedResult) => {
            console.log("Barcode scanned:", decodedText);
            handleScanSuccess(decodedText);
          },
          (errorMessage) => {
            // Silent error - scanning in progress
          }
        );

        setIsScanning(true);
        setError('');
      } catch (err) {
        console.error("Camera error:", err);
        setError("Unable to access camera. Please use manual input or check camera permissions.");
        setShowManualInput(true);
      }
    }
  };

  const stopScanning = async () => {
    if (html5QrCode && isScanning) {
      try {
        await html5QrCode.stop();
        html5QrCode.clear();
        setIsScanning(false);
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
  };

  const handleScanSuccess = async (barcode) => {
    await stopScanning();
    onScan(barcode);
  };

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      onScan(manualInput.trim());
      setManualInput('');
    }
  };

  const handleClose = async () => {
    await stopScanning();
    setManualInput('');
    setShowManualInput(false);
    setError('');
    onClose();
  };

  const toggleInputMethod = async () => {
    if (showManualInput) {
      setShowManualInput(false);
      setError('');
      startScanning();
    } else {
      await stopScanning();
      setShowManualInput(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-md w-full border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-white text-lg font-semibold">{title}</h2>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {!showManualInput ? (
            <>
              {/* Camera Scanner */}
              <div ref={scannerRef} className="relative">
                <div id="barcode-reader" className="rounded-lg overflow-hidden"></div>
                {error && (
                  <div className="bg-red-500/20 border border-red-500 rounded p-3 mt-2">
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-slate-700/50 rounded p-3">
                <p className="text-slate-300 text-sm text-center">
                  📷 Position the barcode within the frame
                </p>
                <p className="text-slate-400 text-xs text-center mt-1">
                  Camera will automatically scan when barcode is detected
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Manual Input */}
              <div className="space-y-2">
                <Label className="text-white text-sm">Enter Barcode Manually</Label>
                <Input
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
                  placeholder="Type barcode number..."
                  className="bg-slate-700 border-slate-600 text-white"
                  autoFocus
                />
                <p className="text-xs text-slate-400">
                  💡 Press Enter or click Submit to search
                </p>
              </div>

              <Button
                onClick={handleManualSubmit}
                disabled={!manualInput.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                Submit Barcode
              </Button>
            </>
          )}

          {/* Toggle Input Method */}
          <div className="flex gap-2">
            <Button
              onClick={toggleInputMethod}
              className="flex-1 bg-slate-600 hover:bg-slate-500"
            >
              {showManualInput ? (
                <>
                  <Camera className="w-4 h-4 mr-2" />
                  Use Camera
                </>
              ) : (
                <>
                  <Keyboard className="w-4 h-4 mr-2" />
                  Manual Input
                </>
              )}
            </Button>
            <Button
              onClick={handleClose}
              className="flex-1 bg-red-600/20 hover:bg-red-600/40 border-2 border-red-500 text-red-400"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;
