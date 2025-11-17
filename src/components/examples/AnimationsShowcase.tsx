import React, { useState } from 'react';

/**
 * Showcase of all available animations
 * Import animations.css to use these
 */
export const AnimationsShowcase: React.FC = () => {
  const [showToast, setShowToast] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Animation Showcase</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Slide-in-right Animation */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Slide-in-right</h2>
          <p className="text-gray-600 mb-4">Used for toast notifications</p>
          <button
            onClick={() => setShowToast(!showToast)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Toggle Toast
          </button>
          {showToast && (
            <div className="mt-4 bg-green-100 border-l-4 border-green-500 p-4 animate-slide-in-right">
              <p className="text-green-800">Toast Notification Sliding In!</p>
            </div>
          )}
        </div>

        {/* Scale-in Animation */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Scale-in</h2>
          <p className="text-gray-600 mb-4">Used for modal dialogs</p>
          <button
            onClick={() => setShowModal(!showModal)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Toggle Modal
          </button>
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
              <div className="bg-white p-8 rounded-lg shadow-xl max-w-md animate-scale-in">
                <h3 className="text-lg font-bold mb-2">Modal Dialog</h3>
                <p className="text-gray-600 mb-4">This scales in from center!</p>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bounce Animation */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Bounce</h2>
          <p className="text-gray-600 mb-4">Used for success icons</p>
          <button
            onClick={() => setShowSuccess(!showSuccess)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Show Success
          </button>
          {showSuccess && (
            <div className="mt-4 flex items-center gap-2">
              <svg
                className="h-8 w-8 text-green-600 animate-bounce"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-green-800 font-medium">Success!</span>
            </div>
          )}
        </div>

        {/* Shake Animation */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Shake</h2>
          <p className="text-gray-600 mb-4">Used for error icons</p>
          <button
            onClick={() => setShowError(!showError)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Show Error
          </button>
          {showError && (
            <div className="mt-4 flex items-center gap-2">
              <svg
                className="h-8 w-8 text-red-600 animate-shake"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-red-800 font-medium">Error!</span>
            </div>
          )}
        </div>

        {/* Pulse Animation */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Pulse</h2>
          <p className="text-gray-600 mb-4">Used for loading states</p>
          <button className="px-6 py-3 bg-gray-600 text-white rounded-lg animate-pulse">
            Loading...
          </button>
        </div>

        {/* Spin Animation */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Spin</h2>
          <p className="text-gray-600 mb-4">Used for loading spinners</p>
          <div className="flex items-center gap-4">
            <svg
              className="animate-spin h-8 w-8 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Processing...</span>
          </div>
        </div>

        {/* Progress Animation */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Progress</h2>
          <p className="text-gray-600 mb-4">Used for toast duration bars</p>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 animate-progress"
              style={{ animationDuration: '3000ms' }}
            />
          </div>
        </div>

        {/* Shimmer Animation */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Shimmer</h2>
          <p className="text-gray-600 mb-4">Used for loading placeholders</p>
          <div className="space-y-3">
            <div className="h-4 rounded animate-shimmer"></div>
            <div className="h-4 w-3/4 rounded animate-shimmer"></div>
            <div className="h-4 w-1/2 rounded animate-shimmer"></div>
          </div>
        </div>

        {/* Fade-in Animation */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Fade-in</h2>
          <p className="text-gray-600 mb-4">Used for backdrops and text</p>
          <div className="bg-gray-100 p-4 rounded animate-fade-in">
            <p className="text-gray-800">This content fades in smoothly</p>
          </div>
        </div>

        {/* Button Hover Lift */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Button Hover Lift</h2>
          <p className="text-gray-600 mb-4">Hover over the button</p>
          <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg btn-hover-lift">
            Hover Me!
          </button>
        </div>

        {/* Combined Animations */}
        <div className="bg-white p-6 rounded-lg shadow-md md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Combined Animations</h2>
          <p className="text-gray-600 mb-4">Multiple animations can be combined</p>
          <div className="flex gap-4 flex-wrap">
            <button className="px-6 py-3 bg-green-600 text-white rounded-lg animate-fade-in animate-bounce">
              Fade + Bounce
            </button>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg animate-scale-in btn-hover-lift">
              Scale + Lift
            </button>
            <button className="px-6 py-3 bg-purple-600 text-white rounded-lg animate-pulse btn-hover-lift">
              Pulse + Lift
            </button>
          </div>
        </div>
      </div>

      {/* CSS Class Reference */}
      <div className="mt-8 bg-gray-50 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Available Animation Classes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Entry Animations</h3>
            <ul className="text-sm space-y-1 text-gray-700">
              <li><code className="bg-gray-200 px-2 py-1 rounded">animate-slide-in-right</code></li>
              <li><code className="bg-gray-200 px-2 py-1 rounded">animate-slide-out-right</code></li>
              <li><code className="bg-gray-200 px-2 py-1 rounded">animate-scale-in</code></li>
              <li><code className="bg-gray-200 px-2 py-1 rounded">animate-fade-in</code></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">State Animations</h3>
            <ul className="text-sm space-y-1 text-gray-700">
              <li><code className="bg-gray-200 px-2 py-1 rounded">animate-bounce</code></li>
              <li><code className="bg-gray-200 px-2 py-1 rounded">animate-shake</code></li>
              <li><code className="bg-gray-200 px-2 py-1 rounded">animate-pulse</code></li>
              <li><code className="bg-gray-200 px-2 py-1 rounded">animate-spin</code></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Loading Animations</h3>
            <ul className="text-sm space-y-1 text-gray-700">
              <li><code className="bg-gray-200 px-2 py-1 rounded">animate-progress</code></li>
              <li><code className="bg-gray-200 px-2 py-1 rounded">animate-shimmer</code></li>
              <li><code className="bg-gray-200 px-2 py-1 rounded">animate-ripple</code></li>
              <li><code className="bg-gray-200 px-2 py-1 rounded">btn-hover-lift</code></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimationsShowcase;
