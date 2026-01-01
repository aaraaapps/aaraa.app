
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import { dbService } from '../services/supabase';
import { 
  CheckCircle2, ChevronRight, ChevronLeft, Building, Users, MapPin, 
  Calculator, FileCheck, Package, Plus, Trash2, LayoutGrid, PlusCircle, 
  ShieldCheck, FileText, Calendar, Wallet, Layers, ShieldAlert,
  Contact, Phone, Mail, Map, Settings, ExternalLink
} from 'lucide-react';
import { LOGO_URL } from '../constants';

const ProjectCreationPage: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [successCode, setSuccessCode] = useState<string | null>(null);
  
  // Master Data
  const [boqMaster, setBoqMaster] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  
  // UI States
  const [newBoqName, setNewBoqName] = useState('');
  const [newBoqUnit, setNewBoqUnit] = useState('');
  const [showNewBoqForm, setShowNewBoqForm] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    project_code: 'AI', // Updated to start with AI
    project_name: '',
    project_type: 'Residential',
    project_category: 'Turnkey',
    project_status: 'Planned',
    client_name: '',
    client_org: '',
    client_contact: '',
    client_mobile: '',
    client_email: '',
    contract_type: 'BOQ Based',
    agreement_value: '',
    site_address: '',
    city: '',
    state: '',
    pincode: '',
    latitude: '',
    longitude: '',
    start_date: '',
    completion_date: '',
    actual_completion_date: '',
    defect_liability_period: '12',
    project_manager_id: '',
    site_engineers_ids: [] as string[],
    qs_engineer_id: '',
    safety_officer_id: '',
    reporting_manager_id: '',
    estimated_cost: '',
    approved_budget: '',
    retention_percentage: '5',
    gst_applicable: true,
    payment_terms: 'RA',
    boq_attached: true,
    boq_version: 'V1.0',
    scope_summary: '',
    exclusions: '',
    work_order_number: '',
    work_order_date: '',
    project_visibility: 'Assigned Team',
    approval_flow: 'Standard',
    notifications_enabled: true,
    boq_items: [] as any[]
  });

  useEffect(() => {
    const init = async () => {
      const [boq, emps, unitList] = await Promise.all([
        dbService.getBOQMaster(),
        dbService.getEmployees(),
        dbService.getUnits()
      ]);
      if (boq.data) setBoqMaster(boq.data);
      if (emps.data) setEmployees(emps.data);
      if (unitList.data) setUnits(unitList.data);
    };
    init();
  }, []);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    
    // UI Reinforcement for AI prefix
    if (name === 'project_code' && !value.startsWith('AI')) {
        // If the user tries to remove "AI", we force it back if it's too short,
        // or just let them edit while showing an error later.
        // For better UX, we just allow the change but validate strictly on submit.
    }

    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const addBoqItem = (item: any) => {
    if (formData.boq_items.find(i => i.id === item.id)) return;
    setFormData(prev => ({
      ...prev,
      boq_items: [...prev.boq_items, { ...item, quantity: 0, rate: 0 }]
    }));
  };

  const handleAddNewBoq = async () => {
    if (!newBoqName || !newBoqUnit) return;
    const { data, error } = await dbService.createBOQItem(newBoqName, newBoqUnit);
    if (data) {
      setBoqMaster(prev => [...prev, data]);
      addBoqItem(data);
      setNewBoqName('');
      setShowNewBoqForm(false);
    }
  };

  const removeBoqItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      boq_items: prev.boq_items.filter(i => i.id !== id)
    }));
  };

  const handleSubmit = async () => {
    if (!formData.project_code || !formData.project_name) {
      alert("Project Code and Name are mandatory.");
      return;
    }

    if (!formData.project_code.startsWith('AI')) {
      alert("Project Code must start with 'AI'.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        agreement_value: parseFloat(formData.agreement_value) || 0,
        estimated_cost: parseFloat(formData.estimated_cost) || 0,
        approved_budget: parseFloat(formData.approved_budget) || 0,
        latitude: parseFloat(formData.latitude) || 0,
        longitude: parseFloat(formData.longitude) || 0,
        defect_liability_period: parseInt(formData.defect_liability_period) || 0,
        retention_percentage: parseFloat(formData.retention_percentage) || 0,
        boq_json: formData.boq_items,
        created_by: user?.id
      };
      
      const { data, error } = await dbService.createProject(payload);
      if (error) throw error;
      setSuccessCode(formData.project_code);
    } catch (err: any) {
      alert("Submission Error: " + (err.message || "Please check all mandatory fields."));
    } finally {
      setLoading(false);
    }
  };

  if (successCode) {
    const pm = employees.find(e => e.id === formData.project_manager_id);
    return (
      <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-in fade-in duration-500">
        <div className="bg-white w-full max-w-4xl rounded-[60px] shadow-2xl overflow-hidden border border-white/20 apple-shadow animate-in zoom-in duration-500 flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="p-10 pb-0 text-center">
            <div className="w-20 h-20 bg-green-50 rounded-[32px] flex items-center justify-center mx-auto shadow-inner mb-6 border border-green-100">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Project Success</h2>
            <p className="text-gray-500 mt-2 font-medium">Enterprise infrastructure record initialized for <span className="text-red-600 font-bold">{formData.project_code}</span></p>
          </div>

          {/* Details Scrollable Area */}
          <div className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide">
            {/* Identity Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <SummaryCard label="Project ID" value={formData.project_code} highlight />
              <SummaryCard label="Category" value={formData.project_category} />
              <SummaryCard label="Status" value={formData.project_status} />
              <SummaryCard label="Type" value={formData.project_type} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Commercial Summary */}
              <div className="bg-gray-50/50 rounded-[40px] p-8 border border-gray-100">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                  <Wallet className="w-4 h-4" /> Commercial Scope
                </h3>
                <div className="space-y-4">
                  <DetailRow label="Client Name" value={formData.client_name} />
                  <DetailRow label="Agreement Value" value={`₹${parseFloat(formData.agreement_value || '0').toLocaleString()}`} bold />
                  <DetailRow label="Retention %" value={`${formData.retention_percentage}%`} />
                  <DetailRow label="GST" value={formData.gst_applicable ? 'Applicable' : 'Exempted'} />
                </div>
              </div>

              {/* Execution Summary */}
              <div className="bg-gray-50/50 rounded-[40px] p-8 border border-gray-100">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Execution Timeline
                </h3>
                <div className="space-y-4">
                  <DetailRow label="Project Manager" value={pm?.name || 'Not Assigned'} />
                  <DetailRow label="Start Date" value={formData.start_date || 'TBD'} />
                  <DetailRow label="End Date" value={formData.completion_date || 'TBD'} />
                  <DetailRow label="DLP" value={`${formData.defect_liability_period} Months`} />
                </div>
              </div>
            </div>

            {/* BOQ Summary */}
            <div className="bg-white rounded-[40px] p-8 border border-gray-100 apple-shadow">
               <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                  <Package className="w-4 h-4" /> Work Scope Summary ({formData.boq_items.length} items)
               </h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                 {formData.boq_items.slice(0, 6).map(item => (
                   <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
                     <span className="text-xs font-bold text-gray-700 truncate">{item.item_name}</span>
                     <span className="text-[9px] font-black text-red-600 uppercase px-2 py-1 bg-white rounded-lg border border-red-50">{item.unit}</span>
                   </div>
                 ))}
                 {formData.boq_items.length > 6 && (
                   <div className="flex items-center justify-center p-3 bg-red-50 rounded-2xl text-[10px] font-bold text-red-600 uppercase tracking-widest">
                     + {formData.boq_items.length - 6} More Items
                   </div>
                 )}
               </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="p-10 bg-gray-50/80 border-t border-gray-100 flex gap-4">
            <button 
              onClick={() => window.location.href = '#/dashboard'}
              className="flex-1 bg-gray-900 text-white font-black py-5 rounded-3xl hover:bg-black transition-all shadow-xl flex items-center justify-center gap-2 active:scale-95"
            >
              Finish & Return Dashboard
            </button>
            <button 
              className="px-8 bg-white text-gray-900 font-bold py-5 rounded-3xl border border-gray-200 hover:bg-gray-50 transition-all flex items-center gap-2 active:scale-95"
              onClick={() => window.print()}
            >
              <FileText className="w-5 h-5" /> Print Summary
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
           <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20">
             <PlusCircle className="text-white w-7 h-7" />
           </div>
           <div>
             <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Initialize Project</h1>
             <p className="text-gray-500 font-medium">Step {step} of 6 — {
               step === 1 ? 'Identity' : step === 2 ? 'Client & Location' : step === 3 ? 'Team & Timeline' : step === 4 ? 'Financials' : step === 5 ? 'BOQ Scope' : 'Final Review'
             }</p>
           </div>
        </div>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div key={s} className={`h-1.5 w-10 rounded-full transition-all duration-500 ${step >= s ? 'bg-red-600' : 'bg-gray-200'}`} />
          ))}
        </div>
      </div>

      <div className="bg-white p-10 md:p-14 rounded-[50px] border border-gray-100 apple-shadow">
        
        {/* STEP 1: IDENTITY */}
        {step === 1 && (
          <div className="space-y-8 animate-in slide-in-from-right-4">
            <div className="flex items-center gap-3 text-red-600 mb-2">
              <Building className="w-8 h-8" />
              <h2 className="text-2xl font-black tracking-tight">Project Identity</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Field label="Project Code* (Must start with AI)" name="project_code" value={formData.project_code} onChange={handleChange} placeholder="e.g. AI-410287" />
              <Field label="Project Name*" name="project_name" value={formData.project_name} onChange={handleChange} placeholder="e.g. VH Hinjewadi P2" />
              <Select label="Project Type" name="project_type" value={formData.project_type} onChange={handleChange} options={['Residential', 'Commercial', 'Industrial', 'Infrastructure']} />
              <Select label="Project Category" name="project_category" value={formData.project_category} onChange={handleChange} options={['Turnkey', 'Civil Only', 'Interior', 'EPC']} />
              <Select label="Project Status" name="project_status" value={formData.project_status} onChange={handleChange} options={['Planned', 'Ongoing', 'On Hold', 'Completed']} />
            </div>
          </div>
        )}

        {/* STEP 2: CLIENT & LOCATION */}
        {step === 2 && (
          <div className="space-y-8 animate-in slide-in-from-right-4">
            <div className="flex items-center gap-3 text-blue-600 mb-2">
              <Contact className="w-8 h-8" />
              <h2 className="text-2xl font-black tracking-tight">Client & Location</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2"><Field label="Client Name*" name="client_name" value={formData.client_name} onChange={handleChange} /></div>
              <Field label="Client Organization" name="client_org" value={formData.client_org} onChange={handleChange} />
              <Field label="Contact Person" name="client_contact" value={formData.client_contact} onChange={handleChange} />
              <Field label="Mobile Number" name="client_mobile" value={formData.client_mobile} onChange={handleChange} />
              <Field label="Email ID" name="client_email" value={formData.client_email} onChange={handleChange} />
              <Select label="Contract Type" name="contract_type" value={formData.contract_type} onChange={handleChange} options={['Lump Sum', 'Item Rate', 'BOQ Based']} />
              <Field label="Agreement Value (₹)*" name="agreement_value" value={formData.agreement_value} onChange={handleChange} type="number" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-50">
              <div className="md:col-span-3"><Field label="Site Address*" name="site_address" value={formData.site_address} onChange={handleChange} textarea /></div>
              <Field label="City" name="city" value={formData.city} onChange={handleChange} />
              <Field label="State" name="state" value={formData.state} onChange={handleChange} />
              <Field label="Pincode" name="pincode" value={formData.pincode} onChange={handleChange} />
              <Field label="Latitude (Optional)" name="latitude" value={formData.latitude} onChange={handleChange} type="number" />
              <Field label="Longitude (Optional)" name="longitude" value={formData.longitude} onChange={handleChange} type="number" />
            </div>
          </div>
        )}

        {/* STEP 3: TEAM & TIMELINE */}
        {step === 3 && (
          <div className="space-y-8 animate-in slide-in-from-right-4">
            <div className="flex items-center gap-3 text-purple-600 mb-2">
              <Calendar className="w-8 h-8" />
              <h2 className="text-2xl font-black tracking-tight">Team & Timeline</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Field label="Project Start Date" name="start_date" value={formData.start_date} onChange={handleChange} type="date" />
              <Field label="Expected Completion Date" name="completion_date" value={formData.completion_date} onChange={handleChange} type="date" />
              <Field label="Defect Liability Period (Months)" name="defect_liability_period" value={formData.defect_liability_period} onChange={handleChange} type="number" />
              <Select label="Project Manager" name="project_manager_id" value={formData.project_manager_id} onChange={handleChange} options={employees.map(e => ({ label: e.name, value: e.id }))} />
              <Select label="Reporting Manager" name="reporting_manager_id" value={formData.reporting_manager_id} onChange={handleChange} options={employees.map(e => ({ label: e.name, value: e.id }))} />
              <Select label="QS / Billing Engineer" name="qs_engineer_id" value={formData.qs_engineer_id} onChange={handleChange} options={employees.map(e => ({ label: e.name, value: e.id }))} />
              <Select label="Safety Officer" name="safety_officer_id" value={formData.safety_officer_id} onChange={handleChange} options={employees.map(e => ({ label: e.name, value: e.id }))} />
            </div>
          </div>
        )}

        {/* STEP 4: FINANCIALS & COMPLIANCE */}
        {step === 4 && (
          <div className="space-y-8 animate-in slide-in-from-right-4">
            <div className="flex items-center gap-3 text-emerald-600 mb-2">
              <Wallet className="w-8 h-8" />
              <h2 className="text-2xl font-black tracking-tight">Financials & Compliance</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Field label="Estimated Project Cost (₹)" name="estimated_cost" value={formData.estimated_cost} onChange={handleChange} type="number" />
              <Field label="Approved Budget (₹)" name="approved_budget" value={formData.approved_budget} onChange={handleChange} type="number" />
              <Field label="Retention Percentage (%)" name="retention_percentage" value={formData.retention_percentage} onChange={handleChange} type="number" />
              <Select label="Payment Terms" name="payment_terms" value={formData.payment_terms} onChange={handleChange} options={['RA', 'Monthly', 'Milestone']} />
              <Field label="Work Order Number" name="work_order_number" value={formData.work_order_number} onChange={handleChange} />
              <Field label="Work Order Date" name="work_order_date" value={formData.work_order_date} onChange={handleChange} type="date" />
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                 <input type="checkbox" name="gst_applicable" checked={formData.gst_applicable} onChange={handleChange} className="w-5 h-5 accent-red-600" />
                 <label className="text-sm font-bold text-gray-700">GST Applicable on Contract</label>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: BOQ SCOPE */}
        {step === 5 && (
          <div className="space-y-8 animate-in slide-in-from-right-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3 text-orange-600">
                <Layers className="w-8 h-8" />
                <h2 className="text-2xl font-black tracking-tight">BOQ & Scope Summary</h2>
              </div>
              <button 
                onClick={() => setShowNewBoqForm(!showNewBoqForm)}
                className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-red-600 hover:text-red-700 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add New Master Item
              </button>
            </div>

            {showNewBoqForm && (
              <div className="p-6 bg-red-50 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-4 border border-red-100 animate-in zoom-in duration-300">
                <Field label="New Item Name" value={newBoqName} onChange={(e: any) => setNewBoqName(e.target.value)} />
                <Select label="Unit" value={newBoqUnit} onChange={(e: any) => setNewBoqUnit(e.target.value)} options={units.map(u => u.unit_name)} />
                <div className="flex items-end">
                  <button onClick={handleAddNewBoq} className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-red-500/20 active:scale-95 transition-all">Save Master Item</button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search master BOQ items..." 
                    className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 font-bold focus:ring-2 focus:ring-red-500/20 text-gray-900"
                  />
                  <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                </div>
                <div className="max-h-64 overflow-y-auto space-y-2 pr-2 scrollbar-hide">
                  {boqMaster.map(item => (
                    <button 
                      key={item.id} 
                      onClick={() => addBoqItem(item)}
                      className="w-full text-left p-4 bg-gray-50 rounded-2xl flex items-center justify-between hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
                    >
                      <span className="font-bold text-sm text-gray-800">{item.item_name}</span>
                      <span className="text-[10px] font-black text-gray-400 uppercase bg-white px-2 py-1 rounded-full border border-gray-100">{item.unit}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50/50 p-6 rounded-[40px] border border-dashed border-gray-200">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Project Scope ({formData.boq_items.length} items)</h3>
                <div className="space-y-3">
                  {formData.boq_items.map(bi => (
                    <div key={bi.id} className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between animate-in slide-in-from-left-2 border border-gray-50">
                       <div>
                         <p className="text-xs font-bold text-gray-900 line-clamp-1">{bi.item_name}</p>
                         <p className="text-[9px] font-black text-red-600 uppercase mt-0.5">{bi.unit}</p>
                       </div>
                       <button onClick={() => removeBoqItem(bi.id)} className="text-gray-300 hover:text-red-600 p-2 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                  {formData.boq_items.length === 0 && (
                    <div className="py-12 text-center text-gray-400 text-sm font-medium italic">
                        No items selected from master BOQ.
                    </div>
                  )}
                </div>
              </div>
            </div>
            <Field label="Scope Exclusions (Optional)" name="exclusions" value={formData.exclusions} onChange={handleChange} textarea />
          </div>
        )}

        {/* STEP 6: FINAL REVIEW & PERMISSIONS */}
        {step === 6 && (
          <div className="space-y-8 animate-in slide-in-from-right-4">
             <div className="flex items-center gap-3 text-gray-900 mb-2">
                <ShieldAlert className="w-8 h-8" />
                <h2 className="text-2xl font-black tracking-tight">Final Confirmation</h2>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Select label="Project Visibility" name="project_visibility" value={formData.project_visibility} onChange={handleChange} options={['Assigned Team', 'Department', 'All Admins']} />
                <Select label="Approval Flow" name="approval_flow" value={formData.approval_flow} onChange={handleChange} options={['Standard', 'Custom']} />
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                   <input type="checkbox" name="notifications_enabled" checked={formData.notifications_enabled} onChange={handleChange} className="w-5 h-5 accent-red-600" />
                   <label className="text-sm font-bold text-gray-700">Notifications Enabled</label>
                </div>
             </div>
             <div className="bg-red-50 p-8 rounded-[40px] border border-red-100 space-y-4">
                <div className="flex items-center gap-3 text-red-700">
                   <ShieldCheck className="w-6 h-6" />
                   <h3 className="font-black text-lg">Declaration</h3>
                </div>
                <p className="text-sm text-red-800 leading-relaxed font-medium">
                   By finalizing this project, I confirm that all information provided is accurate and matches the signed Agreement/Work Order. 
                   I acknowledge that this action will initialize the project across all ERP modules including Indents, Billing, and Site Monitoring.
                </p>
             </div>
          </div>
        )}

        {/* CONTROLS */}
        <div className="mt-12 pt-10 border-t border-gray-100 flex items-center justify-between">
           <button 
             onClick={() => setStep(step - 1)} 
             disabled={step === 1}
             className="flex items-center gap-2 font-black text-gray-400 hover:text-gray-900 disabled:opacity-0 transition-all"
           >
             <ChevronLeft className="w-5 h-5" /> Back
           </button>
           
           <div className="flex gap-4">
              {step < 6 ? (
                <button 
                  onClick={() => setStep(step + 1)}
                  className="bg-gray-900 text-white px-12 py-5 rounded-3xl font-black shadow-xl hover:bg-black hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  Continue <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-red-600 text-white px-16 py-5 rounded-3xl font-black shadow-2xl shadow-red-500/30 hover:bg-red-700 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <CheckCircle2 className="w-6 h-6" />
                      Finalize Project
                    </>
                  )}
                </button>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

// UI HELPER COMPONENTS
const Field = ({ label, name, value, onChange, type = "text", placeholder = "", textarea = false, readOnly = false }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
    {textarea ? (
      <textarea name={name} value={value} onChange={onChange} placeholder={placeholder} className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-red-500/20 h-32 outline-none transition-all" />
    ) : (
      <input name={name} value={value} onChange={onChange} type={type} placeholder={placeholder} readOnly={readOnly} className={`w-full bg-gray-50 border-none rounded-2xl px-5 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-red-500/20 outline-none transition-all ${readOnly ? 'opacity-50 cursor-not-allowed' : ''}`} />
    )}
  </div>
);

const Select = ({ label, name, value, onChange, options }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
    <select name={name} value={value} onChange={onChange} className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-red-500/20 appearance-none outline-none transition-all">
      <option value="">Select Option</option>
      {options.map((opt: any) => (
        <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>
          {typeof opt === 'string' ? opt : opt.label}
        </option>
      ))}
    </select>
  </div>
);

const SummaryCard = ({ label, value, highlight = false }: any) => (
  <div className={`p-5 rounded-3xl border ${highlight ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
    <p className={`text-xl font-black truncate ${highlight ? 'text-red-600' : 'text-gray-900'}`}>{value || '—'}</p>
  </div>
);

const DetailRow = ({ label, value, bold = false }: any) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-100/50 last:border-0">
    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{label}</span>
    <span className={`text-sm ${bold ? 'font-black text-gray-900' : 'font-semibold text-gray-700'}`}>{value || '—'}</span>
  </div>
);

export default ProjectCreationPage;
