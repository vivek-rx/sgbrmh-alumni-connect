export function About() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            About Our Community
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Fostering connections between past and present students of Shri GB Rathi Maheshwari Hostel
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-primary/10 rounded-full h-16 w-16 mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">🤝</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Connect</h3>
            <p className="text-gray-600">
              Bridge the gap between alumni and current students through meaningful connections
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-primary/10 rounded-full h-16 w-16 mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">📚</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Learn</h3>
            <p className="text-gray-600">
              Access mentorship and guidance from experienced professionals in various fields
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-primary/10 rounded-full h-16 w-16 mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">🚀</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Grow</h3>
            <p className="text-gray-600">
              Discover opportunities and build a stronger professional network together
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}