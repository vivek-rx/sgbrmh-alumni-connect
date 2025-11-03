import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Briefcase,
  Calendar,
  TrendingUp,
  Shield,
  X,
  Check,
  Trash2,
  Edit,
  Search,
  Filter,
  UserCheck,
  UserX,
  BarChart3,
  Activity,
  AlertCircle,
  Plus,
  Mail,
  Copy,
  Send,
} from 'lucide-react';

interface AlumniUser {
  id: string;
  email: string;
  full_name: string;
  batch: string;
  branch: string;
  phone: string;
  verified: boolean;
  role: string;
  created_at: string;
}

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  posted_date: string;
  is_active: boolean;
  posted_by: string;
  alumni: { full_name: string };
}

interface Event {
  id: string;
  title: string;
  event_date: string;
  location: string;
  event_type: string;
  max_attendees: number;
  current_attendees: number;
  is_active: boolean;
  organized_by: string;
  alumni: { full_name: string };
}

interface Stats {
  totalUsers: number;
  verifiedUsers: number;
  totalJobs: number;
  totalEvents: number;
  recentSignups: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    verifiedUsers: 0,
    totalJobs: 0,
    totalEvents: 0,
    recentSignups: 0,
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'jobs' | 'events' | 'invitations'>('overview');
  
  // Users management
  const [users, setUsers] = useState<AlumniUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AlumniUser[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userFilterVerified, setUserFilterVerified] = useState<'all' | 'verified' | 'unverified'>('all');

  // Jobs management
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [jobSearchQuery, setJobSearchQuery] = useState('');

  // Events management
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [eventSearchQuery, setEventSearchQuery] = useState('');

  // Invitations management
  const [invitations, setInvitations] = useState<any[]>([]);
  const [filteredInvitations, setFilteredInvitations] = useState<any[]>([]);
  const [invitationSearchQuery, setInvitationSearchQuery] = useState('');

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, userSearchQuery, userFilterVerified]);

  useEffect(() => {
    filterJobs();
  }, [jobs, jobSearchQuery]);

  useEffect(() => {
    filterEvents();
  }, [events, eventSearchQuery]);

  useEffect(() => {
    filterInvitations();
  }, [invitations, invitationSearchQuery]);

  const checkAdminAndLoadData = async () => {
    try {
      console.log('🔍 Checking admin access...');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('❌ No user found, redirecting to login');
        navigate('/login');
        return;
      }

      console.log('👤 User found:', { id: user.id, email: user.email });

      const { data: userData, error } = await supabase
        .from('alumni')
        .select('*')
        .eq('id', user.id)
        .single();

      console.log('📋 User data from alumni table:', userData);
      console.log('🔑 User role:', userData?.role);

      if (error || !userData || userData.role !== 'admin') {
        console.error('❌ Access denied. User role:', userData?.role);
        alert('Access denied. Admin privileges required.');
        navigate('/');
        return;
      }

      console.log('✅ Admin access confirmed!');
      setCurrentUser(userData);
      await loadDashboardData();
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      // Load statistics
      const { count: totalUsers } = await supabase
        .from('alumni')
        .select('*', { count: 'exact', head: true });

      const { count: verifiedUsers } = await supabase
        .from('alumni')
        .select('*', { count: 'exact', head: true })
        .eq('verified', true);

      const { count: totalJobs } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true });

      const { count: totalEvents } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true });

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: recentSignups } = await supabase
        .from('alumni')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      setStats({
        totalUsers: totalUsers || 0,
        verifiedUsers: verifiedUsers || 0,
        totalJobs: totalJobs || 0,
        totalEvents: totalEvents || 0,
        recentSignups: recentSignups || 0,
      });

      // Load users
      const { data: usersData } = await supabase
        .from('alumni')
        .select('*')
        .order('created_at', { ascending: false });
      setUsers(usersData || []);

      // Load jobs - Admin should see ALL jobs (active and inactive)
      console.log('📊 Loading jobs for admin...');
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*, alumni(full_name)')
        .order('posted_date', { ascending: false });
      
      if (jobsError) {
        console.error('❌ Error loading jobs:', jobsError);
      } else {
        console.log(`✅ Loaded ${jobsData?.length || 0} jobs`);
        console.log('Jobs breakdown:', {
          total: jobsData?.length || 0,
          active: jobsData?.filter((j: any) => j.is_active).length || 0,
          inactive: jobsData?.filter((j: any) => !j.is_active).length || 0
        });
      }
      setJobs(jobsData || []);

      // Load events - Admin should see ALL events (active and inactive)
      console.log('📊 Loading events for admin...');
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*, alumni(full_name)')
        .order('event_date', { ascending: false });
      
      if (eventsError) {
        console.error('❌ Error loading events:', eventsError);
      } else {
        console.log(`✅ Loaded ${eventsData?.length || 0} events`);
        console.log('Events breakdown:', {
          total: eventsData?.length || 0,
          active: eventsData?.filter((e: any) => e.is_active).length || 0,
          inactive: eventsData?.filter((e: any) => !e.is_active).length || 0
        });
      }
      setEvents(eventsData || []);

      // Load invitations
      console.log('📊 Loading invitations...');
      const { data: invitationsData, error: invitationsError } = await supabase
        .from('alumni_invitations')
        .select(`
          *,
          inviter:invited_by (
            name,
            email,
            batch_year
          )
        `)
        .order('invited_at', { ascending: false });
      
      if (invitationsError) {
        console.error('❌ Error loading invitations:', invitationsError);
      } else {
        console.log(`✅ Loaded ${invitationsData?.length || 0} invitations`);
      }
      setInvitations(invitationsData || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (userSearchQuery) {
      filtered = filtered.filter(user =>
        user.full_name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        user.batch.includes(userSearchQuery) ||
        user.branch.toLowerCase().includes(userSearchQuery.toLowerCase())
      );
    }

    if (userFilterVerified === 'verified') {
      filtered = filtered.filter(user => user.verified);
    } else if (userFilterVerified === 'unverified') {
      filtered = filtered.filter(user => !user.verified);
    }

    setFilteredUsers(filtered);
  };

  const filterJobs = () => {
    let filtered = jobs;

    if (jobSearchQuery) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(jobSearchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(jobSearchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(jobSearchQuery.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
  };

  const filterEvents = () => {
    let filtered = events;

    if (eventSearchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(eventSearchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(eventSearchQuery.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  };

  const filterInvitations = () => {
    let filtered = invitations;

    if (invitationSearchQuery) {
      filtered = filtered.filter(invitation =>
        invitation.invited_email.toLowerCase().includes(invitationSearchQuery.toLowerCase()) ||
        invitation.invited_name.toLowerCase().includes(invitationSearchQuery.toLowerCase()) ||
        invitation.inviter?.name?.toLowerCase().includes(invitationSearchQuery.toLowerCase())
      );
    }

    setFilteredInvitations(filtered);
  };

  const handleVerifyUser = async (userId: string, currentlyVerified: boolean) => {
    try {
      const { error } = await supabase
        .from('alumni')
        .update({ verified: !currentlyVerified })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(user =>
        user.id === userId ? { ...user, verified: !currentlyVerified } : user
      ));

      alert(`User ${!currentlyVerified ? 'verified' : 'unverified'} successfully!`);
    } catch (error: any) {
      alert('Error updating user: ' + error.message);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('alumni')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.filter(user => user.id !== userId));
      alert('User deleted successfully!');
    } catch (error: any) {
      alert('Error deleting user: ' + error.message);
    }
  };

  const handleToggleJobStatus = async (jobId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ is_active: !currentStatus })
        .eq('id', jobId);

      if (error) throw error;

      setJobs(jobs.map(job =>
        job.id === jobId ? { ...job, is_active: !currentStatus } : job
      ));

      alert(`Job ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
    } catch (error: any) {
      alert('Error updating job: ' + error.message);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job posting?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;

      setJobs(jobs.filter(job => job.id !== jobId));
      alert('Job deleted successfully!');
    } catch (error: any) {
      alert('Error deleting job: ' + error.message);
    }
  };

  const handleToggleEventStatus = async (eventId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ is_active: !currentStatus })
        .eq('id', eventId);

      if (error) throw error;

      setEvents(events.map(event =>
        event.id === eventId ? { ...event, is_active: !currentStatus } : event
      ));

      alert(`Event ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
    } catch (error: any) {
      alert('Error updating event: ' + error.message);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      setEvents(events.filter(event => event.id !== eventId));
      alert('Event deleted successfully!');
    } catch (error: any) {
      alert('Error deleting event: ' + error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-700">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">ABMECT Pune Alumni Connect</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800">{currentUser?.full_name}</p>
                <p className="text-xs text-indigo-600">Administrator</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'jobs', label: 'Jobs', icon: Briefcase },
              { id: 'events', label: 'Events', icon: Calendar },
              { id: 'invitations', label: 'Invitations', icon: Mail },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-4 border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-semibold">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Platform Overview</h2>
            
            {/* Stats Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-10 h-10 text-blue-600" />
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800">{stats.totalUsers}</h3>
                <p className="text-sm text-gray-600">Total Users</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <UserCheck className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800">{stats.verifiedUsers}</h3>
                <p className="text-sm text-gray-600">Verified Users</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <Briefcase className="w-10 h-10 text-purple-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800">{stats.totalJobs}</h3>
                <p className="text-sm text-gray-600">Total Jobs</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <Calendar className="w-10 h-10 text-indigo-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800">{stats.totalEvents}</h3>
                <p className="text-sm text-gray-600">Total Events</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <Activity className="w-10 h-10 text-orange-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800">{stats.recentSignups}</h3>
                <p className="text-sm text-gray-600">Recent Signups (7d)</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
              <div className="grid md:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveTab('users')}
                  className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition text-left"
                >
                  <Users className="w-8 h-8 text-blue-600 mb-2" />
                  <p className="font-semibold text-gray-800">Manage Users</p>
                  <p className="text-xs text-gray-600">Verify, edit, or remove users</p>
                </button>

                <button
                  onClick={() => setActiveTab('jobs')}
                  className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition text-left"
                >
                  <Briefcase className="w-8 h-8 text-purple-600 mb-2" />
                  <p className="font-semibold text-gray-800">Manage Jobs</p>
                  <p className="text-xs text-gray-600">Review and moderate job postings</p>
                </button>

                <button
                  onClick={() => setActiveTab('events')}
                  className="p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition text-left"
                >
                  <Calendar className="w-8 h-8 text-indigo-600 mb-2" />
                  <p className="font-semibold text-gray-800">Manage Events</p>
                  <p className="text-xs text-gray-600">Create and manage events</p>
                </button>

                <button
                  onClick={() => navigate('/')}
                  className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition text-left"
                >
                  <Activity className="w-8 h-8 text-green-600 mb-2" />
                  <p className="font-semibold text-gray-800">View Platform</p>
                  <p className="text-xs text-gray-600">See the public interface</p>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-800">User Management</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={userFilterVerified}
                  onChange={(e) => setUserFilterVerified(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="all">All Users</option>
                  <option value="verified">Verified Only</option>
                  <option value="unverified">Unverified Only</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch/Branch</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm text-gray-900">Batch: {user.batch}</p>
                          <p className="text-sm text-gray-500">{user.branch}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.verified ? (
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Verified
                          </span>
                        ) : (
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Unverified
                          </span>
                        )}
                        {user.role === 'admin' && (
                          <span className="ml-2 px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                            Admin
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          {user.role !== 'admin' && (
                            <>
                              <button
                                onClick={() => handleVerifyUser(user.id, user.verified)}
                                className={`p-2 rounded-lg ${
                                  user.verified
                                    ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                                    : 'bg-green-100 text-green-600 hover:bg-green-200'
                                }`}
                                title={user.verified ? 'Unverify user' : 'Verify user'}
                              >
                                {user.verified ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                                title="Delete user"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-800">Job Management</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    value={jobSearchQuery}
                    onChange={(e) => setJobSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => navigate('/jobs')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Job</span>
                </button>
              </div>
            </div>

            <div className="grid gap-6">
              {filteredJobs.map((job) => (
                <div key={job.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">{job.title}</h3>
                        {job.is_active ? (
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                            Inactive
                          </span>
                        )}
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {job.type}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{job.company}  {job.location}</p>
                      <p className="text-sm text-gray-500">
                        Posted by: {job.alumni?.full_name}  {new Date(job.posted_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleJobStatus(job.id, job.is_active)}
                        className={`p-2 rounded-lg ${
                          job.is_active
                            ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-600 hover:bg-green-200'
                        }`}
                        title={job.is_active ? 'Deactivate job' : 'Activate job'}
                      >
                        {job.is_active ? <X className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                        title="Delete job"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-800">Event Management</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={eventSearchQuery}
                    onChange={(e) => setEventSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => navigate('/events')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Event</span>
                </button>
              </div>
            </div>

            <div className="grid gap-6">
              {filteredEvents.map((event) => (
                <div key={event.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">{event.title}</h3>
                        {event.is_active ? (
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                            Inactive
                          </span>
                        )}
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                          {event.event_type}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{event.location}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span> {new Date(event.event_date).toLocaleDateString()}</span>
                        <span> {event.current_attendees}/{event.max_attendees || ''}</span>
                        <span>Organized by: {event.alumni?.full_name}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleEventStatus(event.id, event.is_active)}
                        className={`p-2 rounded-lg ${
                          event.is_active
                            ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-600 hover:bg-green-200'
                        }`}
                        title={event.is_active ? 'Deactivate event' : 'Activate event'}
                      >
                        {event.is_active ? <X className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                        title="Delete event"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Invitations Tab */}
        {activeTab === 'invitations' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-800">Invitation Management</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search invitations..."
                    value={invitationSearchQuery}
                    onChange={(e) => setInvitationSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Invitations Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invited By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invited User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Batch Year
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Invited
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredInvitations.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          <Mail className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                          <p>No invitations found</p>
                        </td>
                      </tr>
                    ) : (
                      filteredInvitations.map((invitation) => (
                        <tr key={invitation.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {invitation.inviter?.name || 'Unknown'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {invitation.inviter?.email || '-'}
                              </div>
                              <div className="text-xs text-gray-400">
                                Batch: {invitation.inviter?.batch_year || '-'}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {invitation.invited_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {invitation.invited_email}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{invitation.batch_year}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                invitation.status === 'accepted'
                                  ? 'bg-green-100 text-green-800'
                                  : invitation.status === 'expired'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {invitation.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(invitation.invited_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => {
                                  const inviteLink = `${window.location.origin}/auth/register?invite=${invitation.invitation_token}`;
                                  navigator.clipboard.writeText(inviteLink);
                                  alert('Invitation link copied to clipboard!');
                                }}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                title="Copy invitation link"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              {invitation.status === 'pending' && (
                                <button
                                  onClick={async () => {
                                    const inviteLink = `${window.location.origin}/auth/register?invite=${invitation.invitation_token}`;
                                    try {
                                      await supabase.functions.invoke('send-invitation-email', {
                                        body: {
                                          to: invitation.invited_email,
                                          invitedName: invitation.invited_name,
                                          inviterName: invitation.inviter?.name || 'Alumni',
                                          batchYear: invitation.batch_year,
                                          inviteLink,
                                        },
                                      });
                                      alert('Invitation email resent successfully!');
                                    } catch (error) {
                                      alert('Failed to resend invitation. Please try again.');
                                    }
                                  }}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                  title="Resend invitation"
                                >
                                  <Send className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={async () => {
                                  if (window.confirm('Are you sure you want to delete this invitation?')) {
                                    const { error } = await supabase
                                      .from('alumni_invitations')
                                      .delete()
                                      .eq('id', invitation.id);

                                    if (error) {
                                      alert('Failed to delete invitation');
                                    } else {
                                      loadDashboardData();
                                    }
                                  }
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Delete invitation"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid md:grid-cols-3 gap-6 mt-6">
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Invitations</p>
                    <h3 className="text-3xl font-bold text-gray-800">{invitations.length}</h3>
                  </div>
                  <Mail className="w-10 h-10 text-indigo-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pending</p>
                    <h3 className="text-3xl font-bold text-yellow-600">
                      {invitations.filter((i) => i.status === 'pending').length}
                    </h3>
                  </div>
                  <AlertCircle className="w-10 h-10 text-yellow-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Accepted</p>
                    <h3 className="text-3xl font-bold text-green-600">
                      {invitations.filter((i) => i.status === 'accepted').length}
                    </h3>
                  </div>
                  <Check className="w-10 h-10 text-green-600" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
