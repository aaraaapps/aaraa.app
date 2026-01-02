
import React, { useState, useContext, useRef, useEffect } from 'react';
import { AuthContext } from '../App';
import { 
  Cloud, Upload, Image as ImageIcon, File, Trash2, ExternalLink, 
  Copy, CheckCircle2, XCircle, HardDrive, ShieldCheck, Zap, 
  Smartphone, Search, Grid, List, MoreVertical, Loader2
} from 'lucide-react';
import { dbService } from '../services/supabase';

const MediaVault: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [assets, setAssets] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [toast, setToast] = useState<{show: boolean, msg: string, success: boolean}>({show: false, msg: '', success: true});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadAssets = async () => {
      try {
        const { data } = await dbService.getSubmissions();
        if (data) {
          setAssets(data.filter((item: any) => item.url && item.url.includes('storage.googleapis.com')));
        }
      } catch (err) {
        console.error("Asset sync error:", err);
      }
    };
    loadAssets();
  }, []);

  const showToast = (msg: string, success: boolean) => {
    setToast({ show: true, msg, success });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || !files[0] || !user) return;
    
    const file = files[0];
    setUploading(true);
    setProgress(10);

    try {
      const path = `vault/${user.id}/${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
      setProgress(40);
      const publicUrl = await dbService.uploadToGCS(file, path);
      setProgress(85);

      const assetData = {
        employee_id: user.id,
        employee_name: user.name,
        type: file.type.includes('image') ? 'SITE_PHOTO' : 'BILL',
        title: file.name,
        url: publicUrl,
        status: 'APPROVED',
        department: user.department || 'General'
      };

      const { data, error } = await dbService.createSubmission(assetData);
      if (error) throw error;

      setAssets(prev => [data as any, ...prev]);
      setProgress(100);
      showToast("Uploaded to Google Cloud", true);
    } catch (err: any) {
      showToast(err.message || "Upload failed", false);
    } finally {
      // Always reset state in finally
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 500);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("URL copied to clipboard", true);
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Media Vault</h1>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-2 px-3 py-1 bg-red-50 rounded-full border border-red-100">
               <HardDrive className="w-3 h-3 text-red-600" />
               <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">aaraa-erp-assets</span>
            </div>
            <span className="text-xs text-gray-400 font-medium italic">Target Bucket</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-gray-900 text-white shadow-lg' : 'bg-white text-gray-400 hover:text-gray-900'}`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-gray-900 text-white shadow-lg' : 'bg-white text-gray-400 hover:text-gray-900'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-1 space-y-6">
          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileUpload(e.dataTransfer.files); }}
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`
              relative p-10 rounded-[45px] border-2 border-dashed transition-all cursor-pointer overflow-hidden
              flex flex-col items-center justify-center text-center space-y-6
              ${isDragging ? 'border-red-500 bg-red-50/50 scale-105' : 'border-gray-200 bg-white hover:border-red-400 hover:bg-gray-50/30'}
              ${uploading ? 'pointer-events-none' : ''}
              apple-shadow
            `}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={(e) => handleFileUpload(e.target.files)} 
              className="hidden" 
              accept="image/*,.pdf,.doc,.docx"
            />
            
            <div className="w-20 h-20 bg-red-50 rounded-[28px] flex items-center justify-center shadow-inner group">
              <Upload className={`w-10 h-10 text-red-600 ${isDragging ? 'animate-bounce' : 'group-hover:scale-110 transition-transform'}`} />
            </div>
            
            <div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Cloud Uplink</h3>
              <p className="text-gray-400 text-sm font-medium mt-1">Direct to aaraa-erp-assets</p>
            </div>

            {uploading && (
              <div className="absolute inset-x-0 bottom-0 p-6 bg-white/80 backdrop-blur-md animate-in slide-in-from-bottom-full">
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mb-2">
                   <div 
                    className="h-full bg-red-600 transition-all duration-500" 
                    style={{ width: `${progress}%` }}
                   />
                </div>
                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest flex items-center justify-center gap-2">
                   <Loader2 className="w-3 h-3 animate-spin" />
                   Transmitting...
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-8">
          {assets.length === 0 ? (
            <div className="bg-white p-32 rounded-[60px] border border-gray-100 apple-shadow text-center">
               <div className="w-24 h-24 bg-gray-50 rounded-[35px] flex items-center justify-center mx-auto mb-8">
                 <ImageIcon className="w-10 h-10 text-gray-200" />
               </div>
               <h2 className="text-2xl font-black text-gray-900 tracking-tight">No Assets</h2>
               <p className="text-gray-400 font-medium mt-3">Upload files to populate the cloud vault.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {assets.map((asset) => (
                <div key={asset.id} className="bg-white rounded-[40px] overflow-hidden apple-shadow group border border-gray-100 flex flex-col">
                  <div className="aspect-square relative overflow-hidden bg-gray-50">
                     <img src={asset.url} alt={asset.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button onClick={() => copyToClipboard(asset.url)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-900 hover:bg-red-600 hover:text-white transition-all shadow-xl">
                          <Copy className="w-4 h-4" />
                        </button>
                        <a href={asset.url} target="_blank" rel="noreferrer" className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-900 hover:bg-red-600 hover:text-white transition-all shadow-xl">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                     </div>
                  </div>
                  <div className="p-6">
                    <h4 className="text-sm font-black text-gray-900 truncate tracking-tight">{asset.title}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{asset.department}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="bg-white rounded-[40px] border border-gray-100 apple-shadow overflow-hidden">
               <table className="w-full text-left">
                  <tbody className="divide-y divide-gray-50">
                    {assets.map((asset) => (
                      <tr key={asset.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="p-6 flex items-center gap-4">
                           <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden">
                              <img src={asset.url} className="w-full h-full object-cover" />
                           </div>
                           <span className="text-sm font-bold text-gray-900">{asset.title}</span>
                        </td>
                        <td className="p-6">
                          <a href={asset.url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-red-600"><ExternalLink className="w-4 h-4" /></a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
             </div>
          )}
        </div>
      </div>

      {toast.show && (
        <div className={`fixed bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 px-10 py-6 rounded-[35px] shadow-2xl transition-all animate-in slide-in-from-bottom-10 z-[400] border border-white/20 apple-shadow ${
          toast.success ? 'bg-gray-900 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.success ? <CheckCircle2 className="w-6 h-6 text-green-400" /> : <XCircle className="w-6 h-6" />}
          <span className="text-sm font-black tracking-tight uppercase tracking-widest">{toast.msg}</span>
        </div>
      )}
    </div>
  );
};

export default MediaVault;
