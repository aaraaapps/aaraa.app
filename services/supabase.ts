
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vmzgqmdhfrktqdcwutnk.supabase.co';
const supabaseKey = 'sb_publishable_MfN3LR_SyoIDSCMo7VPvzQ_OZQIEhjK';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const authService = {
  async loginEmployee(id: string) {
    const cleanId = id.trim();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('id', cleanId)
      .single();
    
    if (error || !data) throw new Error("Employee ID not found in master records.");
    return data;
  }
};

export const dbService = {
  async getSubmissions(employeeId?: string, department?: string) {
    let query = supabase.from('submissions').select('*').order('created_at', { ascending: false });
    if (employeeId) query = query.eq('employee_id', employeeId);
    if (department) query = query.eq('department', department);
    return await query;
  },

  async createSubmission(submission: any) {
    return await supabase.from('submissions').insert(submission).select().single();
  },

  async updateSubmissionStatus(id: string, status: string) {
    return await supabase.from('submissions').update({ status }).eq('id', id);
  },

  async getBOQMaster() {
    return await supabase.from('boq_items').select('*').order('item_name');
  },

  async createBOQItem(name: string, unit: string) {
    return await supabase.from('boq_items').insert({ item_name: name, unit }).select().single();
  },

  async getUnits() {
    return await supabase.from('boq_units').select('*').order('unit_name');
  },

  async createUnit(name: string) {
    return await supabase.from('boq_units').insert({ unit_name: name }).select().single();
  },

  async createProject(projectData: any) {
    return await supabase.from('projects').insert(projectData).select().single();
  },

  async getEmployees() {
    return await supabase.from('profiles').select('id, name, designation');
  },

  async getProjects() {
    return await supabase.from('projects').select('*').order('created_at', { ascending: false });
  },

  // Simulating GCS via Supabase Storage for the test upload
  async uploadPhoto(file: File, path: string) {
    // In a real GCS environment, we would use the Google Cloud SDK or a signed URL.
    // Here we use the existing Supabase infrastructure to provide a working 'Cloud Storage' experience.
    const { data, error } = await supabase.storage
      .from('submissions')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) throw error;
    
    const { data: publicUrlData } = supabase.storage
      .from('submissions')
      .getPublicUrl(data.path);
      
    return publicUrlData.publicUrl;
  }
};
