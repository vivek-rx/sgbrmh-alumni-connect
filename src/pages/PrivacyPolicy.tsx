import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-8">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-gray-700 mb-4">
          This is the privacy policy for the Shri GB Rathi Maheshwari Hostel Alumni Connect platform.
          We respect your privacy and are committed to protecting your personal data. This page
          explains what data we collect, why we collect it, and how we use and protect it.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">What we collect</h2>
        <ul className="list-disc list-inside text-gray-700">
          <li>Account data: name, email, password (stored securely by Supabase Auth).</li>
          <li>Profile information: bio, phone, batch year, profession, social links, location.</li>
          <li>Usage data: pages visited, actions performed (for analytics and improving the service).</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">How we use data</h2>
        <p className="text-gray-700">We use data to provide the service, enable authentication, and allow members to connect.</p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Sharing and third parties</h2>
        <p className="text-gray-700">We do not sell personal data. We use Supabase for authentication and storage; please review their privacy policies as well.</p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Contact</h2>
        <p className="text-gray-700">If you have questions about this policy, contact us at <a href="mailto:abmectpune@gmail.com" className="text-orange-600">abmectpune@gmail.com</a>.</p>

        <div className="mt-6">
          <Link to="/" className="text-orange-600 hover:underline">Back to home</Link>
        </div>
      </div>
    </div>
  );
}
