import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, MapPin, Globe, Edit3, Save, X } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function Profile() {
  console.log('🔍 Profile Component: Starting render at', new Date().toISOString());
  
  // Manual environment variable check
  console.log('🔧 Manual Env Check:', {
    url: import.meta.env.VITE_SUPABASE_URL,
    hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    keyPreview: import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...',
    keyLength: import.meta.env.VITE_SUPABASE_ANON_KEY?.length || 0,
    mode: import.meta.env.MODE,
    dev: import.meta.env.DEV
  });
  
  const { user, profile, updateProfile, loading } = useAuth();
  console.log('🔍 Profile Component: Auth values:', {
    user: user ? { id: user.id, email: user.email } : null,
    profile: profile ? { id: profile.id, name: profile.name, email: profile.email, profile_completed: profile.profile_completed } : null,
    loading,
    hasUser: !!user,
    hasProfile: !!profile,
    authLoading: loading
  });
  
  const [isEditing, setIsEditing] = useState(false);
  console.log('🔍 Profile Component: Edit state:', isEditing);
  
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    batch_year: '',
    gender: '',
    marital_status: '',
    date_of_birth: '',
    age: '',
    bio: '',
    whatsapp_number: '',
    facebook_url: '',
    instagram_url: '',
    twitter_url: '',
    linkedin_url: '',
    snapchat_url: '',
    github_url: '',
    portfolio_url: '',
    current_city: '',
    current_country: ''
  });

  // Load profile data into form
  useEffect(() => {
    console.log('🔍 Profile useEffect: Running with profile:', profile ? 'Profile exists' : 'No profile');
    console.log('🔍 Profile useEffect: Profile details:', {
      hasProfile: !!profile,
      profileId: profile?.id,
      profileEmail: profile?.email,
      profileName: profile?.name,
      profileCompleted: profile?.profile_completed
    });
    
    if (profile) {
      console.log('🔍 Profile useEffect: Setting form data with profile data');
      console.log('🔍 Profile useEffect: Profile data being loaded:', {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        batch_year: profile.batch_year,
        gender: profile.gender,
        bio: profile.bio
      });
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        batch_year: profile.batch_year?.toString() || '',
        gender: profile.gender || '',
        marital_status: profile.marital_status || '',
        date_of_birth: profile.date_of_birth || '',
        age: profile.age?.toString() || '',
        bio: profile.bio || '',
        whatsapp_number: profile.whatsapp_number || '',
        facebook_url: profile.facebook_url || '',
        instagram_url: profile.instagram_url || '',
        twitter_url: profile.twitter_url || '',
        linkedin_url: profile.linkedin_url || '',
        snapchat_url: profile.snapchat_url || '',
        github_url: profile.github_url || '',
        portfolio_url: profile.portfolio_url || '',
        current_city: profile.current_city || '',
        current_country: profile.current_country || ''
      });
      console.log('🔍 Profile useEffect: Form data set successfully');
    } else if (user && !loading) {
      // Initialize form for new profile creation
      console.log('🔍 Profile useEffect: Initializing form for new profile creation');
      setFormData({
        name: user?.user_metadata?.name || user?.email?.split('@')[0] || '',
        phone: '',
        batch_year: '',
        gender: '',
        marital_status: '',
        date_of_birth: '',
        age: '',
        bio: '',
        whatsapp_number: '',
        facebook_url: '',
        instagram_url: '',
        twitter_url: '',
        linkedin_url: '',
        snapchat_url: '',
        github_url: '',
        portfolio_url: '',
        current_city: '',
        current_country: ''
      });
    } else {
      console.log('🔍 Profile useEffect: No profile data available yet or still loading');
    }
  }, [profile, user, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔍 Profile handleSubmit: Form submission triggered at', new Date().toISOString());
    console.log('🔍 Profile handleSubmit: Current form data:', formData);
    console.log('🔍 Profile handleSubmit: Current profile:', profile ? { id: profile.id, email: profile.email } : 'No profile - will create new');
    console.log('🔍 Profile handleSubmit: User:', user ? { id: user.id, email: user.email } : 'No user');
    
    // Validate required fields
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    
    if (!formData.batch_year.trim()) {
      toast.error('Batch year is required');
      return;
    }
    
    try {
      // Prepare update data, converting strings to appropriate types
      const updateData = {
        name: formData.name.trim(),
        phone: formData.phone?.trim() || null,
        batch_year: formData.batch_year ? parseInt(formData.batch_year) : new Date().getFullYear(),
        gender: formData.gender ? formData.gender as 'male' | 'female' | 'other' | 'prefer_not_to_say' : null,
        marital_status: formData.marital_status ? formData.marital_status as 'single' | 'married' | 'divorced' | 'widowed' | 'separated' | 'prefer_not_to_say' : null,
        date_of_birth: formData.date_of_birth || null,
        age: formData.age ? parseInt(formData.age) : null,
        bio: formData.bio?.trim() || null,
        whatsapp_number: formData.whatsapp_number?.trim() || null,
        facebook_url: formData.facebook_url?.trim() || null,
        instagram_url: formData.instagram_url?.trim() || null,
        twitter_url: formData.twitter_url?.trim() || null,
        linkedin_url: formData.linkedin_url?.trim() || null,
        snapchat_url: formData.snapchat_url?.trim() || null,
        github_url: formData.github_url?.trim() || null,
        portfolio_url: formData.portfolio_url?.trim() || null,
        current_city: formData.current_city?.trim() || null,
        current_country: formData.current_country?.trim() || null,
        profile_completed: true // Mark profile as completed after saving
      };
      
      console.log('🔍 Profile handleSubmit: Prepared update data:', updateData);

      await updateProfile(updateData);
      
      if (profile) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        console.log('✅ Profile handleSubmit: Profile update completed successfully');
      } else {
        toast.success('Profile created successfully! Welcome to the alumni network!');
        console.log('✅ Profile handleSubmit: Profile creation completed successfully');
      }
    } catch (error: any) {
      console.error('❌ Profile handleSubmit: Save failed:', error);
      console.error('❌ Profile handleSubmit: Error details:', {
        message: error.message,
        code: error.code,
        details: error.details
      });
      toast.error(error.message || 'Failed to save profile. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    console.log('🔍 Profile Component: Rendering loading state');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  console.log('🔍 Profile Component: Render decision logic:', {
    hasUser: !!user,
    hasProfile: !!profile,
    loading,
    timestamp: new Date().toISOString()
  });

  if (loading) {
    console.log('🔍 Profile Component: Auth still loading - showing loading state');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
          <p className="text-sm text-gray-500 mt-2">Debug: Auth loading state</p>
        </div>
      </div>
    );
  }

  if (!user) {
    window.location.href = '/auth/login';
    return null;
  }

  if (!profile) {
    console.log('🔍 Profile Component: User exists but no profile - allowing profile creation');

    // Add a debug button to test database connection
    const testDatabaseConnection = async () => {
      console.log('🧪 Testing database connection...');
      setDebugInfo(prev => [...prev, '🧪 Starting comprehensive database test...']);
      
      // First, check environment variables
      console.log('🧪 Environment Check:', {
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
        anonKeyLength: import.meta.env.VITE_SUPABASE_ANON_KEY?.length || 0
      });
      setDebugInfo(prev => [...prev, `Environment: URL=${import.meta.env.VITE_SUPABASE_URL}, Key Length=${import.meta.env.VITE_SUPABASE_ANON_KEY?.length || 0}`]);

      // Check if supabase client is initialized
      console.log('🧪 Supabase Client:', {
        hasSupabase: !!supabase,
        supabaseType: typeof supabase
      });

      try {
        // Pre-flight check: Test basic Supabase connectivity
        console.log('🧪 Pre-flight: Testing basic Supabase connectivity...');
        setDebugInfo(prev => [...prev, '🧪 Testing basic Supabase connectivity...']);
        const healthCheck = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/`, {
          method: 'HEAD',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          }
        });
        
        console.log('🧪 Pre-flight result:', {
          status: healthCheck.status,
          statusText: healthCheck.statusText,
          ok: healthCheck.ok
        });
        setDebugInfo(prev => [...prev, `✅ Connectivity: ${healthCheck.status} ${healthCheck.statusText}`]);

        if (!healthCheck.ok) {
          throw new Error(`Supabase connectivity check failed: ${healthCheck.status} ${healthCheck.statusText}`);
        }

        // Test current user authentication
        console.log('🧪 Testing current user authentication...');
        setDebugInfo(prev => [...prev, '🧪 Checking user authentication...']);
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.error('🧪 User auth error:', userError);
          setDebugInfo(prev => [...prev, `❌ Auth Error: ${userError.message}`]);
        } else {
          console.log('🧪 Current user:', { email: user?.email, id: user?.id });
          setDebugInfo(prev => [...prev, `✅ User: ${user?.email || 'No user'} (ID: ${user?.id || 'No ID'})`]);
        }

        // Test alumni table access with specific schema validation
        console.log('🧪 Testing alumni table with expected schema...');
        setDebugInfo(prev => [...prev, '🧪 Testing alumni table access...']);
        
        try {
          // Try to access the alumni table with specific columns from the schema
          console.log('🧪 Attempting alumni table query...');
          const { data: schemaTest, error: schemaError } = await supabase
            .from('alumni')
            .select('id, email, name, batch_year, role, created_at, profile_completed')
            .limit(1);
          
          console.log('🧪 Alumni table query result:', { schemaTest, schemaError });
          
          if (schemaError) {
            console.error('🧪 Alumni table schema test failed:', schemaError);
            setDebugInfo(prev => [...prev, `❌ Alumni Table Error: ${schemaError.message}`]);
            setDebugInfo(prev => [...prev, `Error Code: ${schemaError.code}`]);
            setDebugInfo(prev => [...prev, `Error Details: ${schemaError.details || 'No details'}`]);
            
            // Check specific error types
            if (schemaError.message.includes('permission denied') || schemaError.code === 'PGRST116') {
              setDebugInfo(prev => [...prev, '🔐 This is likely a Row Level Security (RLS) policy issue']);
              setDebugInfo(prev => [...prev, '💡 Solution: Need to add RLS policies for authenticated users']);
            } else if (schemaError.message.includes('does not exist')) {
              setDebugInfo(prev => [...prev, '📋 The alumni table does not exist in the database']);
              setDebugInfo(prev => [...prev, '💡 Solution: Need to run database migration scripts']);
            } else {
              setDebugInfo(prev => [...prev, `🔍 Unexpected error type: ${schemaError.code}`]);
            }
          } else {
            console.log('🧪 Alumni table accessible:', { recordCount: schemaTest?.length || 0 });
            setDebugInfo(prev => [...prev, `✅ Alumni Table: Found ${schemaTest?.length || 0} records`]);
            if (schemaTest && schemaTest.length > 0) {
              setDebugInfo(prev => [...prev, `Sample record: ${JSON.stringify(schemaTest[0], null, 2)}`]);
            }
          }
        } catch (tableError) {
          console.error('🧪 Alumni table access exception:', tableError);
          setDebugInfo(prev => [...prev, `❌ Table Exception: ${tableError}`]);
        }

        // Test INSERT permission (what we need for profile creation)
        console.log('🧪 Testing INSERT permission on alumni table...');
        setDebugInfo(prev => [...prev, '🧪 Testing INSERT permission...']);
        
        try {
          // Try a mock insert to test permissions (this will fail but should give us permission info)
          const { data: insertTest, error: insertError } = await supabase
            .from('alumni')
            .insert({
              email: 'test@example.com',
              name: 'Test User',
              batch_year: 2024
            })
            .select()
            .limit(1);
          
          if (insertError) {
            console.log('🧪 INSERT test error (expected):', insertError);
            setDebugInfo(prev => [...prev, `INSERT Test: ${insertError.message}`]);
            
            if (insertError.message.includes('duplicate key') || insertError.code === '23505') {
              setDebugInfo(prev => [...prev, '✅ INSERT permission works (duplicate key error is expected)']);
            } else if (insertError.message.includes('permission denied') || insertError.code === 'PGRST116') {
              setDebugInfo(prev => [...prev, '❌ No INSERT permission - RLS policy needed']);
            }
          } else {
            setDebugInfo(prev => [...prev, '⚠️ INSERT test unexpectedly succeeded - cleaning up...']);
            // Clean up the test record
            if (insertTest && insertTest[0]) {
              await supabase.from('alumni').delete().eq('id', insertTest[0].id);
            }
          }
        } catch (insertException) {
          console.error('🧪 INSERT test exception:', insertException);
          setDebugInfo(prev => [...prev, `INSERT Exception: ${insertException}`]);
        }

        setDebugInfo(prev => [...prev, '🧪 Database test completed. Check logs for details.']);
        
      } catch (error) {
        console.error('🧪 Connection test failed:', error);
        setDebugInfo(prev => [...prev, `❌ Connection test failed: ${error}`]);
      }
    };

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Header */}
            <div className="bg-primary text-white px-6 py-8">
              <div className="flex items-center">
                <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center">
                  <User className="h-12 w-12 text-primary" />
                </div>
                <div className="ml-6">
                  <h1 className="text-3xl font-bold">Complete Your Profile</h1>
                  <p className="text-primary-light mt-2">Welcome! Let's set up your alumni profile</p>
                  <p className="text-primary-light text-sm mt-1">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Debug Section */}
            <div className="p-6 bg-yellow-50 border-b">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Debug Tools</h3>
              <p className="text-yellow-700 text-sm mb-4">
                Profile not found. Use this button to test database connection:
              </p>
              <button
                onClick={testDatabaseConnection}
                className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700"
              >
                🧪 Test Database Connection
              </button>
              
              {debugInfo.length > 0 && (
                <div className="mt-4 p-4 bg-white border rounded-md">
                  <h4 className="font-semibold text-gray-800 mb-2">Debug Results:</h4>
                  <div className="space-y-1 text-sm font-mono">
                    {debugInfo.map((info, index) => (
                      <div key={index} className="text-gray-700">
                        {info}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setDebugInfo([])}
                    className="mt-2 text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                  >
                    Clear
                  </button>
                </div>
              )}
              
              <div className="mt-4 text-xs text-yellow-600">
                <p>User ID: {user?.id}</p>
                <p>Email: {user?.email}</p>
                <p>Auth Loading: {loading ? 'Yes' : 'No'}</p>
              </div>
            </div>

            {/* Profile Creation Form */}
            <div className="p-6">
              <form 
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email (Read-only) */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address (Read-only)
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      readOnly
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
                      value={user?.email || ''}
                    />
                  </div>

                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Batch Year */}
                  <div>
                    <label htmlFor="batch_year" className="block text-sm font-medium text-gray-700">
                      Batch Year *
                    </label>
                    <input
                      type="number"
                      id="batch_year"
                      name="batch_year"
                      required
                      min="1950"
                      max="2030"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      value={formData.batch_year}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark flex items-center transition-colors"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Create Profile
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log('🔍 Profile Component: Rendering main profile UI');
  console.log('🔍 Profile Component: Form data state:', formData);
  console.log('🔍 Profile Component: Is editing:', isEditing);
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-primary text-white px-6 py-8 flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center overflow-hidden">
                {profile.profile_photo_url ? (
                  <img
                    src={profile.profile_photo_url}
                    alt="Profile"
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-10 w-10 text-primary" />
                )}
              </div>
              <div className="ml-6">
                <h1 className="text-2xl font-bold">{profile.name || 'Anonymous User'}</h1>
                <p className="text-primary-light opacity-90">
                  {profile.batch_year && `Batch ${profile.batch_year}`}
                  {profile.current_city && ` • ${profile.current_city}`}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-white text-primary px-4 py-2 rounded-md hover:bg-gray-100 flex items-center transition-colors"
            >
              {isEditing ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Profile
                </>
              )}
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Email (readonly) */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address (Read-only)
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      readOnly
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
                      value={profile?.email || ''}
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Batch Year */}
                  <div>
                    <label htmlFor="batch_year" className="block text-sm font-medium text-gray-700">
                      Batch Year *
                    </label>
                    <input
                      type="number"
                      id="batch_year"
                      name="batch_year"
                      required
                      min="1950"
                      max="2030"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      value={formData.batch_year}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                      Gender
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      value={formData.gender}
                      onChange={handleChange}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>

                  {/* Marital Status */}
                  <div>
                    <label htmlFor="marital_status" className="block text-sm font-medium text-gray-700">
                      Marital Status
                    </label>
                    <select
                      id="marital_status"
                      name="marital_status"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      value={formData.marital_status}
                      onChange={handleChange}
                    >
                      <option value="">Select Status</option>
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                      <option value="divorced">Divorced</option>
                      <option value="widowed">Widowed</option>
                      <option value="separated">Separated</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      id="date_of_birth"
                      name="date_of_birth"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Age */}
                  <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                      Age
                    </label>
                    <input
                      type="number"
                      id="age"
                      name="age"
                      min="16"
                      max="100"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      value={formData.age}
                      onChange={handleChange}
                    />
                  </div>

                  {/* WhatsApp Number */}
                  <div>
                    <label htmlFor="whatsapp_number" className="block text-sm font-medium text-gray-700">
                      WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      id="whatsapp_number"
                      name="whatsapp_number"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      value={formData.whatsapp_number}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Current City */}
                  <div>
                    <label htmlFor="current_city" className="block text-sm font-medium text-gray-700">
                      Current City
                    </label>
                    <input
                      type="text"
                      id="current_city"
                      name="current_city"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      value={formData.current_city}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Current Country */}
                  <div>
                    <label htmlFor="current_country" className="block text-sm font-medium text-gray-700">
                      Current Country
                    </label>
                    <input
                      type="text"
                      id="current_country"
                      name="current_country"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      value={formData.current_country}
                      onChange={handleChange}
                    />
                  </div>

                  {/* LinkedIn */}
                  <div>
                    <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700">
                      LinkedIn Profile
                    </label>
                    <input
                      type="url"
                      id="linkedin_url"
                      name="linkedin_url"
                      placeholder="https://linkedin.com/in/yourprofile"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      value={formData.linkedin_url}
                      onChange={handleChange}
                    />
                  </div>

                  {/* GitHub */}
                  <div>
                    <label htmlFor="github_url" className="block text-sm font-medium text-gray-700">
                      GitHub Profile
                    </label>
                    <input
                      type="url"
                      id="github_url"
                      name="github_url"
                      placeholder="https://github.com/yourusername"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      value={formData.github_url}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Portfolio */}
                  <div>
                    <label htmlFor="portfolio_url" className="block text-sm font-medium text-gray-700">
                      Portfolio Website
                    </label>
                    <input
                      type="url"
                      id="portfolio_url"
                      name="portfolio_url"
                      placeholder="https://yourportfolio.com"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      value={formData.portfolio_url}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Facebook */}
                  <div>
                    <label htmlFor="facebook_url" className="block text-sm font-medium text-gray-700">
                      Facebook Profile
                    </label>
                    <input
                      type="url"
                      id="facebook_url"
                      name="facebook_url"
                      placeholder="https://facebook.com/yourprofile"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      value={formData.facebook_url}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Instagram */}
                  <div>
                    <label htmlFor="instagram_url" className="block text-sm font-medium text-gray-700">
                      Instagram Profile
                    </label>
                    <input
                      type="url"
                      id="instagram_url"
                      name="instagram_url"
                      placeholder="https://instagram.com/yourusername"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      value={formData.instagram_url}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Twitter */}
                  <div>
                    <label htmlFor="twitter_url" className="block text-sm font-medium text-gray-700">
                      Twitter Profile
                    </label>
                    <input
                      type="url"
                      id="twitter_url"
                      name="twitter_url"
                      placeholder="https://twitter.com/yourusername"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      value={formData.twitter_url}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Snapchat */}
                  <div>
                    <label htmlFor="snapchat_url" className="block text-sm font-medium text-gray-700">
                      Snapchat Profile
                    </label>
                    <input
                      type="url"
                      id="snapchat_url"
                      name="snapchat_url"
                      placeholder="https://snapchat.com/add/yourusername"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      value={formData.snapchat_url}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="Tell us about yourself..."
                    value={formData.bio}
                    onChange={handleChange}
                  />
                </div>

                {/* Save */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark flex items-center transition-colors"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Profile
                  </button>
                </div>
              </form>
            ) : (
              /* View Mode */
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email */}
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-900">{profile.email}</p>
                    </div>
                  </div>

                  {/* Phone */}
                  {profile.phone && (
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="text-gray-900">{profile.phone}</p>
                      </div>
                    </div>
                  )}

                  {/* Batch Year */}
                  {profile.batch_year && (
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Batch Year</p>
                        <p className="text-gray-900">{profile.batch_year}</p>
                      </div>
                    </div>
                  )}

                  {/* Gender */}
                  {profile.gender && (
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Gender</p>
                        <p className="text-gray-900 capitalize">{profile.gender.replace('_', ' ')}</p>
                      </div>
                    </div>
                  )}

                  {/* Marital Status */}
                  {profile.marital_status && (
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Marital Status</p>
                        <p className="text-gray-900 capitalize">{profile.marital_status.replace('_', ' ')}</p>
                      </div>
                    </div>
                  )}

                  {/* Date of Birth */}
                  {profile.date_of_birth && (
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Date of Birth</p>
                        <p className="text-gray-900">{new Date(profile.date_of_birth).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}

                  {/* Age */}
                  {profile.age && (
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Age</p>
                        <p className="text-gray-900">{profile.age} years</p>
                      </div>
                    </div>
                  )}

                  {/* WhatsApp */}
                  {profile.whatsapp_number && (
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">WhatsApp</p>
                        <p className="text-gray-900">{profile.whatsapp_number}</p>
                      </div>
                    </div>
                  )}

                  {/* Location */}
                  {(profile.current_city || profile.current_country) && (
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="text-gray-900">
                          {profile.current_city}
                          {profile.current_city && profile.current_country && ', '}
                          {profile.current_country}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bio */}
                {profile.bio && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">About</h3>
                    <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                  </div>
                )}

                {/* Links */}
                {(profile.linkedin_url || profile.github_url || profile.portfolio_url || 
                  profile.facebook_url || profile.instagram_url || profile.twitter_url || profile.snapchat_url) && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Links & Social Media</h3>
                    <div className="flex flex-wrap gap-3">
                      {profile.linkedin_url && (
                        <a
                          href={profile.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                        >
                          <Globe className="h-4 w-4 mr-2" />
                          LinkedIn
                        </a>
                      )}
                      {profile.github_url && (
                        <a
                          href={profile.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                        >
                          <Globe className="h-4 w-4 mr-2" />
                          GitHub
                        </a>
                      )}
                      {profile.portfolio_url && (
                        <a
                          href={profile.portfolio_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-3 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                        >
                          <Globe className="h-4 w-4 mr-2" />
                          Portfolio
                        </a>
                      )}
                      {profile.facebook_url && (
                        <a
                          href={profile.facebook_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-3 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                        >
                          <Globe className="h-4 w-4 mr-2" />
                          Facebook
                        </a>
                      )}
                      {profile.instagram_url && (
                        <a
                          href={profile.instagram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-3 py-2 bg-pink-50 text-pink-600 rounded-md hover:bg-pink-100 transition-colors"
                        >
                          <Globe className="h-4 w-4 mr-2" />
                          Instagram
                        </a>
                      )}
                      {profile.twitter_url && (
                        <a
                          href={profile.twitter_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-3 py-2 bg-sky-50 text-sky-600 rounded-md hover:bg-sky-100 transition-colors"
                        >
                          <Globe className="h-4 w-4 mr-2" />
                          Twitter
                        </a>
                      )}
                      {profile.snapchat_url && (
                        <a
                          href={profile.snapchat_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-3 py-2 bg-yellow-50 text-yellow-600 rounded-md hover:bg-yellow-100 transition-colors"
                        >
                          <Globe className="h-4 w-4 mr-2" />
                          Snapchat
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
