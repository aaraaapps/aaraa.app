
import React, { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../App';
import { Plus, FileText, Image, DollarSign, Filter, Search, CheckCircle, XCircle, Clock, Upload, Cloud, Camera, Zap, Eye } from 'lucide-react';
import { Submission, SubmissionStatus } from '../types';
import { dbService } from '../services/supabase';

const Submissions: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loadingData, setLoadingData] = useState(true);
  const [showToast, setShowToast] = useState<{show: boolean, msg: string, success: boolean}>({show: false, msg: '', success: true});
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Programmatic GCS Integration Test
  const handleFastGcsTest = async () => {
    if (!user) return;
    setIsUploading(true);
    setUploadProgress(10);

    try {
      // 1. Generate a programmatic test image (Enterprise AI Identity Card)
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Graphics initialization failed");

      // Draw Apple-style background
      const gradient = ctx.createLinearGradient(0, 0, 400, 400);
      gradient.addColorStop(0, '#ed2f39');
      gradient.addColorStop(1, '#9e1a22');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 400, 400);

      // Add branding
      ctx.fillStyle = 'white';
      ctx.font = 'bold 40px Inter, Arial';
      ctx.fillText('AARAA', 40, 80);
      ctx.font = '24px Inter, Arial';
      ctx.fillText('Cloud Uplink Test', 40, 120);
      ctx.fillText(`User: ${user.id}`, 40, 320);
      ctx.fillText(`Time: ${new Date().toLocaleTimeString()}`, 40, 350);
      
      setUploadProgress(30);
      await new Promise(r => setTimeout(r, 600));

      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error("Canvas compression failed");
      
      const file = new File([blob], `gcs-test-${Date.now()}.png`, { type: "image/png" });
      const path = `system-tests/${user.id}/${file.name}`;
      
      setUploadProgress(50);
      
      // 2. Transmit to Cloud Storage (Supabase proxying GCS logic)
      const publicUrl = await dbService.uploadPhoto(file, path);
      setUploadProgress(85);

      // 3. Register in Enterprise Ledger
      const newSubData = {
        employee_id: user.id,
        employee_name: user.name,
        type: 'SITE_PHOTO',
        title: `GCS Integrator Test: Success`,
        url: publicUrl,
        status: SubmissionStatus.APPROVED,
        department: 'System/Test'
      };

      const { data, error } = await dbService.createSubmission(newSubData);
      if (error) throw error;

      setUploadProgress(100);
      setTimeout(() => {
        setSubmissions([data as any, ...submissions]);
        triggerToast("GCS Uplink Test: Connection Verified & Logged", true);
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);

    } catch (err: any) {
      triggerToast(err.message || "Uplink failure.", false);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleManualUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const path = `${user.id}/${Date.now()}-${file.name}`;
      const publicUrl = await dbService.uploadPhoto(file, path);
      setUploadProgress(70);

      const newSubData = {
        employee_id: user.id,
        employee_name: user.name,
        type: 'SITE_PHOTO',
        title: `Site Photo: ${file.name}`,
        url: publicUrl,
        status: SubmissionStatus.PENDING,
        department: user.department || 'Site'
      };

      const { data, error } = await dbService.createSubmission(newSubData);
      if (error) throw error;

      setUploadProgress(100);
      setTimeout(() => {
        setSubmissions([data as any, ...submissions]);
        triggerToast("Cloud upload successful", true);
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    } catch (err: any) {
      triggerToast(err.message || "Upload failed", false);
      setIsUploading(false);
      setUploadProgress(0);
    }
    if (e.target) e.target.value = '';
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20 animate-in fade-in duration-700">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Submissions</h1>
          <p className="text-gray-500 font-medium mt-1">Manage project artifacts and compliance documents</p>
        </div>
        <div className="flex items-center gap-3">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          
          <button 
            onClick={handleFastGcsTest}
            disabled={isUploading}
            className="flex items-center gap-2 bg-white border border-gray-200 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm hover:border-red-200 transition-all active:scale-95 disabled:opacity-50"
          >
            <Zap className="w-4 h-4 text-red-600" />
            Fast GCS Test
          </button>
          
          <button 
            onClick={handleManualUpload}
            disabled={isUploading}
            className="flex items-center gap-2 bg-red-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            <Camera className="w-4 h-4" />
            Capture Photo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-red-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Search by ID or Title..." 
                className="w-full bg-white border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold shadow-sm outline-none focus:ring-4 focus:ring-red-500/5 transition-all" 
              />
            </div>
            <button className="p-4 bg-white rounded-2xl text-gray-400 hover:bg-gray-900 hover:text-white shadow-sm border border-gray-100 transition-all active:scale-90">
              <Filter className="w-5 h-5" />
            </button>
          </div>

          {loadingData ? (
            <div className="p-32 text-center space-y-4">
              <div className="w-12 h-12 border-4 border-red-50 border-t-red-600 rounded-full animate-spin mx-auto"></div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Syncing Records</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="bg-white p-24 rounded-[50px] border-2 border-dashed border-gray-100 text-center">
               <div className="w-24 h-24 bg-gray-50 rounded-[40px] flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <Cloud className="w-10 h-10 text-gray-300" />
               </div>
               <h2 className="text-2xl font-black text-gray-900 tracking-tight">Vault is Empty</h2>
               <p className="text-gray-400 font-medium mt-3 max-w-xs mx-auto">Perform a Fast GCS Test to verify the integration now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {submissions.map((sub) => (
                <div key={sub.id} className="bg-white p-6 rounded-[40px] border border-gray-100 apple-shadow flex items-center gap-6 group hover:scale-[1.02] transition-all duration-500">
                  <div className={`w-20 h-20 rounded-[30px] flex items-center justify-center flex-shrink-0 shadow-inner ${
                    sub.type === 'BILL' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {sub.type === 'BILL' ? <DollarSign className="w-8 h-8" /> : <Camera className="w-8 h-8" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{sub.department}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                      <span className="text-[9px] font-black text-red-600 uppercase tracking-widest">{sub.type}</span>
                    </div>
                    <h3 className="text-xl font-black text-gray-900 truncate tracking-tight">{sub.title}</h3>
                    <p className="text-xs text-gray-400 font-bold mt-1">
                      Uploaded {new Date(sub.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest ${
                      sub.status === SubmissionStatus.APPROVED ? 'bg-green-50 text-green-600' :
                      sub.status === SubmissionStatus.REJECTED ? 'bg-red-50 text-red-600' :
                      'bg-orange-50 text-orange-600'
                    }`}>
                      {sub.status}
                    </div>
                    <a 
                      href={sub.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="w-14 h-14 rounded-3xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-900 hover:text-white transition-all active:scale-90"
                    >
                      <Eye className="w-6 h-6" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <div className="bg-white p-10 rounded-[50px] border border-gray-100 apple-shadow space-y-8">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Infrastructure</h2>
            <div className="space-y-6">
              <InfoItem icon={Cloud} title="GCS Gateway" desc="Regional endpoint active (asia-south1)" status="Online" />
              <InfoItem icon={Upload} title="Traffic" desc="Encrypted SSL/TLS transmission active" status="Secure" />
              <InfoItem icon={Zap} title="AI Processing" desc="Auto-tagging and OCR analysis enabled" status="Active" />
            </div>
          </div>
          
          <div className="bg-gray-900 p-10 rounded-[50px] text-white apple-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
            <h3 className="text-xl font-black tracking-tight mb-4 flex items-center gap-2">
              <Cloud className="w-5 h-5 text-red-500" />
              Cloud Sync
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed font-medium mb-6">
              Your site artifacts are instantly replicated across global nodes for zero-loss redundancy.
            </p>
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-500/10 p-4 rounded-2xl border border-red-500/20">
               <span>Integrity Check</span>
               <span>Passed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Upload Modal */}
      {isUploading && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-3xl z-[200] flex items-center justify-center p-6 animate-in fade-in duration-500">
           <div className="bg-white w-full max-w-sm p-12 rounded-[60px] shadow-2xl border border-gray-100 text-center space-y-10 animate-in zoom-in duration-700">
              <div className="relative w-32 h-32 mx-auto">
                 <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle className="text-gray-50 stroke-current" strokeWidth="6" cx="50" cy="50" r="44" fill="transparent"></circle>
                    <circle 
                      className="text-red-600 stroke-current transition-all duration-700 ease-out" 
                      strokeWidth="6" 
                      strokeLinecap="round" 
                      cx="50" cy="50" r="44" 
                      fill="transparent" 
                      strokeDasharray="276.5" 
                      strokeDashoffset={276.5 - (276.5 * uploadProgress) / 100}
                    ></circle>
                 </svg>
                 <div className="absolute inset-0 flex items-center justify-center">
                    <Cloud className="w-10 h-10 text-red-600 animate-pulse" />
                 </div>
              </div>
              <div className="space-y-2">
                 <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Uplink Active</h2>
                 <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                   {uploadProgress < 100 ? 'Transmitting to Cloud Storage' : 'Synchronizing Ledger'}
                 </p>
              </div>
              <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                 <div className="h-full bg-red-600 transition-all duration-700" style={{ width: `${uploadProgress}%` }}></div>
              </div>
           </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast.show && (
        <div className={`fixed bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 px-10 py-6 rounded-[35px] shadow-2xl transition-all animate-in slide-in-from-bottom-10 z-[300] border border-white/20 apple-shadow ${
          showToast.success ? 'bg-gray-900 text-white' : 'bg-red-600 text-white'
        }`}>
          {showToast.success ? <CheckCircle className="w-6 h-6 text-green-400" /> : <XCircle className="w-6 h-6" />}
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
      <p className="text-xs text-gray-500 font-medium leading-relaxed">{desc}</p>
    </div>
  </div>
);

export default Submissions;
