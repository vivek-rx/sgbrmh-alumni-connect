import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, Loader2, AlertCircle, ArrowLeft, GraduationCap, MapPin, User, UserPlus, Mail, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface AlumniData {
  id: string;
  name: string;
  email: string;
  batch_year: number;
  profile_photo_url?: string | null;
  phone?: string | null;
  gender?: string | null;
  current_city?: string | null;
  current_country?: string | null;
  bio?: string | null;
  verified?: boolean;
  profile_completed?: boolean;
  role?: string;
  created_at?: string;
}

interface BatchStats {
  year: number;
  count: number;
  verified_count: number;
}

export default function AlumniDirectory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatch, setSelectedBatch] = useState<number | null>(null);
  const [alumni, setAlumni] = useState<AlumniData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const isLoggedIn = !!user;
  const isVerified = profile?.verified || false;

  useEffect(() => {
    fetchAlumni();
  }, []);

  const fetchAlumni = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('alumni')
        .select('*')
        .neq('role', 'admin')
        .order('batch_year', { ascending: false });

      if (fetchError) throw fetchError;
      setAlumni(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load alumni');
      toast.error('Failed to load Yearbook');
    } finally {
      setLoading(false);
    }
  };

  // Get batch statistics
  const batchStats: BatchStats[] = alumni.reduce((acc, alum) => {
    const existing = acc.find(b => b.year === alum.batch_year);
    if (existing) {
      existing.count++;
      if (alum.verified) existing.verified_count++;
    } else {
      acc.push({
        year: alum.batch_year,
        count: 1,
        verified_count: alum.verified ? 1 : 0
      });
    }
    return acc;
  }, [] as BatchStats[]).sort((a, b) => b.year - a.year);

  // Filter alumni by selected batch and search
  const filteredAlumni = alumni.filter(alum => {
    if (selectedBatch && alum.batch_year !== selectedBatch) return false;
    
    if (searchTerm) {
      const matchesSearch = alum.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           alum.current_city?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    }
    
    return true;
  });

  const handleInviteBatchmate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteEmail.trim() || !inviteName.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setSendingInvite(true);
    try {
      // Check if email already exists
      const { data: existingUser } = await supabase
        .from('alumni')
        .select('email')
        .eq('email', inviteEmail.toLowerCase())
        .single();

      if (existingUser) {
        toast.error('This email is already registered');
        setSendingInvite(false);
        return;
      }

      // Generate unique invitation token
      const invitationToken = crypto.randomUUID();
      
      // Create invitation record
      const { data: invitationData, error: inviteError } = await supabase
        .from('alumni_invitations')
        .insert({
          invited_by: user?.id,
          invited_email: inviteEmail.toLowerCase(),
          invited_name: inviteName.trim(),
          batch_year: selectedBatch || profile?.batch_year,
          status: 'pending',
          invitation_token: invitationToken,
          invited_at: new Date().toISOString()
        })
        .select()
        .single();

      if (inviteError) {
        if (inviteError.code === '23505') {
          toast.error('An invitation has already been sent to this email');
        } else {
          throw inviteError;
        }
        setSendingInvite(false);
        return;
      }

      // Create invitation link
      const inviteLink = `${window.location.origin}/auth/register?invite=${invitationToken}`;
      
      // Send invitation email using Supabase
      try {
        // Call Supabase Edge Function to send email
        const { error: emailError } = await supabase.functions.invoke('send-invitation-email', {
          body: {
            to: inviteEmail.toLowerCase(),
            invitedName: inviteName.trim(),
            inviterName: profile?.name || 'An alumni',
            batchYear: selectedBatch || profile?.batch_year,
            inviteLink: inviteLink
          }
        });

        if (emailError) {
          console.error('Email sending error:', emailError);
          // Don't fail the invitation if email fails
          toast.success(`Invitation created! Share this link with ${inviteName}: ${inviteLink}`, {
            duration: 10000
          });
        } else {
          toast.success(`Invitation email sent to ${inviteName}!`);
        }
      } catch (emailError) {
        console.error('Email error:', emailError);
        // Fallback: show the link to copy manually
        toast.success(`Invitation created! Share this link: ${inviteLink}`, {
          duration: 10000
        });
      }
      
      setInviteEmail('');
      setInviteName('');
      setShowInviteModal(false);
    } catch (error: any) {
      toast.error('Failed to send invitation');
    } finally {
      setSendingInvite(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.6
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading Year Book...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Error loading alumni</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={fetchAlumni}
            className="px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Hero Header */}
      <motion.section 
        className="relative py-16 bg-gradient-to-r from-orange-600 via-red-700 to-orange-800 overflow-hidden"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            <defs>
              <pattern id="alumni-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="2" fill="white" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#alumni-grid)" />
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            className="text-5xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Year Book
          </motion.h1>
          <motion.p 
            className="text-xl text-orange-100 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {selectedBatch ? `Batch of ${selectedBatch}` : 'Explore by batch year'}
          </motion.p>
          
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {selectedBatch && (
              <motion.button
                onClick={() => setSelectedBatch(null)}
                className="inline-flex items-center px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Batches
              </motion.button>
            )}
            
            {isVerified && (
              <motion.button
                onClick={() => setShowInviteModal(true)}
                className="inline-flex items-center px-6 py-3 bg-white text-orange-600 rounded-full font-semibold hover:bg-orange-50 transition-colors shadow-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Invite Batchmate
              </motion.button>
            )}
          </div>
        </div>
      </motion.section>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowInviteModal(false)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Invite Batchmate</h2>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleInviteBatchmate} className="space-y-4">
                <div>
                  <label htmlFor="inviteName" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="inviteName"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter their name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="inviteEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      id="inviteEmail"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="their.email@example.com"
                      required
                    />
                  </div>
                </div>

                {selectedBatch && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <p className="text-sm text-orange-800">
                      <strong>Batch:</strong> {selectedBatch}
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendingInvite}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendingInvite ? 'Sending...' : 'Send Invitation'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!selectedBatch ? (
          /* Batch Cards View */
          <div>
            <motion.div 
              className="mb-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Select a Batch</h2>
              <p className="text-gray-600">Click on a batch to view alumni profiles</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {batchStats.map((batch, index) => (
                <motion.div
                  key={batch.year}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedBatch(batch.year)}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer p-6 border-2 border-transparent hover:border-orange-500"
                >
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-full p-4">
                      <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">
                    Batch of {batch.year}
                  </h3>
                  <div className="flex justify-center items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      <span>{batch.count} Alumni</span>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      {batch.verified_count} Verified
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          /* Alumni Profiles View */
          <div>
            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or location..."
                  className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <p className="text-center mt-4 text-gray-600">
                Showing {filteredAlumni.length} alumni from Batch of {selectedBatch}
              </p>
            </div>

            {/* Alumni Cards */}
            {filteredAlumni.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAlumni.map((alum, index) => (
                  <motion.div
                    key={alum.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => {
                      console.log('🔍 Card clicked:', { alumId: alum.id, isVerified, isLoggedIn });
                      if (isVerified) {
                        console.log('✅ Navigating to profile:', `/profile/${alum.id}`);
                        navigate(`/profile/${alum.id}`);
                      } else if (!isLoggedIn) {
                        toast.error('Please login to view full profiles');
                        navigate('/auth/login');
                      } else {
                        toast.error('Only verified users can view full profiles');
                      }
                    }}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="h-16 w-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                          {alum.profile_photo_url ? (
                            <img
                              src={alum.profile_photo_url}
                              alt={alum.name}
                              className="h-16 w-16 rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-8 h-8" />
                          )}
                        </div>
                        <div className="ml-4 flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 truncate">{alum.name}</h3>
                          <p className="text-sm text-gray-600">Batch of {alum.batch_year}</p>
                          {alum.verified && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                              Verified
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {(isLoggedIn && isVerified) ? (
                        <>
                          {alum.current_city && (
                            <div className="flex items-center text-sm text-gray-600 mb-2">
                              <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                              <span className="truncate">{alum.current_city}{alum.current_country ? `, ${alum.current_country}` : ''}</span>
                            </div>
                          )}
                          {alum.bio && (
                            <p className="text-sm text-gray-600 line-clamp-2 mt-3">{alum.bio}</p>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-2">
                          <p className="text-sm text-gray-500 italic">
                            {isLoggedIn ? 'Verification required to view details' : 'Login to view full profile'}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No alumni found</h3>
                <p className="text-gray-500">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}