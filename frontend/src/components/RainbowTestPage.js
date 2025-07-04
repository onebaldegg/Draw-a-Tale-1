import React from 'react';

const RainbowTestPage = () => {
  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#8A2BE2' }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          Rainbow Kaleidoscope Frame Test
        </h1>
        
        {/* Simple Rainbow Frame Test - Guaranteed Visible */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Simple Rainbow Frame Test (Should be visible!)</h2>
          <div className="rainbow-frame-simple">
            <div className="bg-yellow-400 p-8 rounded-lg">
              <h3 className="text-2xl font-bold text-black mb-4">30pt Rainbow Border Test</h3>
              <p className="text-black">This yellow box should have a clearly visible 30pt rainbow animated border around it.</p>
            </div>
          </div>
        </div>

        {/* Test Hero Section with Enhanced Rainbow Effect */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Enhanced Rainbow Frame (Hero Section)</h2>
          <div className="rainbow-kaleidoscope-enhanced rounded-2xl">
            <div className="hero-section rounded-2xl">
              <h1 className="hero-title">Ready to Create, Artist?</h1>
              <p className="hero-subtitle">Let your imagination soar with magical drawing adventures!</p>
            </div>
          </div>
        </div>

        {/* Test Dashboard Cards with Basic Rainbow Effect */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Basic Rainbow Frame (Dashboard Cards)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="rainbow-kaleidoscope-frame rounded-xl"
              >
                <div
                  className="dashboard-card hover:shadow-2xl p-6"
                  style={{ backgroundColor: '#FFC107' }}
                >
                  <div className="bg-indigo-600 text-white rounded-full w-20 h-20 flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                    🎨
                  </div>
                  <h3 className="dashboard-card-title">Test Card {item}</h3>
                  <p className="dashboard-card-description">This card stays yellow with rainbow frame around it.</p>
                  <div className="text-sm px-4 py-2 rounded-lg font-bold text-white hover:opacity-80 transition-all duration-200" style={{ backgroundColor: '#4F46E5' }}>
                    Get Started
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Effect Comparison */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Effect Comparison</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-xl font-bold mb-2">Without Rainbow Frame</h3>
              <p className="text-gray-600">This is a normal card without any rainbow frame effects.</p>
            </div>
            <div className="rainbow-kaleidoscope-frame rounded-xl">
              <div className="card p-6">
                <h3 className="text-xl font-bold mb-2">With Rainbow Frame</h3>
                <p className="text-gray-600">This card has a 30pt rainbow frame around it while keeping the white background.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Animation Controls Info */}
        <div className="card p-6 text-center">
          <h3 className="text-xl font-bold mb-4">Rainbow Frame Implementation</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Frame Width:</strong> Exactly 30pt around each element</p>
            <p><strong>Box Colors:</strong> Original colors maintained (red hero, yellow cards)</p>
            <p><strong>Frame Effect:</strong> Rainbow kaleidoscope animation only on the 30pt border</p>
            <p><strong>Basic Frame:</strong> 3s rotation + 4s reverse rotation</p>
            <p><strong>Enhanced Frame:</strong> 2.5s pulse + 3.5s orbit</p>
            <p><strong>Colors:</strong> Full spectrum rainbow with smooth transitions</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RainbowTestPage;