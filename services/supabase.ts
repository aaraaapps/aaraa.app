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

  /**
   * ENTERPRISE GCS UPLOAD FLOW
   * Enhanced with strict JSON parsing and network failure detection.
   */
  async uploadToGCS(file: File, path: string) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s hard timeout for large files

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('path', path);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Handle non-OK responses (e.g., 404, 500)
      if (!response.ok) {
        let errorText = "Unknown Server Error";
        try {
          const errorData = await response.json();
          errorText = errorData.error || errorText;
        } catch (e) {
          errorText = `HTTP Error ${response.status}`;
        }
        throw new Error(`Uplink Failed: ${errorText}`);
      }

      const result = await response.json();
      if (!result.success) throw new Error(result.error || "GCS Uplink Handshake Failed");

      return result.url;
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error("Uplink Timed Out: The cloud cluster did not respond. Check connection.");
      }
      console.error("GCS Pipeline Critical Failure:", err);
      throw err;
    }
  }
};