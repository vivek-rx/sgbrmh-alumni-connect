import { useState, useEffect } from 'react';
import { MapPin, Calendar, Users } from 'lucide-react';

export default function Events() {
  const [events, setEvents] = useState([]);

  // Mock data - replace with actual API call
  const mockEvents = [
    {
      id: '1',
      title: 'Annual Alumni Meet 2024',
      date: '2024-03-15',
      time: '10:00 AM',
      location: 'Hostel Main Hall',
      description: 'Join us for our annual gathering to reconnect with old friends and make new connections.',
      attendees: 45,
      image: '/logo.png'
    },
    {
      id: '2',
      title: 'Career Guidance Workshop',
      date: '2024-02-20',
      time: '2:00 PM',
      location: 'Online',
      description: 'Industry experts will share insights on career opportunities and skill development.',
      attendees: 120,
      image: '/logo.png'
    }
  ];

  useEffect(() => {
    setEvents(mockEvents);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Upcoming Events
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Stay connected with our community events and activities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {event.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {event.description}
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(event.date).toLocaleDateString()} at {event.time}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {event.location}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    {event.attendees} attendees
                  </div>
                </div>
                <button className="mt-4 w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors">
                  Register Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {events.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No upcoming events at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}