import Image from 'next/image';
import Link from 'next/link';
import { Building2, MapPin, Briefcase } from 'lucide-react';
import { type User } from '@/types/user';

interface AlumniCardProps {
  alumni: User;
}

export function AlumniCard({ alumni }: AlumniCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <Image
            src={alumni.photoURL || '/default-avatar.png'}
            alt={alumni.displayName}
            width={80}
            height={80}
            className="rounded-full"
          />
        </div>
        
        <div className="flex-1">
          <Link href={`/alumni/${alumni.uid}`}>
            <h3 className="text-xl font-semibold text-gray-900 hover:text-primary">
              {alumni.displayName}
            </h3>
          </Link>
          
          <p className="text-gray-500 mt-1">Batch of {alumni.batch}</p>
          
          {alumni.profession && (
            <div className="flex items-center mt-2 text-gray-600">
              <Briefcase className="h-4 w-4 mr-2" />
              <span>{alumni.profession}</span>
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
          href={`/alumni/${alumni.uid}`}
          className="text-sm text-primary hover:text-primary-dark font-medium"
        >
          View Profile →
        </Link>
      </div>
    </div>
  );
}