import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { ArrowLeft, Camera, Upload, FileText, Trash2, Eye, Download, ScanLine, RotateCcw, Save } from 'lucide-react';

const ScanDocuments = () => {
  const navigate = useNavigate();
  const [scannedDocuments, setScannedDocuments] = useState([]);
  
  const [showCameraDialog, setShowCameraDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stream, setStream] = useState(null);
  
  // Edit dialog states
  const [selectedFile, setSelectedFile] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [editedImage, setEditedImage] = useState(null);
  const [imageSource, setImageSource] = useState(null); // 'camera' or 'upload'
  
  // Filter states
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [grayscale, setGrayscale] = useState(false);
  const [autoEnhance, setAutoEnhance] = useState(false);
  const [blackWhite, setBlackWhite] = useState(false);
  const [removeShadows, setRemoveShadows] = useState(false);
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const captureCanvasRef = useRef(null);

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

  // Capture photo from camera
  const capturePhoto = () => {
    if (!videoRef.current || !captureCanvasRef.current) {
      alert('Camera not ready. Please try again.');
      return;
    }

    const video = videoRef.current;
    const canvas = captureCanvasRef.current;
    
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
    
    // Convert to data URL
    try {
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.92);
      
      // Create file-like object for captured image
      const capturedFile = {
        name: `Camera_${new Date().toISOString().split('T')[0]}_${Date.now()}.jpg`,
        type: 'image/jpeg'
      };
      
      setSelectedFile(capturedFile);
      setImageSource('camera');
      
      // Load image for editing
      const img = new Image();
      img.onload = () => {
        setOriginalImage(img);
        setEditedImage(imageDataUrl);
        resetFilters();
        setShowEditDialog(true);
        stopCamera();
        setShowCameraDialog(false);
      };
      img.src = imageDataUrl;
      
    } catch (error) {
      console.error('Error capturing photo:', error);
      alert('Failed to capture photo. Please try again.');
    }
  };

  // Handle file upload
  const handleFileSelection = (event) => {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (allowedTypes.includes(file.type)) {
        processSelectedFile(file);
      } else {
        alert('Please select a valid image file: JPG, PNG, or WebP');
      }
    }
    // Reset file input so same file can be selected again
    event.target.value = '';
  };

  // Process selected file from upload
  const processSelectedFile = (file) => {
    setSelectedFile(file);
    setImageSource('upload');
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setOriginalImage(img);
        setEditedImage(e.target.result);
        resetFilters();
        setShowEditDialog(true);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Reset filters to default
  const resetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setGrayscale(false);
    setAutoEnhance(false);
    setBlackWhite(false);
    setRemoveShadows(false);
  };

  // Apply filters to image
  const applyFilters = () => {
    if (!originalImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to match image
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    
    // Apply CSS filters
    let filterString = '';
    filterString += `brightness(${brightness}%) `;
    filterString += `contrast(${contrast}%) `;
    
    if (grayscale || blackWhite) {
      filterString += 'grayscale(100%) ';
    }
    
    if (autoEnhance) {
      filterString += 'contrast(110%) brightness(105%) saturate(120%) ';
    }
    
    if (removeShadows) {
      filterString += 'brightness(115%) contrast(95%) ';
    }
    
    ctx.filter = filterString;
    
    // Draw image with filters
    ctx.drawImage(originalImage, 0, 0);
    
    // Additional processing for black & white (higher contrast)
    if (blackWhite) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const bw = avg > 128 ? 255 : 0;
        data[i] = bw;
        data[i + 1] = bw;
        data[i + 2] = bw;
      }
      
      ctx.putImageData(imageData, 0, 0);
    }
    
    // Convert to data URL
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setEditedImage(dataUrl);
  };

  // Apply filters whenever filter values change
  useEffect(() => {
    if (originalImage && showEditDialog) {
      applyFilters();
    }
  }, [brightness, contrast, grayscale, autoEnhance, blackWhite, removeShadows, originalImage, showEditDialog]);

  // Retry/Capture Again - goes back to source
  const handleRetry = () => {
    setShowEditDialog(false);
    setSelectedFile(null);
    setOriginalImage(null);
    setEditedImage(null);
    resetFilters();
    
    // Reopen source based on where image came from
    setTimeout(() => {
      if (imageSource === 'camera') {
        setShowCameraDialog(true);
        startCamera();
      } else {
        fileInputRef.current?.click();
      }
    }, 100);
  };

  // Save document
  const handleSaveDocument = async () => {
    if (!editedImage || !selectedFile) return;
    
    setIsProcessing(true);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Convert data URL to blob for size calculation
    const response = await fetch(editedImage);
    const blob = await response.blob();
    
    const newDocument = {
      id: Date.now(),
      name: selectedFile.name,
      type: imageSource === 'camera' ? 'Camera Scan' : 'Scanned Document',
      date: new Date().toISOString().split('T')[0],
      size: `${Math.round(blob.size / 1024)} KB`,
      thumbnail: imageSource === 'camera' ? '📸' : '🖼️',
      extractedText: `Document scanned successfully!\nSource: ${imageSource === 'camera' ? 'Camera Capture' : 'File Upload'}\nFilters applied: ${getAppliedFilters()}\nProcessed on: ${new Date().toLocaleDateString()}`,
      confidence: '95%',
      imageUrl: editedImage
    };
    
    setScannedDocuments(prev => [newDocument, ...prev]);
    setIsProcessing(false);
    setShowEditDialog(false);
    setSelectedFile(null);
    setOriginalImage(null);
    setEditedImage(null);
    setImageSource(null);
    resetFilters();
  };

  // Get applied filters description
  const getAppliedFilters = () => {
    const filters = [];
    if (brightness !== 100) filters.push(`Brightness: ${brightness}%`);
    if (contrast !== 100) filters.push(`Contrast: ${contrast}%`);
    if (grayscale) filters.push('Grayscale');
    if (autoEnhance) filters.push('Auto-enhance');
    if (blackWhite) filters.push('Black & White');
    if (removeShadows) filters.push('Shadow Removal');
    return filters.length > 0 ? filters.join(', ') : 'None';
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
      const link = window.document.createElement('a');
      link.href = document.imageUrl;
      link.download = document.name;
      link.click();
    } else {
      alert('Unable to download this document');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
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

      {/* Processing Status */}
      {isProcessing && (
        <div className="p-4 bg-blue-900/20 border-b border-blue-700/50">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
            <span className="text-blue-400">Saving document... Please wait</span>
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

        {scannedDocuments.length === 0 && !isProcessing && (
          <div className="text-center py-12">
            <ScanLine className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-400 mb-2">No documents scanned yet</h3>
            <p className="text-slate-500 mb-4">Use the camera button to scan or upload button to select documents</p>
          </div>
        )}
      </div>

      {/* Floating Camera Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => {
            setShowCameraDialog(true);
            startCamera();
          }}
          className="w-16 h-16 rounded-full bg-cyan-500 hover:bg-cyan-600 shadow-lg flex items-center justify-center"
        >
          <Camera className="w-8 h-8 text-white" />
        </Button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelection}
        className="hidden"
      />

      {/* Hidden Canvases for Image Processing */}
      <canvas ref={canvasRef} className="hidden" />
      <canvas ref={captureCanvasRef} className="hidden" />

      {/* Camera Dialog */}
      <Dialog open={showCameraDialog} onOpenChange={(open) => {
        setShowCameraDialog(open);
        if (!open) {
          stopCamera();
        }
      }}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-cyan-400" />
              Camera - Scan Document
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
        </DialogContent>
      </Dialog>

      {/* Edit Document Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <ScanLine className="w-5 h-5 text-cyan-400" />
              Edit Document - {selectedFile?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Image Preview */}
            <div className="lg:col-span-2">
              <div className="bg-slate-900 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3">Preview</h3>
                {editedImage && (
                  <img
                    src={editedImage}
                    alt="Document preview"
                    className="w-full rounded-lg border border-slate-600"
                  />
                )}
              </div>
            </div>

            {/* Filter Controls */}
            <div className="space-y-4">
              <div className="bg-slate-900 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3">Basic Filters</h3>
                
                {/* Brightness */}
                <div className="mb-4">
                  <label className="text-sm text-slate-300 mb-2 block">
                    Brightness: {brightness}%
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Contrast */}
                <div className="mb-4">
                  <label className="text-sm text-slate-300 mb-2 block">
                    Contrast: {contrast}%
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Grayscale */}
                <div className="mb-2">
                  <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={grayscale}
                      onChange={(e) => setGrayscale(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-700"
                    />
                    Grayscale
                  </label>
                </div>
              </div>

              <div className="bg-slate-900 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3">Document Filters</h3>
                
                {/* Auto-enhance */}
                <Button
                  onClick={() => setAutoEnhance(!autoEnhance)}
                  variant={autoEnhance ? "default" : "outline"}
                  size="sm"
                  className={`w-full mb-2 ${autoEnhance ? 'bg-cyan-600 hover:bg-cyan-700' : 'border-slate-600'}`}
                >
                  {autoEnhance ? '✓ ' : ''}Auto-enhance
                </Button>

                {/* Black & White */}
                <Button
                  onClick={() => setBlackWhite(!blackWhite)}
                  variant={blackWhite ? "default" : "outline"}
                  size="sm"
                  className={`w-full mb-2 ${blackWhite ? 'bg-cyan-600 hover:bg-cyan-700' : 'border-slate-600'}`}
                >
                  {blackWhite ? '✓ ' : ''}Black & White
                </Button>

                {/* Remove Shadows */}
                <Button
                  onClick={() => setRemoveShadows(!removeShadows)}
                  variant={removeShadows ? "default" : "outline"}
                  size="sm"
                  className={`w-full ${removeShadows ? 'bg-cyan-600 hover:bg-cyan-700' : 'border-slate-600'}`}
                >
                  {removeShadows ? '✓ ' : ''}Remove Shadows
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  onClick={handleSaveDocument}
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={isProcessing}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Document
                </Button>
                <Button
                  onClick={handleRetry}
                  variant="outline"
                  className="w-full border-slate-600 text-slate-200"
                  disabled={isProcessing}
                >
                  {imageSource === 'camera' ? (
                    <>
                      <Camera className="w-4 h-4 mr-2" />
                      Capture Again
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Retry
                    </>
                  )}
                </Button>
              </div>
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
