import { Link } from 'react-router-dom';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-8">
        <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
        <p className="text-gray-700 mb-4">
          These Terms of Service govern your use of the Shri GB Rathi Maheshwari Hostel Alumni Connect platform.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Acceptance</h2>
        <p className="text-gray-700">By accessing or using the service, you agree to these terms.</p>

        <h2 className="text-xl font-semibold mt-6 mb-2">User responsibilities</h2>
        <p className="text-gray-700">You are responsible for providing accurate information and for your account security.</p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Contact</h2>
        <p className="text-gray-700">Questions about these terms? Contact <a href="mailto:abmectpune@gmail.com" className="text-orange-600">abmectpune@gmail.com</a>.</p>

        <div className="mt-6">
          <Link to="/" className="text-orange-600 hover:underline">Back to home</Link>
        </div>
      </div>
    </div>
  );
}
