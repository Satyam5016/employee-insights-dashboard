import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const Details = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const photoCanvasRef = useRef(null);
  const signatureCanvasRef = useRef(null);
  
  const [stream, setStream] = useState(null);
  const [hasCaptured, setHasCaptured] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Dimensions for captures and canvas
  const CANVAS_WIDTH = 640;
  const CANVAS_HEIGHT = 480;

  // Start Camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Camera access denied or unavailable.");
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      // Cleanup stream on unmount
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentional omission of stream to only run once on mount

  // Capture Photo
  const capturePhoto = useCallback(() => {
    if (videoRef.current && photoCanvasRef.current) {
      const ctx = photoCanvasRef.current.getContext('2d');
      // Draw the current video frame onto the canvas
      ctx.drawImage(videoRef.current, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // Stop the camera tracks
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      
      setHasCaptured(true);
      
      // Initialize signature canvas with transaparent background
      if (signatureCanvasRef.current) {
        const sigCtx = signatureCanvasRef.current.getContext('2d');
        sigCtx.lineCap = 'round';
        sigCtx.lineJoin = 'round';
        sigCtx.strokeStyle = '#ef4444'; // Red signature for visibility over images
        sigCtx.lineWidth = 4;
      }
    }
  }, [stream]);

  // Retake Photo
  const retakePhoto = useCallback(() => {
    setHasCaptured(false);
    
    // Clear the signature canvas if requested
    if (signatureCanvasRef.current) {
      const sigCtx = signatureCanvasRef.current.getContext('2d');
      sigCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
    
    startCamera();
  }, []);

  // Signature Drawing Logic
  const getCoordinates = (e) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return null;
    
    const rect = canvas.getBoundingClientRect();
    
    // Handle touch
    if (e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    
    // Handle mouse
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    if (!hasCaptured) return;
    
    setIsDrawing(true);
    const coords = getCoordinates(e);
    if (!coords) return;
    
    const ctx = signatureCanvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing || !hasCaptured) return;
    
    const coords = getCoordinates(e);
    if (!coords) return;
    
    const ctx = signatureCanvasRef.current.getContext('2d');
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = (e) => {
    e.preventDefault();
    if (isDrawing) {
      const ctx = signatureCanvasRef.current.getContext('2d');
      ctx.closePath();
      setIsDrawing(false);
    }
  };

  // Merge & Navigate
  const generateAuditImage = useCallback(() => {
    if (!hasCaptured || !photoCanvasRef.current || !signatureCanvasRef.current) return;
    
    // Create an offscreen canvas to merge
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = CANVAS_WIDTH;
    offscreenCanvas.height = CANVAS_HEIGHT;
    const ctx = offscreenCanvas.getContext('2d');
    
    // Draw photo first
    ctx.drawImage(photoCanvasRef.current, 0, 0);
    // Draw signature on top
    ctx.drawImage(signatureCanvasRef.current, 0, 0);
    
    // Export final image to base64
    const mergedDataUrl = offscreenCanvas.toDataURL('image/png');
    
    // Navigate with state
    navigate('/analytics', { state: { auditImage: mergedDataUrl, employeeId: id } });
  }, [hasCaptured, id, navigate]);

  return (
    <div className="min-h-screen bg-neutral-950 p-6 flex flex-col items-center">
      <header className="w-full max-w-4xl flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Employee details & Audit</h1>
          <p className="text-neutral-400 text-sm mt-1">Record ID: {id}</p>
        </div>
        <button
          onClick={() => navigate('/list')}
          className="px-4 py-2 border border-neutral-700 hover:bg-neutral-800 text-neutral-300 rounded-lg text-sm transition-colors"
        >
          Back to List
        </button>
      </header>

      <main className="w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-8 flex flex-col items-center">
        
        <div className="mb-6 w-full text-center">
          <h2 className="text-xl font-semibold text-white mb-2">
            {hasCaptured ? "Sign to verify identity" : "Facial Verification"}
          </h2>
          <p className="text-neutral-400 text-sm">
            {hasCaptured 
              ? "Draw your signature directly on the photo below." 
              : "Please look directly at the camera to capture a verification photo."}
          </p>
        </div>

        {/* Media Container */}
        <div 
          className="relative bg-black rounded-lg overflow-hidden flex items-center justify-center border-4 border-neutral-800 shadow-inner"
          style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
        >
          {/* Video Preview - Only visible when NOT captured */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`absolute top-0 left-0 w-full h-full object-cover ${hasCaptured ? 'hidden' : 'block'}`}
          />
          
          {/* The Captured Photo Canvas */}
          <canvas
            ref={photoCanvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className={`absolute top-0 left-0 w-full h-full object-cover ${!hasCaptured ? 'hidden' : 'block'}`}
          />

          {/* The Signature Overlay Canvas */}
          <canvas
            ref={signatureCanvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className={`absolute top-0 left-0 w-full h-full z-10 cursor-crosshair ${!hasCaptured ? 'hidden' : 'block'}`}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            onTouchCancel={stopDrawing}
          />
          
          {!stream && !hasCaptured && (
            <div className="absolute text-neutral-500 animate-pulse">Requesting camera access...</div>
          )}
        </div>

        {/* Action Controls */}
        <div className="mt-8 flex gap-4 w-full justify-center">
          {!hasCaptured ? (
            <button
              onClick={capturePhoto}
              disabled={!stream}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors shadow-lg shadow-blue-900/20"
            >
              Capture Photo
            </button>
          ) : (
            <>
              <button
                onClick={retakePhoto}
                className="px-6 py-3 border border-neutral-700 hover:bg-neutral-800 text-neutral-300 font-medium rounded-xl transition-colors"
              >
                Retake
              </button>
              <button
                onClick={generateAuditImage}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-emerald-900/20"
              >
                Generate Audit Image
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Details;
