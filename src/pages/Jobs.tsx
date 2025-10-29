import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, DollarSign, Building, Briefcase, Plus, X, ExternalLink, Clock, CheckCircle, AlertCircle, Filter, Search, Loader } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  salary_range: string | null;
  description: string;
  requirements: string[];
  posted_by: string;
  posted_date: string;
  application_link: string | null;
  is_active: boolean;
  posted_by_name?: string;
  has_applied?: boolean;
}

export default function Jobs() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: 'full-time' as 'full-time' | 'part-time' | 'contract' | 'internship',
    salary_range: '',
    description: '',
    requirements: '',
    application_link: ''
  });

  useEffect(() => {
    if (!user) {
      toast.error('Please login to view jobs');
      navigate('/auth/login');
      return;
    }
    
    if (profile && !profile.verified) {
      toast.error('Only verified users can view jobs');
      navigate('/');
      return;
    }

    if (profile?.verified) {
      fetchJobs();
    }
  }, [profile, user, navigate]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          alumni:posted_by (name)
        `)
        .eq('is_active', true)
        .order('posted_date', { ascending: false });

      if (error) throw error;

      const jobsWithAppliedStatus = await Promise.all(
        (data || []).map(async (job) => {
          const { data: applicationData } = await supabase
            .from('job_applications')
            .select('id')
            .eq('job_id', job.id)
            .eq('alumni_id', user?.id)
            .single();

          return {
            ...job,
            posted_by_name: job.alumni?.name || 'Anonymous',
            has_applied: !!applicationData
          };
        })
      );

      setJobs(jobsWithAppliedStatus);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.verified) {
      toast.error('Only verified users can post jobs');
      return;
    }
    try {
      setSubmitting(true);
      const requirementsArray = formData.requirements.split('\n').map(req => req.trim()).filter(req => req.length > 0);
      const { error } = await supabase.from('jobs').insert([{ title: formData.title, company: formData.company, location: formData.location, type: formData.type, salary_range: formData.salary_range || null, description: formData.description, requirements: requirementsArray, application_link: formData.application_link || null, posted_by: user?.id }]);
      if (error) throw error;
      toast.success('Job posted successfully!');
      setShowAddModal(false);
      setFormData({ title: '', company: '', location: '', type: 'full-time', salary_range: '', description: '', requirements: '', application_link: '' });
      fetchJobs();
    } catch (error: any) {
      console.error('Error posting job:', error);
      toast.error(error.message || 'Failed to post job');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApply = async (jobId: string, applicationLink: string | null) => {
    if (!profile?.verified) {
      toast.error('Only verified users can apply for jobs');
      return;
    }
    try {
      if (applicationLink) { window.open(applicationLink, '_blank'); }
      const { error } = await supabase.from('job_applications').insert([{ job_id: jobId, alumni_id: user?.id, status: 'applied' }]);
      if (error) {
        if (error.code === '23505') { toast.error('You have already applied for this job'); } else { throw error; }
      } else {
        toast.success('Application submitted successfully!');
        fetchJobs();
      }
    } catch (error: any) {
      console.error('Error applying for job:', error);
      toast.error('Failed to submit application');
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesType = filterType === 'all' || job.type === filterType;
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || job.company.toLowerCase().includes(searchQuery.toLowerCase()) || job.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getJobTypeColor = (type: string) => {
    const colors = { 'full-time': 'bg-green-100 text-green-700', 'part-time': 'bg-blue-100 text-blue-700', 'contract': 'bg-purple-100 text-purple-700', 'internship': 'bg-orange-100 text-orange-700' };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  if (!profile?.verified) {
    return (<div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center"><div className="text-center"><AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" /><h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2><p className="text-gray-600">Only verified users can view jobs</p></div></div>);
  }

  if (loading) {
    return (<div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center"><Loader className="w-16 h-16 text-orange-500 animate-spin" /></div>);
  }

  return (<div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-12 px-4 sm:px-6 lg:px-8"><div className="max-w-7xl mx-auto"><motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12"><div className="flex items-center justify-center mb-4"><Briefcase className="w-12 h-12 text-orange-500 mr-3" /><h1 className="text-4xl font-bold text-gray-900">Job Opportunities</h1></div><p className="text-lg text-gray-600">Discover career opportunities shared by our alumni network</p><div className="mt-6 flex items-center justify-center"><span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium">{filteredJobs.length} {filteredJobs.length === 1 ? 'Job' : 'Jobs'} Available</span></div></motion.div><motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8 bg-white rounded-2xl shadow-lg p-6"><div className="flex flex-col md:flex-row gap-4"><div className="flex-1 relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" /><input type="text" placeholder="Search jobs, companies, or locations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" /></div><div className="relative"><Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" /><select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white"><option value="all">All Types</option><option value="full-time">Full Time</option><option value="part-time">Part Time</option><option value="contract">Contract</option><option value="internship">Internship</option></select></div><motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowAddModal(true)} className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-md"><Plus className="w-5 h-5 mr-2" />Post Job</motion.button></div></motion.div><div className="space-y-6"><AnimatePresence>{filteredJobs.length === 0 ? (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-12 bg-white rounded-2xl shadow-lg"><Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" /><p className="text-gray-500 text-lg">No jobs found</p><p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p></motion.div>) : (filteredJobs.map((job, index) => (<motion.div key={job.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ delay: index * 0.05 }} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"><div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4"><div className="flex-1"><div className="flex items-start justify-between mb-3"><div><h3 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h3><div className="flex items-center text-gray-600 mb-2"><Building className="w-5 h-5 mr-2" /><span className="font-medium text-lg">{job.company}</span></div></div><span className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${getJobTypeColor(job.type)}`}>{job.type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span></div><p className="text-gray-700 mb-4 leading-relaxed">{job.description}</p><div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4"><div className="flex items-center text-gray-600"><MapPin className="w-5 h-5 mr-2 text-orange-500" /><span>{job.location}</span></div>{job.salary_range && (<div className="flex items-center text-gray-600"><DollarSign className="w-5 h-5 mr-2 text-green-500" /><span>{job.salary_range}</span></div>)}<div className="flex items-center text-gray-600"><Clock className="w-5 h-5 mr-2 text-blue-500" /><span>{new Date(job.posted_date).toLocaleDateString()}</span></div></div>{job.requirements && job.requirements.length > 0 && (<div className="mb-4"><h4 className="font-semibold text-gray-900 mb-2 flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-500" />Requirements:</h4><ul className="list-disc list-inside text-gray-700 space-y-1 ml-6">{job.requirements.map((req, idx) => (<li key={idx}>{req}</li>))}</ul></div>)}<div className="flex items-center text-sm text-gray-500 mt-4"><Calendar className="w-4 h-4 mr-2" />Posted by <span className="font-medium ml-1">{job.posted_by_name}</span></div></div></div><div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">{job.has_applied ? (<div className="flex items-center px-6 py-3 bg-green-100 text-green-700 rounded-lg font-medium"><CheckCircle className="w-5 h-5 mr-2" />Already Applied</div>) : (<motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleApply(job.id, job.application_link)} className="flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-md"><ExternalLink className="w-5 h-5 mr-2" />Apply Now</motion.button>)}</div></motion.div>)))}</AnimatePresence></div></div><AnimatePresence>{showAddModal && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => !submitting && setShowAddModal(false)}><motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"><div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between"><h2 className="text-2xl font-bold text-gray-900">Post a Job</h2><button onClick={() => !submitting && setShowAddModal(false)} disabled={submitting} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button></div><form onSubmit={handleSubmit} className="p-6 space-y-4"><div><label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label><input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" placeholder="e.g. Senior Software Engineer" /></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Company *</label><input type="text" required value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" placeholder="e.g. Tech Corp" /></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-2">Location *</label><input type="text" required value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" placeholder="e.g. Bangalore, India" /></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Job Type *</label><select required value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as any })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"><option value="full-time">Full Time</option><option value="part-time">Part Time</option><option value="contract">Contract</option><option value="internship">Internship</option></select></div></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Salary Range (Optional)</label><input type="text" value={formData.salary_range} onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" placeholder="e.g. ₹15-25 LPA" /></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Description *</label><textarea required rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" placeholder="Describe the role and responsibilities..." /></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Requirements (one per line)</label><textarea rows={4} value={formData.requirements} onChange={(e) => setFormData({ ...formData, requirements: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" placeholder="3+ years experience&#10;Bachelor's degree in CS&#10;Strong communication skills" /></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Application Link (Optional)</label><input type="url" value={formData.application_link} onChange={(e) => setFormData({ ...formData, application_link: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" placeholder="https://company.com/careers/apply" /></div><div className="flex gap-3 pt-4"><button type="button" onClick={() => setShowAddModal(false)} disabled={submitting} className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">Cancel</button><button type="submit" disabled={submitting} className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-md disabled:opacity-50 flex items-center justify-center">{submitting ? (<><Loader className="w-5 h-5 mr-2 animate-spin" />Posting...</>) : ('Post Job')}</button></div></form></motion.div></motion.div>)}</AnimatePresence></div>);
}
