import React, { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../App';
import { 
  Plus, FileText, Image, DollarSign, Filter, Search, CheckCircle, 
  XCircle, Clock, Upload, Cloud, Camera, Zap, Eye, HardDrive, 
  ShieldCheck, RefreshCw, Smartphone, Monitor, AlertCircle, Loader2
} from 'lucide-react';
import { Submission, SubmissionStatus } from '../types';
import { dbService } from '../services/supabase';

const Submissions: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loadingData, setLoadingData] = useState(true);
  const [showToast, setShowToast] = useState<{show: boolean, msg: string, success: boolean}>({show: false, msg: '', success: true});
  
  // Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (user) {
      fetchSubmissions();
    }
  }, [user]);

  const fetchSubmissions = async () => {
    setLoadingData(true);
    try {
      const { data, error } = await dbService.getSubmissions(user?.id);
      if (!error && data) {
        setSubmissions(data as any);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const triggerToast = (msg: string, success: boolean) => {
    setShowToast({ show: true, msg, success });
    setTimeout(() => setShowToast(prev => ({ ...prev, show: false })), 4000);
  };

  const handleManualUpload = () => {
    fileInputRef.current?.click();
  };

  const startCamera = async () => {
    setIsCameraOpen(true);
    setCapturedImage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      setCameraStream(stream);
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      triggerToast("Camera Access Denied", false);
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraOpen(false);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(dataUrl);
      
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
    }
  };

  const uploadCapturedImage = async () => {
    if (!capturedImage || !user) return;
    
    setIsUploading(true);
    setUploadProgress(20);
    setIsCameraOpen(false);

    try {
      const res = await fetch(capturedImage);
      const blob = await res.blob();
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
      const path = `${user.department || 'Site'}/${user.id}/captures/${file.name}`;
      
      setUploadProgress(50);
      const publicUrl = await dbService.uploadToGCS(file, path);
      setUploadProgress(85);

      const newSubData = {
        employee_id: user.id,
        employee_name: user.name,
        type: 'SITE_PHOTO',
        title: `Site Photo - ${new Date().toLocaleDateString()}`,
        url: publicUrl,
        status: SubmissionStatus.PENDING,
        department: user.department || 'Site'
      };

      const { data, error } = await dbService.createSubmission(newSubData);
      if (error) throw error;

      setUploadProgress(100);
      setSubmissions(prev => [data as any, ...prev]);
      triggerToast("Photo Uploaded to Cloud", true);
    } catch (err: any) {
      triggerToast(err.message || "Cloud Uplink Failed", false);
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setCapturedImage(null);
      }, 600);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const path = `${user.department || 'Unsorted'}/${user.id}/uploads/${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
      setUploadProgress(40);
      const publicUrl = await dbService.uploadToGCS(file, path);
      setUploadProgress(80);

      const newSubData = {
        employee_id: user.id,
        employee_name: user.name,
        type: file.type.includes('image') ? 'SITE_PHOTO' : 'BILL',
        title: file.name,
        url: publicUrl,
        status: SubmissionStatus.PENDING,
        department: user.department || 'Site'
      };

      const { data, error } = await dbService.createSubmission(newSubData);
      if (error) throw error;

      setUploadProgress(100);
      setSubmissions(prev => [data as any, ...prev]);
      triggerToast("Cloud Uplink Successful", true);
    } catch (err: any) {
      triggerToast(err.message || "Uplink Failed", false);
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 600);
    }
    if (e.target) e.target.value = '';
  };

  const forceResetUpload = () => {
    setIsUploading(false);
    setUploadProgress(0);
    triggerToast("Uplink Forcefully Dismissed", false);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Site Submissions</h1>
          <p className="text-gray-500 font-medium mt-1">Target Cluster: <span className="text-red-600 font-bold">aaraa-erp-assets</span></p>
        </div>
        <div className="flex items-center gap-3">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          
          <button 
            onClick={startCamera}
            className="group flex items-center gap-3 bg-gray-900 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all"
          >
            <Camera className="w-5 h-5 text-red-500" />
            Capture Photo
          </button>
          
          <button 
            onClick={handleManualUpload}
            disabled={isUploading}
            className="group flex items-center gap-3 bg-red-600 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-red-500/30 active:scale-95 transition-all disabled:opacity-50"
          >
            <Cloud className="w-5 h-5 group-hover:animate-bounce" />
            Upload File
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div onClick={startCamera} className="bg-gradient-to-br from-red-600 to-red-700 p-8 rounded-[40px] text-white apple-shadow group cursor-pointer hover:scale-[1.02] transition-all overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform">
                   <Camera className="w-24 h-24" />
                </div>
                <div className="relative z-10">
                  <Smartphone className="w-8 h-8 mb-4 text-red-200" />
                  <h3 className="text-xl font-black tracking-tight">Live Site Capture</h3>
                  <p className="text-red-100 text-sm mt-1 font-medium">Auto-sync to cloud storage</p>
                </div>
             </div>
             <div onClick={handleManualUpload} className="bg-white p-8 rounded-[40px] border border-gray-100 apple-shadow group cursor-pointer hover:bg-gray-50 transition-all flex items-center gap-6">
                <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                   <h3 className="text-xl font-black text-gray-900 tracking-tight">Manual Upload</h3>
                   <p className="text-gray-400 text-sm font-medium">Select existing site artifacts</p>
                </div>
             </div>
          </div>

          {loadingData ? (
            <div className="p-32 text-center space-y-4">
              <div className="w-12 h-12 border-4 border-red-50 border-t-red-600 rounded-full animate-spin mx-auto"></div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Synchronizing Records</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="bg-white p-24 rounded-[50px] border border-gray-100 text-center apple-shadow">
               <div className="w-24 h-24 bg-gray-50 rounded-[40px] flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <HardDrive className="w-10 h-10 text-gray-300" />
               </div>
               <h2 className="text-2xl font-black text-gray-900 tracking-tight">Repository Empty</h2>
               <p className="text-gray-400 font-medium mt-3 max-w-xs mx-auto">No artifacts found in aaraa-erp-assets.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {submissions.map((sub) => (
                <div key={sub.id} className="bg-white p-6 rounded-[40px] border border-gray-100 apple-shadow flex items-center gap-6 group hover:scale-[1.01] transition-all">
                  <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center flex-shrink-0 shadow-inner ${
                    sub.type === 'BILL' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {sub.type === 'BILL' ? <DollarSign className="w-6 h-6" /> : <Image className="w-6 h-6" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{sub.department}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                      <Cloud className="w-3 h-3 text-red-500" />
                    </div>
                    <h3 className="text-lg font-black text-gray-900 truncate tracking-tight">{sub.title}</h3>
                    <p className="text-xs text-gray-400 font-bold">
                      {new Date(sub.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <a href={sub.url} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-900 hover:text-white transition-all">
                      <Eye className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="bg-white p-10 rounded-[50px] border border-gray-100 apple-shadow space-y-8">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Storage Cluster</h2>
            <div className="space-y-6">
              <InfoItem icon={Cloud} title="Bucket Name" desc="aaraa-erp-assets" status="Live" />
              <InfoItem icon={ShieldCheck} title="Protocol" desc="Standard Regional Storage" status="Secured" />
              <InfoItem icon={Zap} title="Throughput" desc="Edge Delivery Enabled" status="Optimal" />
            </div>
          </div>
        </div>
      </div>

      {/* CAMERA MODAL */}
      {isCameraOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[250] flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="w-full max-w-2xl bg-gray-900 rounded-[50px] overflow-hidden shadow-2xl relative border border-white/10">
              <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-10">
                <button onClick={stopCamera} className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <div className="aspect-[4/3] bg-black flex items-center justify-center overflow-hidden">
                {!capturedImage ? (
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover mirror" />
                ) : (
                  <img src={capturedImage} className="w-full h-full object-cover" alt="Captured" />
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>
              <div className="p-10 flex items-center justify-center gap-8 bg-gray-900">
                 {!capturedImage ? (
                   <button onClick={takePhoto} className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center p-1 group active:scale-90 transition-all">
                     <div className="w-full h-full bg-white rounded-full group-hover:scale-95 transition-transform" />
                   </button>
                 ) : (
                   <div className="flex gap-4 w-full">
                      <button onClick={() => setCapturedImage(null)} className="flex-1 bg-white/10 text-white font-black py-4 rounded-2xl">Retake</button>
                      <button onClick={uploadCapturedImage} className="flex-[2] bg-red-600 text-white font-black py-4 rounded-2xl shadow-2xl shadow-red-500/20">Confirm Uplink</button>
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* UPLOAD MODAL WITH HARD SAFETY RESET */}
      {isUploading && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-3xl z-[300] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-sm p-12 rounded-[60px] shadow-2xl border border-gray-100 text-center space-y-10 animate-in zoom-in duration-500">
              <div className="relative w-32 h-32 mx-auto">
                 <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle className="text-gray-100 stroke-current" strokeWidth="6" cx="50" cy="50" r="44" fill="transparent"></circle>
                    <circle className="text-red-600 stroke-current transition-all duration-500 ease-out" strokeWidth="6" strokeLinecap="round" cx="50" cy="50" r="44" fill="transparent" strokeDasharray="276.5" strokeDashoffset={276.5 - (276.5 * uploadProgress) / 100}></circle>
                 </svg>
                 <div className="absolute inset-0 flex items-center justify-center">
                    <Cloud className="w-10 h-10 text-red-600 animate-pulse" />
                 </div>
              </div>
              <div className="space-y-4">
                 <h2 className="text-2xl font-black text-gray-900 tracking-tighter">Uplink Active</h2>
                 <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">Transmitting to aaraa-erp-assets</p>
                 
                 {uploadProgress < 100 && (
                   <div className="pt-6 border-t border-gray-50 flex flex-col items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-3 h-3 text-red-500 animate-spin" />
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">GCS Pipeline Established</span>
                      </div>
                      <button 
                        onClick={forceResetUpload} 
                        className="mt-4 px-6 py-2 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-600 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                      >
                        Force Dismiss Modal
                      </button>
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {showToast.show && (
        <div className={`fixed bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 px-10 py-6 rounded-[35px] shadow-2xl transition-all animate-in slide-in-from-bottom-10 z-[400] border border-white/20 apple-shadow ${
          showToast.success ? 'bg-gray-900 text-white' : 'bg-red-600 text-white'
        }`}>
          {showToast.success ? <CheckCircle className="w-6 h-6 text-green-400" /> : <AlertCircle className="w-6 h-6" />}
          <span className="text-sm font-black tracking-tight uppercase tracking-widest">{showToast.msg}</span>
        </div>
      )}
    </div>
  );
};

const InfoItem = ({ icon: Icon, title, desc, status }: any) => (
  <div className="flex gap-4 group">
    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-red-50 transition-colors">
      <Icon className="w-6 h-6 text-gray-400 group-hover:text-red-600 transition-colors" />
    </div>
    <div className="flex-1">
      <div className="flex items-center justify-between mb-1">
        <h4 className="text-sm font-black text-gray-900 tracking-tight">{title}</h4>
        <span className="text-[9px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full uppercase">{status}</span>
      </div>
      <p className="text-xs text-gray-500 font-medium">{desc}</p>
    </div>
  </div>
);

export default Submissions;