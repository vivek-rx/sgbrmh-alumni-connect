import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { AlumniCard } from '@/components/AlumniCard';

export default function Alumni() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [alumni, setAlumni] = useState([]);

  // Mock data - replace with actual API call
  const mockAlumni = [
    {
      id: '1',
      name: 'John Doe',
      batch: '2018-2022',
      course: 'Computer Science',
      company: 'Google',
      position: 'Software Engineer',
      location: 'Bangalore',
      avatar: '/default-avatar.png'
    },
    // Add more mock data as needed
  ];

  useEffect(() => {
    setAlumni(mockAlumni);
  }, []);

  const filteredAlumni = alumni.filter(person => 
    person.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedBatch === '' || person.batch === selectedBatch)
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Alumni Directory
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Connect with our amazing alumni community
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search alumni..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <select
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
              >
                <option value="">All Batches</option>
                <option value="2018-2022">2018-2022</option>
                <option value="2019-2023">2019-2023</option>
                <option value="2020-2024">2020-2024</option>
              </select>
            </div>
          </div>
        </div>

        {/* Alumni Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAlumni.map((person) => (
            <AlumniCard key={person.id} alumni={person} />
          ))}
        </div>

        {filteredAlumni.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No alumni found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}