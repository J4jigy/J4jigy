import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { ArrowLeft, Camera, Upload, FileText, Image, Trash2, Eye, Download, ScanLine, X } from 'lucide-react';

const ScanDocuments = () => {
  const navigate = useNavigate();
  const [scannedDocuments, setScannedDocuments] = useState([]);
  
  const [showCameraDialog, setShowCameraDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [showCapturePreview, setShowCapturePreview] = useState(false);
  const [stream, setStream] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Start camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions or use file upload.');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Capture photo
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      alert('Camera not ready. Please try again.');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Wait for video to be ready
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      alert('Camera is loading. Please wait a moment and try again.');
      return;
    }
    
    const context = canvas.getContext('2d');
    
    // Set canvas dimensions from video
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    // Draw the current video frame
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to data URL (more reliable than blob)
    try {
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.92);
      
      // Convert data URL to blob for file operations
      fetch(imageDataUrl)
        .then(res => res.blob())
        .then(blob => {
          setCapturedImage({ 
            blob, 
            url: imageDataUrl  // Use data URL instead of object URL
          });
          setShowCapturePreview(true);
          stopCamera();
          setShowCameraDialog(false);
        })
        .catch(error => {
          console.error('Error converting image:', error);
          alert('Failed to capture image. Please try again.');
        });
    } catch (error) {
      console.error('Error capturing photo:', error);
      alert('Failed to capture photo. Please try again.');
    }
  };

  // Process captured image
  const processCapturedImage = async () => {
    if (!capturedImage) return;
    
    setIsScanning(true);
    
    // Simulate OCR processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const newDocument = {
      id: Date.now(),
      name: `Scanned_${new Date().toISOString().split('T')[0]}.jpg`,
      type: 'Scanned Document',
      date: new Date().toISOString().split('T')[0],
      size: `${Math.round(capturedImage.blob.size / 1024)} KB`,
      thumbnail: '📸',
      extractedText: 'Document scanned successfully!\nProcessing text extraction...\nAmount: $123.45\nDate: ' + new Date().toLocaleDateString(),
      confidence: '92%',
      imageUrl: capturedImage.url
    };
    
    setScannedDocuments(prev => [newDocument, ...prev]);
    setIsScanning(false);
    setShowCapturePreview(false);
    setCapturedImage(null);
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (allowedTypes.includes(file.type)) {
        processUploadedFile(file);
      } else {
        alert('Please select a valid file type: PDF, JPG, PNG, or WebP');
      }
    }
  };

  // Process uploaded file
  const processUploadedFile = async (file) => {
    setIsScanning(true);
    
    try {
      // Create object URL safely
      let imageUrl = null;
      try {
        imageUrl = URL.createObjectURL(file);
      } catch (error) {
        console.error('Error creating URL:', error);
      }
      
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newDocument = {
        id: Date.now(),
        name: file.name,
        type: file.type.includes('pdf') ? 'PDF Document' : 'Image Document',
        date: new Date().toISOString().split('T')[0],
        size: `${Math.round(file.size / 1024)} KB`,
        thumbnail: file.type.includes('pdf') ? '📄' : '🖼️',
        extractedText: file.type.includes('pdf') 
          ? 'PDF Document processed\nInvoice #INV-2024-002\nAmount: $890.00\nVendor: Office Supplies Inc'
          : 'Image processed\nReceipt scanned\nTotal: $67.89\nStore: Local Market',
        confidence: '91%',
        imageUrl: imageUrl
      };
      
      setScannedDocuments(prev => [newDocument, ...prev]);
      setIsScanning(false);
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Failed to process file. Please try again.');
      setIsScanning(false);
    }
  };

  // Delete document
  const deleteDocument = (id) => {
    setScannedDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  // View document details
  const viewDocument = (document) => {
    setSelectedDocument(document);
    setShowPreviewDialog(true);
  };

  // Download document
  const downloadDocument = (document) => {
    if (document.imageUrl) {
      const link = document.createElement('a');
      link.href = document.imageUrl;
      link.download = document.name;
      link.click();
    } else {
      alert('Download functionality would be implemented here');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (capturedImage) {
        URL.revokeObjectURL(capturedImage.url);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <ScanLine className="w-6 h-6 text-cyan-400" />
            <h1 className="text-xl font-bold">Scan Documents</h1>
          </div>
        </div>
        
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          size="sm"
          className="border-slate-600 text-slate-200 hover:bg-slate-700"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload
        </Button>
      </div>

      {/* Scanning Status */}
      {isScanning && (
        <div className="p-4 bg-blue-900/20 border-b border-blue-700/50">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
            <span className="text-blue-400">Processing document... Please wait</span>
          </div>
        </div>
      )}

      {/* Documents Grid */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scannedDocuments.map((document) => (
            <Card key={document.id} className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{document.thumbnail}</span>
                    <div>
                      <CardTitle className="text-sm text-white truncate">{document.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {document.type}
                        </Badge>
                        <span className="text-xs text-slate-400">{document.size}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => deleteDocument(document.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20 h-6 w-6 p-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Date:</span>
                    <span className="text-slate-200">{document.date}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Confidence:</span>
                    <span className="text-green-400">{document.confidence}</span>
                  </div>
                  <div className="text-xs text-slate-300 bg-slate-700 p-2 rounded truncate">
                    {document.extractedText.split('\n')[0]}...
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      onClick={() => viewDocument(document)}
                      size="sm"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    <Button
                      onClick={() => downloadDocument(document)}
                      size="sm"
                      variant="outline"
                      className="border-slate-600 text-slate-200 hover:bg-slate-700 text-xs"
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {scannedDocuments.length === 0 && !isScanning && (
          <div className="text-center py-12">
            <ScanLine className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-400 mb-2">No documents scanned yet</h3>
            <p className="text-slate-500 mb-4">Use the camera button to scan your first document</p>
          </div>
        )}
      </div>

      {/* Floating Camera Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setShowCameraDialog(true)}
          className="w-16 h-16 rounded-full bg-cyan-500 hover:bg-cyan-600 shadow-lg flex items-center justify-center"
        >
          <Camera className="w-8 h-8 text-white" />
        </Button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Camera Dialog */}
      <Dialog open={showCameraDialog} onOpenChange={(open) => {
        setShowCameraDialog(open);
        if (!open) {
          stopCamera();
        } else {
          startCamera();
        }
      }}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Scan Document
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 border-2 border-cyan-400 border-dashed rounded-lg pointer-events-none">
                <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-cyan-400"></div>
                <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-cyan-400"></div>
                <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-cyan-400"></div>
                <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-cyan-400"></div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={capturePhoto}
                className="flex-1 bg-cyan-600 hover:bg-cyan-700"
              >
                <Camera className="w-4 h-4 mr-2" />
                Capture
              </Button>
              <Button
                onClick={() => setShowCameraDialog(false)}
                variant="outline"
                className="border-slate-600 text-slate-200"
              >
                Cancel
              </Button>
            </div>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </DialogContent>
      </Dialog>

      {/* Capture Preview Dialog */}
      <Dialog open={showCapturePreview} onOpenChange={setShowCapturePreview}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Preview Captured Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {capturedImage && (
              <div className="relative">
                <img
                  src={capturedImage.url}
                  alt="Captured document"
                  className="w-full rounded-lg"
                />
              </div>
            )}
            <div className="flex gap-2">
              <Button
                onClick={processCapturedImage}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={isScanning}
              >
                {isScanning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <ScanLine className="w-4 h-4 mr-2" />
                    Process Document
                  </>
                )}
              </Button>
              <Button
                onClick={() => {
                  setShowCapturePreview(false);
                  setCapturedImage(null);
                  setShowCameraDialog(true);
                  startCamera();
                }}
                variant="outline"
                className="border-slate-600 text-slate-200"
                disabled={isScanning}
              >
                Retake
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {selectedDocument?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Type:</span>
                  <span className="text-white ml-2">{selectedDocument.type}</span>
                </div>
                <div>
                  <span className="text-slate-400">Size:</span>
                  <span className="text-white ml-2">{selectedDocument.size}</span>
                </div>
                <div>
                  <span className="text-slate-400">Date:</span>
                  <span className="text-white ml-2">{selectedDocument.date}</span>
                </div>
                <div>
                  <span className="text-slate-400">Confidence:</span>
                  <span className="text-green-400 ml-2">{selectedDocument.confidence}</span>
                </div>
              </div>
              
              {selectedDocument.imageUrl && (
                <div>
                  <h4 className="text-white font-medium mb-2">Document Image:</h4>
                  <img
                    src={selectedDocument.imageUrl}
                    alt="Document"
                    className="w-full rounded-lg border border-slate-600"
                  />
                </div>
              )}
              
              <div>
                <h4 className="text-white font-medium mb-2">Extracted Text:</h4>
                <div className="bg-slate-700 p-4 rounded-lg text-sm text-slate-200 whitespace-pre-line">
                  {selectedDocument.extractedText}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => downloadDocument(selectedDocument)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={() => setShowPreviewDialog(false)}
                  variant="outline"
                  className="border-slate-600 text-slate-200"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScanDocuments;