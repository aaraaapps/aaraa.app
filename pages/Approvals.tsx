
import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../App';
import { CheckCircle2, XCircle, ArrowUpRight, Search, Filter, Clock, Eye, ShieldAlert } from 'lucide-react';
import { Submission, SubmissionStatus, UserRole } from '../types';

const Approvals: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [pending, setPending] = useState<Submission[]>([]);
  const [feedback, setFeedback] = useState<{show: boolean, msg: string, success: boolean}>({show: false, msg: '', success: true});

  useEffect(() => {
    // Mock pending approvals based on role
    const mockData: Submission[] = [
      { id: 'SUB501', employee_id: 'AI1003', employee_name: 'Manikandan', type: 'BILL', title: 'Steel Supply (Site A)', amount: 125000, url: 'https://picsum.photos/500/800', status: SubmissionStatus.PENDING, created_at: '3 hours ago', department: 'Site' },
      { id: 'SUB502', employee_id: 'AI1008', employee_name: 'Imtiaz', type: 'BILL', title: 'Safety Equipment Procurement', amount: 8400, url: 'https://picsum.photos/500/800', status: SubmissionStatus.PENDING, created_at: '5 hours ago', department: 'Procurement' },
      { id: 'SUB503', employee_id: 'AI1027', employee_name: 'Ajith', type: 'SITE_PHOTO', title: 'Tower 4 Inspection Report', url: 'https://picsum.photos/500/800', status: SubmissionStatus.PENDING, created_at: '1 day ago', department: 'Site' },
    ];
    setPending(mockData);
  }, []);

  const handleAction = (id: string, action: SubmissionStatus, reason?: string) => {
    // CTA Button Mandatory Rule
    if (action === SubmissionStatus.REJECTED && !reason) {
      setFeedback({ show: true, msg: "Rejection requires a valid reason.", success: false });
      return;
    }

    setPending(prev => prev.filter(p => p.id !== id));
    setFeedback({ 
      show: true, 
      msg: `Submission ${id} ${action.toLowerCase()} successfully.`, 
      success: true 
    });
    
    setTimeout(() => setFeedback({ ...feedback, show: false }), 4000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Pending Approvals</h1>
          <p className="text-gray-500 mt-1">Review and authenticate department submissions</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-black transition-colors apple-shadow">Batch Approve</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {pending.length === 0 ? (
          <div className="bg-white p-20 rounded-[40px] border border-gray-100 apple-shadow text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4 opacity-20" />
            <h2 className="text-xl font-bold text-gray-900">Queue is clear</h2>
            <p className="text-gray-500 mt-2">All submissions have been processed for your department.</p>
          </div>
        ) : (
          pending.map((item) => (
            <div key={item.id} className="bg-white p-8 rounded-[40px] border border-gray-100 apple-shadow flex flex-col md:flex-row md:items-center gap-8 group">
              <div className="w-full md:w-32 h-40 bg-gray-100 rounded-2xl overflow-hidden relative cursor-pointer group-hover:shadow-xl transition-all">
                <img src={item.url} alt="Proof" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Eye className="text-white w-6 h-6" />
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full uppercase tracking-widest">{item.type}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">{item.id}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Submitted By</span>
                    <span className="text-sm font-semibold">{item.employee_name} ({item.department})</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Requested Amount</span>
                    <span className="text-sm font-bold text-gray-900">₹{item.amount?.toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Time Elapsed</span>
                    <span className="text-sm font-semibold text-orange-600 flex items-center gap-1"><Clock className="w-3 h-3" /> {item.created_at}</span>
                  </div>
                </div>
              </div>

              <div className="flex md:flex-col gap-2 w-full md:w-48">
                <button 
                  onClick={() => handleAction(item.id, SubmissionStatus.APPROVED)}
                  className="flex-1 md:w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/10 active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" /> Approve
                </button>
                <button 
                  onClick={() => handleAction(item.id, SubmissionStatus.REJECTED, "Incomplete documentation")}
                  className="flex-1 md:w-full bg-white border border-red-100 hover:bg-red-50 text-red-600 font-bold py-3 rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
                {user?.role === UserRole.ADMIN && (
                  <button 
                    onClick={() => handleAction(item.id, SubmissionStatus.ESCALATED)}
                    className="md:w-full text-[10px] font-bold text-gray-400 hover:text-gray-900 uppercase tracking-widest py-2 transition-colors flex items-center justify-center gap-1"
                  >
                    <ShieldAlert className="w-3 h-3" /> Escalate to MD
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {feedback.show && (
        <div className={`fixed bottom-10 right-10 flex items-center gap-3 px-8 py-5 rounded-[28px] shadow-2xl transition-all animate-in slide-in-from-right-10 z-[100] ${
          feedback.success ? 'bg-gray-900 text-white' : 'bg-red-600 text-white'
        }`}>
          {feedback.success ? <CheckCircle2 className="w-6 h-6 text-green-400" /> : <ShieldAlert className="w-6 h-6" />}
          <div>
            <p className="text-sm font-bold">{feedback.success ? 'Action Successful' : 'Action Failed'}</p>
            <p className="text-xs text-white/70">{feedback.msg}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Approvals;
