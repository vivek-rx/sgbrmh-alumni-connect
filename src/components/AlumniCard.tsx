import { Link } from 'react-router-dom';
import { Building2, MapPin, Briefcase } from 'lucide-react';

interface AlumniProps {
  id: string;
  name: string;
  batch: string;
  course: string;
  company?: string;
  position?: string;
  location?: string;
  avatar: string;
  bio?: string;
}

interface AlumniCardProps {
  alumni: AlumniProps;
}

export function AlumniCard({ alumni }: AlumniCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <img
            src={alumni.avatar}
            alt={alumni.name}
            width={80}
            height={80}
            className="rounded-full w-20 h-20 object-cover"
          />
        </div>
        
        <div className="flex-1">
          <Link to={`/alumni/${alumni.id}`}>
            <h3 className="text-xl font-semibold text-gray-900 hover:text-primary">
              {alumni.name}
            </h3>
          </Link>
          
          <p className="text-gray-500 mt-1">Batch of {alumni.batch}</p>
          <p className="text-gray-600 text-sm">{alumni.course}</p>
          
          {alumni.position && (
            <div className="flex items-center mt-2 text-gray-600">
              <Briefcase className="h-4 w-4 mr-2" />
              <span>{alumni.position}</span>
            </div>
          )}
          
          {alumni.company && (
            <div className="flex items-center mt-2 text-gray-600">
              <Building2 className="h-4 w-4 mr-2" />
              <span>{alumni.company}</span>
            </div>
          )}
          
          {alumni.location && (
            <div className="flex items-center mt-2 text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{alumni.location}</span>
            </div>
          )}
        </div>
      </div>
      
      {alumni.bio && (
        <p className="mt-4 text-gray-600 line-clamp-2">
          {alumni.bio}
        </p>
      )}
      
      <div className="mt-4 flex justify-end">
        <Link 
          to={`/alumni/${alumni.id}`}
          className="text-sm text-primary hover:text-primary-dark font-medium"
        >
          View Profile →
        </Link>
      </div>
    </div>
  );
}