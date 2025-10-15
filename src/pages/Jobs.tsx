import { useState, useEffect } from 'react';
import { MapPin, Calendar, DollarSign, Building } from 'lucide-react';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);

  // Mock data - replace with actual API call
  const mockJobs = [
    {
      id: '1',
      title: 'Senior Software Engineer',
      company: 'Tech Corp',
      location: 'Bangalore, India',
      type: 'Full-time',
      salary: '₹15-25 LPA',
      postedDate: '2024-01-15',
      description: 'We are looking for a senior software engineer with 3+ years of experience in React and Node.js.',
      requirements: ['3+ years React experience', 'Node.js proficiency', 'Bachelor\'s degree in CS']
    },
    {
      id: '2',
      title: 'Product Manager',
      company: 'StartupXYZ',
      location: 'Mumbai, India',
      type: 'Full-time',
      salary: '₹20-30 LPA',
      postedDate: '2024-01-10',
      description: 'Join our growing startup as a product manager to drive product strategy and execution.',
      requirements: ['2+ years PM experience', 'Technical background', 'Strong communication skills']
    }
  ];

  useEffect(() => {
    setJobs(mockJobs);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Job Opportunities
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Discover career opportunities shared by our alumni network
          </p>
        </div>

        <div className="space-y-6">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {job.title}
                  </h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <Building className="h-4 w-4 mr-2" />
                    {job.company}
                  </div>
                </div>
                <span className="bg-primary text-white px-3 py-1 rounded-full text-sm">
                  {job.type}
                </span>
              </div>

              <p className="text-gray-700 mb-4">
                {job.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {job.location}
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  {job.salary}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Posted {new Date(job.postedDate).toLocaleDateString()}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Requirements:</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  {job.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-end">
                <button className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition-colors">
                  Apply Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {jobs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No job opportunities available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}