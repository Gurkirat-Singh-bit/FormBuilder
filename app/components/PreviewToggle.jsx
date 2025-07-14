import { Monitor, Tablet, Smartphone } from 'lucide-react';

const PreviewToggle = ({ previewMode, setPreviewMode, darkMode }) => (
  <div className={`flex rounded-lg border ${
    darkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-white'
  }`}>
    {['desktop', 'tablet', 'mobile'].map((mode) => (
      <button
        key={mode}
        onClick={() => setPreviewMode(mode)}
        className={`px-3 py-2 flex items-center space-x-2 ${
          previewMode === mode
            ? darkMode 
              ? 'bg-purple-600 text-white' 
              : 'bg-purple-600 text-white'
            : darkMode
              ? 'text-gray-400 hover:text-gray-200'
              : 'text-gray-600 hover:text-gray-800'
        } ${mode === 'desktop' ? 'rounded-l-lg' : mode === 'mobile' ? 'rounded-r-lg' : ''}`}
      >
        {mode === 'desktop' && <Monitor size={16} />}
        {mode === 'tablet' && <Tablet size={16} />}
        {mode === 'mobile' && <Smartphone size={16} />}
        <span className="capitalize">{mode}</span>
      </button>
    ))}
  </div>
);

export default PreviewToggle;