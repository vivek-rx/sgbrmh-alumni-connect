export default function Admin() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Admin Dashboard
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-primary">1,234</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Alumni</h3>
            <p className="text-3xl font-bold text-green-600">987</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Events</h3>
            <p className="text-3xl font-bold text-blue-600">25</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Job Posts</h3>
            <p className="text-3xl font-bold text-purple-600">42</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Activities
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span>New user registration: John Doe</span>
              <span className="text-sm text-gray-500">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span>Event created: Alumni Meet 2024</span>
              <span className="text-sm text-gray-500">5 hours ago</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span>Job posted: Software Engineer at TechCorp</span>
              <span className="text-sm text-gray-500">1 day ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}