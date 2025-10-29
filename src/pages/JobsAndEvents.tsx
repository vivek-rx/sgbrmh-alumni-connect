import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Calendar,
  MapPin,
  Clock,
  Users,
  Building,
  DollarSign,
  Plus,
  Filter,
  Search,
  ExternalLink,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  Lock,
  CheckCircle,
  X
} from 'lucide-react';
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
  posted_by_name: string;
  posted_date: string;
  application_link: string | null;
  is_active: boolean;
}

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  location: string;
  event_type: 'meetup' | 'workshop' | 'webinar' | 'conference' | 'social' | 'other';
  max_attendees: number | null;
  current_attendees: number;
  organized_by: string;
  organized_by_name: string;
  image_url: string | null;
  registration_link: string | null;
  is_active: boolean;
}

export default function JobsAndEvents() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'jobs' | 'events'>('jobs');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  // Check if user is verified
  const isVerified = profile?.verified || false;

  useEffect(() => {
    fetchJobsAndEvents();
  }, []);

  const fetchJobsAndEvents = async () => {
    try {
      setLoading(true);

      // Fetch jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select(`
          *,
          posted_by_name:alumni!jobs_posted_by_fkey(name)
        `)
        .eq('is_active', true)
        .order('posted_date', { ascending: false });

      if (jobsError) {
        console.error('Error fetching jobs:', jobsError);
      } else {
        const formattedJobs = jobsData?.map((job: any) => ({
          ...job,
          posted_by_name: job.posted_by_name?.name || 'Anonymous'
        })) || [];
        setJobs(formattedJobs);
      }

      // Fetch events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select(`
          *,
          organized_by_name:alumni!events_organized_by_fkey(name)
        `)
        .eq('is_active', true)
        .order('event_date', { ascending: true });

      if (eventsError) {
        console.error('Error fetching events:', eventsError);
      } else {
        const formattedEvents = eventsData?.map((event: any) => ({
          ...event,
          organized_by_name: event.organized_by_name?.name || 'Anonymous'
        })) || [];
        setEvents(formattedEvents);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Filter jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || job.type === filterType;
    return matchesSearch && matchesFilter;
  });

  // Filter events
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || event.event_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (!isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Verification Required</h2>
          <p className="text-gray-600 mb-6">
            You need to be a verified member to access jobs and events. Please wait for admin
            verification or contact support.
          </p>
          <button
            onClick={() => navigate('/alumni')}
            className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            Back to Directory
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Jobs & Events
          </h1>
          <p className="text-lg text-gray-600">
            Explore opportunities and connect with the alumni community
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-8 max-w-md mx-auto">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`flex items-center justify-center py-3 rounded-lg font-medium transition-all ${
                activeTab === 'jobs'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Briefcase className="w-5 h-5 mr-2" />
              Jobs ({jobs.length})
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`flex items-center justify-center py-3 rounded-lg font-medium transition-all ${
                activeTab === 'events'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Calendar className="w-5 h-5 mr-2" />
              Events ({events.length})
            </button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-12 pr-8 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white cursor-pointer min-w-[200px]"
              >
                <option value="all">All Types</option>
                {activeTab === 'jobs' ? (
                  <>
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </>
                ) : (
                  <>
                    <option value="meetup">Meetup</option>
                    <option value="workshop">Workshop</option>
                    <option value="webinar">Webinar</option>
                    <option value="conference">Conference</option>
                    <option value="social">Social</option>
                    <option value="other">Other</option>
                  </>
                )}
              </select>
            </div>

            {/* Add Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-md font-medium"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add {activeTab === 'jobs' ? 'Job' : 'Event'}
            </motion.button>
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'jobs' ? (
              <motion.div
                key="jobs"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {filteredJobs.length === 0 ? (
                  <div className="text-center py-20">
                    <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
                    <p className="text-gray-600">
                      {searchQuery || filterType !== 'all'
                        ? 'Try adjusting your search or filters'
                        : 'Be the first to post a job opportunity!'}
                    </p>
                  </div>
                ) : (
                  filteredJobs.map((job, index) => (
                    <JobCard key={job.id} job={job} index={index} />
                  ))
                )}
              </motion.div>
            ) : (
              <motion.div
                key="events"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredEvents.length === 0 ? (
                  <div className="col-span-full text-center py-20">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
                    <p className="text-gray-600">
                      {searchQuery || filterType !== 'all'
                        ? 'Try adjusting your search or filters'
                        : 'Be the first to organize an event!'}
                    </p>
                  </div>
                ) : (
                  filteredEvents.map((event, index) => (
                    <EventCard key={event.id} event={event} index={index} />
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Add Modal - Placeholder */}
      {showAddModal && (
        <AddModal
          type={activeTab}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchJobsAndEvents();
          }}
          userId={user?.id || ''}
        />
      )}
    </div>
  );
}

// Job Card Component
function JobCard({ job, index }: { job: Job; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
            <div className="flex items-center text-gray-600 mb-2">
              <Building className="w-4 h-4 mr-2" />
              <span className="font-medium">{job.company}</span>
            </div>
          </div>
          <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium capitalize">
            {job.type.replace('-', ' ')}
          </span>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="text-sm">{job.location}</span>
          </div>
          {job.salary_range && (
            <div className="flex items-center text-gray-600">
              <DollarSign className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="text-sm">{job.salary_range}</span>
            </div>
          )}
          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="text-sm">Posted {formatDate(job.posted_date)}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>

        {/* Requirements */}
        {job.requirements && job.requirements.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-900 mb-2">Requirements:</p>
            <ul className="list-disc list-inside space-y-1">
              {job.requirements.slice(0, 3).map((req, idx) => (
                <li key={idx} className="text-sm text-gray-600">
                  {req}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center text-sm text-gray-500">
            <UserCheck className="w-4 h-4 mr-1" />
            <span>Posted by {job.posted_by_name}</span>
          </div>
          {job.application_link && (
            <a
              href={job.application_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all text-sm font-medium"
            >
              Apply Now
              <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Event Card Component
function EventCard({ event, index }: { event: Event; index: number }) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
    >
      {/* Image */}
      <div className="h-48 bg-gradient-to-br from-orange-400 to-red-400 relative overflow-hidden">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Calendar className="w-16 h-16 text-white opacity-50" />
          </div>
        )}
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium capitalize text-gray-900">
            {event.event_type}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-3">{event.title}</h3>

        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="text-sm">{formatDate(event.event_date)}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="text-sm">{event.event_time}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="text-sm">{event.location}</span>
          </div>
          {event.max_attendees && (
            <div className="flex items-center text-gray-600">
              <Users className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="text-sm">
                {event.current_attendees} / {event.max_attendees} attendees
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-700 mb-4 line-clamp-2">{event.description}</p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-sm text-gray-500">
            By {event.organized_by_name}
          </div>
          {event.registration_link && (
            <a
              href={event.registration_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all text-sm font-medium"
            >
              Register
              <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Add Modal Component (Placeholder)
function AddModal({
  type,
  onClose,
  onSuccess,
  userId
}: {
  type: 'jobs' | 'events';
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
}) {
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tableName = type === 'jobs' ? 'jobs' : 'events';
      const data = {
        ...formData,
        [type === 'jobs' ? 'posted_by' : 'organized_by']: userId,
        is_active: true,
        [type === 'jobs' ? 'posted_date' : 'created_at']: new Date().toISOString()
      };

      const { error } = await supabase.from(tableName).insert([data]);

      if (error) throw error;

      toast.success(`${type === 'jobs' ? 'Job' : 'Event'} added successfully!`);
      onSuccess();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to add. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">
            Add {type === 'jobs' ? 'Job Opportunity' : 'Event'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="text-center py-8 text-gray-500">
            <p>Form fields will be implemented based on your database schema.</p>
            <p className="mt-2 text-sm">Please add the jobs and events tables to your database first.</p>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all font-medium disabled:opacity-50"
            >
              {loading ? 'Adding...' : `Add ${type === 'jobs' ? 'Job' : 'Event'}`}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
