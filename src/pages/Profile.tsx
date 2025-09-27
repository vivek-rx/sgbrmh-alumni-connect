import { useState } from 'react';
import { User, Mail, Phone, Calendar, BookOpen } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    batch: user?.batch || '',
    course: user?.course || '',
    company: user?.company || '',
    position: user?.position || '',
    location: user?.location || '',
    bio: user?.bio || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Update user profile logic here
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-primary text-white px-6 py-8">
            <div className="flex items-center">
              <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center">
                <User className="h-10 w-10 text-primary" />
              </div>
              <div className="ml-6">
                <h1 className="text-2xl font-bold">
                  {user?.firstName} {user?.lastName}
                </h1>
                <p className="text-primary-light">
                  {user?.course} • {user?.batch}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Profile Information
              </h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-2" />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-2" />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-400 mr-2" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-400 mr-2" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Batch
                  </label>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <input
                      type="text"
                      name="batch"
                      value={formData.batch}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course
                  </label>
                  <div className="flex items-center">
                    <BookOpen className="h-5 w-5 text-gray-400 mr-2" />
                    <input
                      type="text"
                      name="course"
                      value={formData.course}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50"
                  placeholder="Tell us about yourself..."
                />
              </div>

              {isEditing && (
                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}