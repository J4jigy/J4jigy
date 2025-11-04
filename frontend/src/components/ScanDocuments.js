import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { ArrowLeft, Camera, Upload, FileText, Trash2, Eye, Download, ScanLine, Save, Plus, X, Edit, RotateCcw, Edit3, Check } from 'lucide-react';
import jsPDF from 'jspdf';

const ScanDocuments = () => {
  const navigate = useNavigate();
  const [scannedDocuments, setScannedDocuments] = useState([]);
  const [recentlyDeleted, setRecentlyDeleted] = useState([]);
  
  const [showCameraView, setShowCameraView] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showPdfEditorDialog, setShowPdfEditorDialog] = useState(false);
  const [showDeletedDialog, setShowDeletedDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stream, setStream] = useState(null);
  
  // Multi-page PDF states
  const [collectedPages, setCollectedPages] = useState([]);
  const [pdfName, setPdfName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingPdfId, setEditingPdfId] = useState(null);
  
  // Edit dialog states
  const [selectedFile, setSelectedFile] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [editedImage, setEditedImage] = useState(null);
  const [imageSource, setImageSource] = useState(null);
  
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

  // Auto-delete items older than 30 days from recently deleted
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const oneMonthMs = 30 * 24 * 60 * 60 * 1000;
      setRecentlyDeleted(prev => prev.filter(doc => (now - doc.deletedAt) < oneMonthMs));
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Generate auto PDF name
  const generatePdfName = () => {
    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
    return `Scan_${date}_${time}`;
  };

  // Initialize PDF name when first page is added
  useEffect(() => {
    if (collectedPages.length === 1 && !pdfName) {
      setPdfName(generatePdfName());
    }
  }, [collectedPages.length]);

  // Start camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
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
      setShowCameraView(false);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Open camera full screen
  const openCamera = () => {
    setShowCameraView(true);
    setTimeout(() => startCamera(), 100);
  };

  // Close camera view
  const closeCameraView = () => {
    stopCamera();
    setShowCameraView(false);
  };

  // Capture photo from camera
  const capturePhoto = () => {
    console.log('Capture photo button clicked');
    
    if (!videoRef.current || !captureCanvasRef.current) {
      console.error('Video ref or canvas ref not available');
      alert('Camera not ready. Please try again.');
      return;
    }

    const video = videoRef.current;
    const canvas = captureCanvasRef.current;
    
    console.log('Video readyState:', video.readyState, 'Expected:', video.HAVE_ENOUGH_DATA);
    
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      alert('Camera is loading. Please wait a moment and try again.');
      return;
    }
    
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    try {
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.92);
      console.log('Image captured successfully, data URL length:', imageDataUrl.length);
      
      const capturedFile = {
        name: `Camera_${new Date().toISOString().split('T')[0]}_${Date.now()}.jpg`,
        type: 'image/jpeg'
      };
      
      setSelectedFile(capturedFile);
      setImageSource('camera');
      
      const img = new Image();
      img.onload = () => {
        console.log('Image loaded for editing');
        setOriginalImage(img);
        setEditedImage(imageDataUrl);
        resetFilters();
        setShowEditDialog(true);
        closeCameraView();
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
    
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    
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
    ctx.drawImage(originalImage, 0, 0);
    
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
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setEditedImage(dataUrl);
  };

  // Apply filters whenever filter values change
  useEffect(() => {
    if (originalImage && showEditDialog) {
      applyFilters();
    }
  }, [brightness, contrast, grayscale, autoEnhance, blackWhite, removeShadows, originalImage, showEditDialog]);

  // Retry - reopen source
  const handleRetry = () => {
    setShowEditDialog(false);
    setSelectedFile(null);
    setOriginalImage(null);
    setEditedImage(null);
    resetFilters();
    
    setTimeout(() => {
      if (imageSource === 'camera') {
        openCamera();
      } else {
        fileInputRef.current?.click();
      }
    }, 100);
  };

  // Add page to collection (automatically after editing)
  const handleAddPageToCollection = () => {
    if (!editedImage) return;
    
    setCollectedPages(prev => [...prev, {
      id: Date.now(),
      image: editedImage,
      thumbnail: editedImage
    }]);
    
    setShowEditDialog(false);
    setSelectedFile(null);
    setOriginalImage(null);
    setEditedImage(null);
    resetFilters();
  };

  // Add another page (reopens source)
  const handleAddAnotherPage = () => {
    handleAddPageToCollection();
    
    setTimeout(() => {
      if (imageSource === 'camera') {
        openCamera();
      } else {
        fileInputRef.current?.click();
      }
    }, 100);
  };

  // Save as PDF
  const handleSavePdf = async () => {
    if (collectedPages.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      for (let i = 0; i < collectedPages.length; i++) {
        if (i > 0) {
          pdf.addPage();
        }
        
        const page = collectedPages[i];
        
        const img = new Image();
        img.src = page.image;
        await new Promise(resolve => {
          img.onload = resolve;
        });
        
        const imgRatio = img.width / img.height;
        const pageRatio = pageWidth / pageHeight;
        
        let finalWidth, finalHeight, x, y;
        
        if (imgRatio > pageRatio) {
          finalWidth = pageWidth;
          finalHeight = pageWidth / imgRatio;
          x = 0;
          y = (pageHeight - finalHeight) / 2;
        } else {
          finalHeight = pageHeight;
          finalWidth = pageHeight * imgRatio;
          x = (pageWidth - finalWidth) / 2;
          y = 0;
        }
        
        pdf.addImage(page.image, 'JPEG', x, y, finalWidth, finalHeight);
      }
      
      const pdfBlob = pdf.output('blob');
      const pdfDataUrl = pdf.output('dataurlstring');
      
      // If editing existing PDF, replace it
      if (editingPdfId) {
        setScannedDocuments(prev => prev.map(doc => {
          if (doc.id === editingPdfId) {
            return {
              ...doc,
              pages: collectedPages.length,
              size: `${Math.round(pdfBlob.size / 1024)} KB`,
              extractedText: `PDF Document\nPages: ${collectedPages.length}\nUpdated: ${new Date().toLocaleDateString()}`,
              imageUrl: pdfDataUrl,
              pdfBlob: pdfBlob,
              pdfPages: collectedPages
            };
          }
          return doc;
        }));
        setEditingPdfId(null);
      } else {
        // Create new PDF
        const finalPdfName = pdfName.trim() || generatePdfName();
        const newDocument = {
          id: Date.now(),
          name: `${finalPdfName}.pdf`,
          type: 'PDF Document',
          date: new Date().toISOString().split('T')[0],
          size: `${Math.round(pdfBlob.size / 1024)} KB`,
          thumbnail: '📄',
          pages: collectedPages.length,
          extractedText: `PDF Document\nPages: ${collectedPages.length}\nCreated: ${new Date().toLocaleDateString()}`,
          confidence: '95%',
          imageUrl: pdfDataUrl,
          pdfBlob: pdfBlob,
          pdfPages: collectedPages
        };
        
        setScannedDocuments(prev => [newDocument, ...prev]);
      }
      
      setCollectedPages([]);
      setPdfName('');
      setSelectedFile(null);
      setOriginalImage(null);
      setEditedImage(null);
      setImageSource(null);
      resetFilters();
      setIsProcessing(false);
      setShowPdfEditorDialog(false);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
      setIsProcessing(false);
    }
  };

  // Open PDF Editor
  const openPdfEditor = (document) => {
    setEditingPdfId(document.id);
    setCollectedPages(document.pdfPages || []);
    setPdfName(document.name.replace('.pdf', ''));
    setShowPreviewDialog(false);
    setShowPdfEditorDialog(true);
  };

  // Delete page from collection
  const handleDeletePage = (pageId) => {
    setCollectedPages(prev => prev.filter(p => p.id !== pageId));
  };

  // Add page to existing PDF
  const handleAddPageToPdf = () => {
    setShowPdfEditorDialog(false);
    
    const choice = window.confirm('Use Camera to add page? (Cancel for Upload)');
    
    if (choice) {
      setImageSource('camera');
      openCamera();
    } else {
      setImageSource('upload');
      fileInputRef.current?.click();
    }
  };

  // Cancel current session
  const handleCancelSession = () => {
    setShowEditDialog(false);
    setCollectedPages([]);
    setPdfName('');
    setSelectedFile(null);
    setOriginalImage(null);
    setEditedImage(null);
    setImageSource(null);
    setEditingPdfId(null);
    resetFilters();
  };

  // Delete document (move to recently deleted)
  const deleteDocument = (id) => {
    const doc = scannedDocuments.find(d => d.id === id);
    if (doc) {
      setRecentlyDeleted(prev => [...prev, { ...doc, deletedAt: Date.now() }]);
      setScannedDocuments(prev => prev.filter(d => d.id !== id));
    }
  };

  // Restore from recently deleted
  const restoreDocument = (id) => {
    const doc = recentlyDeleted.find(d => d.id === id);
    if (doc) {
      const { deletedAt, ...restoredDoc } = doc;
      setScannedDocuments(prev => [restoredDoc, ...prev]);
      setRecentlyDeleted(prev => prev.filter(d => d.id !== id));
    }
  };

  // Permanently delete
  const permanentlyDelete = (id) => {
    setRecentlyDeleted(prev => prev.filter(d => d.id !== id));
  };

  // View document details
  const viewDocument = (document) => {
    setSelectedDocument(document);
    setShowPreviewDialog(true);
  };

  // Download PDF document
  const downloadDocument = (document) => {
    if (document.pdfBlob) {
      const link = window.document.createElement('a');
      link.href = URL.createObjectURL(document.pdfBlob);
      link.download = document.name;
      link.click();
    } else if (document.imageUrl) {
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
    <div className="min-h-screen bg-slate-900 text-white pb-48">
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
        
        {recentlyDeleted.length > 0 && (
          <Button
            onClick={() => setShowDeletedDialog(true)}
            variant="outline"
            size="sm"
            className="border-slate-600 text-slate-200 hover:bg-slate-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Recently Deleted ({recentlyDeleted.length})
          </Button>
        )}
      </div>

      {/* Processing Status */}
      {isProcessing && (
        <div className="p-4 bg-blue-900/20 border-b border-blue-700/50">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
            <span className="text-blue-400">Creating PDF... Please wait</span>
          </div>
        </div>
      )}

      {/* Full Screen Camera View */}
      {showCameraView && (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col">
          <div className="flex items-center justify-between p-4 bg-black/70 backdrop-blur-sm z-10">
            <h2 className="text-white text-lg font-medium">Camera</h2>
            <Button
              onClick={closeCameraView}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 h-10 w-10 p-0 rounded-full"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          <div className="flex-1 relative overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 border-2 border-cyan-400 border-dashed pointer-events-none m-8">
              <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-cyan-400"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-cyan-400"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-cyan-400"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-cyan-400"></div>
            </div>
            
            {/* Instruction Text */}
            <div className="absolute bottom-32 left-0 right-0 text-center z-10">
              <p className="text-white text-sm bg-black/50 backdrop-blur-sm py-2 px-4 rounded-full inline-block">
                Position document within frame
              </p>
            </div>
          </div>

          <div className="p-8 bg-gradient-to-t from-black via-black/90 to-transparent flex justify-center items-center z-10">
            <button
              onClick={capturePhoto}
              className="w-24 h-24 rounded-full bg-white hover:bg-gray-100 active:bg-gray-200 flex items-center justify-center shadow-2xl border-8 border-slate-900 transition-all touch-manipulation cursor-pointer"
              style={{ touchAction: 'manipulation' }}
            >
              <div className="w-16 h-16 rounded-full bg-slate-900"></div>
            </button>
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
                  {document.pages && (
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Pages:</span>
                      <span className="text-slate-200">{document.pages}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Date:</span>
                    <span className="text-slate-200">{document.date}</span>
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
            <p className="text-slate-500 mb-4">Use the camera or upload buttons below to start scanning</p>
          </div>
        )}
      </div>

      {/* Floating Action Buttons - Hide when camera is open */}
      {!showCameraView && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="w-16 h-16 rounded-full bg-blue-500 hover:bg-blue-600 shadow-lg flex items-center justify-center"
          >
            <Upload className="w-8 h-8 text-white" />
          </Button>
          
          <Button
            onClick={openCamera}
            className="w-16 h-16 rounded-full bg-cyan-500 hover:bg-cyan-600 shadow-lg flex items-center justify-center"
          >
            <Camera className="w-8 h-8 text-white" />
          </Button>
        </div>
      )}

      {/* Bottom Page Strip - Always visible when pages collected */}
      {collectedPages.length > 0 && !showPdfEditorDialog && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 p-4 z-40">
          {/* PDF Name Editor */}
          <div className="mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400 flex-shrink-0" />
            {isEditingName ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  type="text"
                  value={pdfName}
                  onChange={(e) => setPdfName(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white text-sm h-8 flex-1"
                  placeholder="Enter PDF name"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setIsEditingName(false);
                    }
                  }}
                />
                <Button
                  onClick={() => setIsEditingName(false)}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 h-8 w-8 p-0"
                >
                  <Check className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-1">
                <span className="text-white font-medium">{pdfName || 'Untitled'}.pdf</span>
                <Button
                  onClick={() => setIsEditingName(true)}
                  variant="ghost"
                  size="sm"
                  className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-900/20 h-6 w-6 p-0"
                >
                  <Edit3 className="w-3 h-3" />
                </Button>
                <span className="text-slate-400 text-sm ml-auto">{collectedPages.length} page(s)</span>
              </div>
            )}
          </div>

          {/* Page Thumbnails */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
            {collectedPages.map((page, index) => (
              <div key={page.id} className="relative flex-shrink-0">
                <img
                  src={page.thumbnail}
                  alt={`Page ${index + 1}`}
                  className="w-20 h-28 object-cover rounded border-2 border-slate-600"
                />
                <div className="absolute top-1 left-1 bg-slate-900 text-white text-xs px-1.5 py-0.5 rounded">
                  {index + 1}
                </div>
                <Button
                  onClick={() => handleDeletePage(page.id)}
                  variant="ghost"
                  size="sm"
                  className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white h-6 w-6 p-0 rounded"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>

          {/* Action Button */}
          <Button
            onClick={handleSavePdf}
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={isProcessing || !pdfName.trim()}
          >
            <Save className="w-4 h-4 mr-2" />
            Save as PDF
          </Button>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelection}
        className="hidden"
      />

      {/* Hidden Canvases */}
      <canvas ref={canvasRef} className="hidden" />
      <canvas ref={captureCanvasRef} className="hidden" />

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

            <div className="space-y-4">
              <div className="bg-slate-900 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3">Basic Filters</h3>
                
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
                
                <Button
                  onClick={() => setAutoEnhance(!autoEnhance)}
                  variant={autoEnhance ? "default" : "outline"}
                  size="sm"
                  className={`w-full mb-2 ${autoEnhance ? 'bg-cyan-600 hover:bg-cyan-700' : 'border-slate-600'}`}
                >
                  {autoEnhance ? '✓ ' : ''}Auto-enhance
                </Button>

                <Button
                  onClick={() => setBlackWhite(!blackWhite)}
                  variant={blackWhite ? "default" : "outline"}
                  size="sm"
                  className={`w-full mb-2 ${blackWhite ? 'bg-cyan-600 hover:bg-cyan-700' : 'border-slate-600'}`}
                >
                  {blackWhite ? '✓ ' : ''}Black & White
                </Button>

                <Button
                  onClick={() => setRemoveShadows(!removeShadows)}
                  variant={removeShadows ? "default" : "outline"}
                  size="sm"
                  className={`w-full ${removeShadows ? 'bg-cyan-600 hover:bg-cyan-700' : 'border-slate-600'}`}
                >
                  {removeShadows ? '✓ ' : ''}Remove Shadows
                </Button>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleRetry}
                  variant="outline"
                  className="w-full border-yellow-600 text-yellow-400 hover:bg-yellow-900/20"
                  disabled={isProcessing}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
                <Button
                  onClick={handleAddPageToCollection}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isProcessing}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Collection
                </Button>
                <Button
                  onClick={handleAddAnotherPage}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={isProcessing}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add & Capture More
                </Button>
                <Button
                  onClick={handleCancelSession}
                  variant="outline"
                  className="w-full border-slate-600 text-slate-200"
                  disabled={isProcessing}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* PDF Editor Dialog */}
      <Dialog open={showPdfEditorDialog} onOpenChange={setShowPdfEditorDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Edit className="w-5 h-5 text-cyan-400" />
              Edit PDF - {collectedPages.length} Pages
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {collectedPages.map((page, index) => (
                <div key={page.id} className="relative">
                  <img
                    src={page.thumbnail}
                    alt={`Page ${index + 1}`}
                    className="w-full h-40 object-cover rounded border-2 border-slate-600"
                  />
                  <div className="absolute top-2 left-2 bg-slate-900 text-white text-xs px-2 py-1 rounded">
                    Page {index + 1}
                  </div>
                  <Button
                    onClick={() => handleDeletePage(page.id)}
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white h-8 w-8 p-0 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleAddPageToPdf}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Page
              </Button>
              <Button
                onClick={handleSavePdf}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              <Button
                onClick={() => {
                  setShowPdfEditorDialog(false);
                  setEditingPdfId(null);
                  setCollectedPages([]);
                  setPdfName('');
                }}
                variant="outline"
                className="border-slate-600 text-slate-200"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Recently Deleted Dialog */}
      <Dialog open={showDeletedDialog} onOpenChange={setShowDeletedDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-400" />
              Recently Deleted
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-400">Items will be permanently deleted after 30 days</p>
            
            {recentlyDeleted.map((document) => {
              const daysLeft = Math.ceil((30 * 24 * 60 * 60 * 1000 - (Date.now() - document.deletedAt)) / (24 * 60 * 60 * 1000));
              
              return (
                <Card key={document.id} className="bg-slate-700 border-slate-600">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{document.name}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Deletes in {daysLeft} days • {document.pages} pages • {document.size}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => restoreDocument(document.id)}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Restore
                        </Button>
                        <Button
                          onClick={() => {
                            if (window.confirm('Permanently delete this document?')) {
                              permanentlyDelete(document.id);
                            }
                          }}
                          size="sm"
                          variant="outline"
                          className="border-red-600 text-red-400 hover:bg-red-900/20"
                        >
                          Delete Forever
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {recentlyDeleted.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                No recently deleted items
              </div>
            )}
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
                {selectedDocument.pages && (
                  <div>
                    <span className="text-slate-400">Pages:</span>
                    <span className="text-white ml-2">{selectedDocument.pages}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-400">Date:</span>
                  <span className="text-white ml-2">{selectedDocument.date}</span>
                </div>
              </div>
              
              <div>
                <h4 className="text-white font-medium mb-2">Document Details:</h4>
                <div className="bg-slate-700 p-4 rounded-lg text-sm text-slate-200 whitespace-pre-line">
                  {selectedDocument.extractedText}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => openPdfEditor(selectedDocument)}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit PDF
                </Button>
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
