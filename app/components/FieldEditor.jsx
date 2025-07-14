import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const FieldEditor = ({ field, onUpdate, onClose, darkMode }) => {
  const [localField, setLocalField] = useState(field);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleSave = () => {
    onUpdate(localField);
    onClose();
  };

  const addOption = () => {
    const options = localField.options || [];
    setLocalField({
      ...localField,
      options: [...options, `Option ${options.length + 1}`]
    });
  };

  const updateOption = (index, value) => {
    const options = [...localField.options];
    options[index] = value;
    setLocalField({ ...localField, options });
  };

  const removeOption = (index) => {
    const options = localField.options.filter((_, i) => i !== index);
    setLocalField({ ...localField, options });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-md max-h-full overflow-hidden rounded-2xl shadow-2xl border ${
        darkMode 
          ? 'bg-gray-900 bg-opacity-95 border-gray-700 border-opacity-50 text-gray-100' 
          : 'bg-white bg-opacity-95 border-gray-200 border-opacity-50 text-gray-900'
      } backdrop-blur-xl transform transition-all duration-300 ease-out flex flex-col`}>
        
        {/* Header */}
        <div className={`px-6 py-5 border-b ${
          darkMode ? 'border-gray-700 border-opacity-50' : 'border-gray-200 border-opacity-50'
        }`}>
          <h3 className={`text-xl font-semibold ${
            darkMode 
              ? 'text-purple-400' 
              : 'text-purple-600'
          }`}>
            Edit Field
          </h3>
        </div>
        
        {/* Content */}
        <div className="px-6 py-5 overflow-y-auto scrollbar-hide flex-1">
          <div className="space-y-6">
            
            {/* Label Input */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Label
              </label>
              <input
                type="text"
                value={localField.label}
                onChange={(e) => setLocalField({ ...localField, label: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 ${
                  darkMode 
                    ? 'bg-gray-800 bg-opacity-50 border-gray-600 border-opacity-50 focus:border-cyan-500 focus:ring-cyan-500 focus:ring-opacity-20' 
                    : 'bg-gray-50 bg-opacity-50 border-gray-300 border-opacity-50 focus:border-purple-500 focus:ring-purple-500 focus:ring-opacity-20'
                }`}
              />
            </div>
          {/* Placeholder input */}
            
     {!(['file', 'signature', 'captcha', 'address', 'time', 'rating', 'fullname', 'matrix', 'image-upload', 'image-capture', 'qr'].includes(localField.type)) && (
  <div className="space-y-2">
    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
      Placeholder
    </label>
    <input
      type="text"
      value={localField.placeholder || ''}
      onChange={(e) => setLocalField({ ...localField, placeholder: e.target.value })}
      className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 ${
        darkMode 
          ? 'bg-gray-800 bg-opacity-50 border-gray-600 border-opacity-50 focus:border-cyan-500 focus:ring-cyan-500 focus:ring-opacity-20' 
          : 'bg-gray-50 bg-opacity-50 border-gray-300 border-opacity-50 focus:border-purple-500 focus:ring-purple-500 focus:ring-opacity-20'
      }`}
    />
  </div>
)}

            {/* Required Checkbox */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <input
                  type="checkbox"
                  id="required"
                  checked={localField.required}
                  onChange={(e) => setLocalField({ ...localField, required: e.target.checked })}
                  className="sr-only"
                />
                <label 
                  htmlFor="required"
                  className={`flex items-center justify-center w-5 h-5 rounded-md border-2 cursor-pointer transition-all duration-200 ${
                    localField.required
                      ? darkMode 
                        ? 'bg-cyan-500 border-cyan-500' 
                        : 'bg-purple-500 border-purple-500'
                      : darkMode
                        ? 'border-gray-600 hover:border-cyan-400'
                        : 'border-gray-300 hover:border-purple-400'
                  }`}
                >
                  {localField.required && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </label>
              </div>
              <label htmlFor="required" className="text-sm font-medium cursor-pointer">
                Required field
              </label>
            </div>
            
            {/* Help Text */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Help Text
              </label>
              <textarea
                value={localField.helpText || ''}
                onChange={(e) => setLocalField({ ...localField, helpText: e.target.value })}
                rows={3}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 resize-none ${
                  darkMode 
                    ? 'bg-gray-800 bg-opacity-50 border-gray-600 border-opacity-50 focus:border-cyan-500 focus:ring-cyan-500 focus:ring-opacity-20' 
                    : 'bg-gray-50 bg-opacity-50 border-gray-300 border-opacity-50 focus:border-purple-500 focus:ring-purple-500 focus:ring-opacity-20'
                }`}
                placeholder="Optional help text for users..."
              />
            </div>

            {/* Field Type Selector */}
            {localField.type === 'signature' && (
  <div className="text-sm italic text-center mt-2 text-purple-400">
    Users will be able to draw their signature on this field.
  </div>
)}
{localField.type === 'captcha' && (
  <>
    <div className="space-y-2">
      <label className="text-sm font-medium">Captcha Question</label>
      <input
        type="text"
        value={localField.question || ''}
        onChange={(e) => setLocalField({ ...localField, question: e.target.value })}
        className="w-full px-4 py-2 border rounded-lg"
        placeholder="e.g. 5 + 2 = ?"
      />
    </div>
    <div className="space-y-2">
      <label className="text-sm font-medium">Expected Answer</label>
      <input
        type="text"
        value={localField.answer || ''}
        onChange={(e) => setLocalField({ ...localField, answer: e.target.value })}
        className="w-full px-4 py-2 border rounded-lg"
        placeholder="e.g. 7"
      />
    </div>
  </>
)}
{localField.type === 'address' && (
  <div className="text-sm italic text-center mt-2 text-purple-400">
    Address field includes street, city, state, and zip code sub-fields.
  </div>
)}

{localField.type === 'time' && (
  <div className="text-sm italic text-center mt-2 text-purple-400">
    Time input with hour and minute fields.
  </div>
)}

{localField.type === 'rating' && (
  <div className="text-sm italic text-center mt-2 text-yellow-400">
    5-star rating component.
  </div>
)}
{localField.type === 'fullname' && (
  <div className="text-sm italic text-center mt-2 text-blue-400">
    Includes First and Last name inputs.
  </div>
)}
{localField.type === 'matrix' && (
  <>
    <div className="space-y-2">
      <label className="block text-sm font-medium">Rows</label>
      <textarea
        rows={2}
        placeholder="Enter each row on a new line"
        value={localField.rows?.join('\n') || ''}
        onChange={(e) =>
          setLocalField({
            ...localField,
            rows: e.target.value.split('\n'),
          })
        }
        className={`w-full px-4 py-3 rounded-xl border transition-all resize-none duration-200 focus:outline-none focus:ring-2 ${
          darkMode
            ? 'bg-gray-800 bg-opacity-50 border-gray-600 focus:border-cyan-500 focus:ring-cyan-500'
            : 'bg-gray-50 border-gray-300 focus:border-purple-500 focus:ring-purple-500'
        }`}
      />
    </div>

    <div className="space-y-2 mt-4">
      <label className="block text-sm font-medium">Columns</label>
      <textarea
        rows={2}
        placeholder="Enter each column on a new line"
        value={localField.columns?.join('\n') || ''}
        onChange={(e) =>
          setLocalField({
            ...localField,
            columns: e.target.value.split('\n'),
          })
        }
        className={`w-full px-4 py-3 rounded-xl border transition-all resize-none duration-200 focus:outline-none focus:ring-2 ${
          darkMode
            ? 'bg-gray-800 bg-opacity-50 border-gray-600 focus:border-cyan-500 focus:ring-cyan-500'
            : 'bg-gray-50 border-gray-300 focus:border-purple-500 focus:ring-purple-500'
        }`}
      />
    </div>

    <div className="flex items-center space-x-3 pt-2">
      <input
        type="checkbox"
        id="allowComment"
        checked={localField.allowComment || false}
        onChange={(e) =>
          setLocalField({ ...localField, allowComment: e.target.checked })
        }
      />
      <label htmlFor="allowComment" className="text-sm">
        Allow comment box below table
      </label>
    </div>
  </>
)}
{['image-upload', 'image-capture'].includes(localField.type) && (
  <div className="space-y-2 text-sm">
    <label className="block font-medium">Accepted File Types</label>
    <input
      type="text"
      placeholder="e.g. image/* or image/png,image/jpeg"
      value={localField.accept || ''}
      onChange={(e) =>
        setLocalField({ ...localField, accept: e.target.value })
      }
      className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 ${
        darkMode
          ? 'bg-gray-800 border-gray-600 focus:ring-cyan-500'
          : 'bg-gray-50 border-gray-300 focus:ring-purple-500'
      }`}
    />
    {localField.type === 'image-upload' && (
  <div className="space-y-4 mt-2">
    <div>
      <label className="block font-medium">Maximum Number of Files</label>
      <input
        type="number"
        value={localField.maxFiles || 1}
        onChange={(e) =>
          setLocalField({
            ...localField,
            maxFiles: parseInt(e.target.value),
          })
        }
        className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 ${
          darkMode
            ? 'bg-gray-800 border-gray-600 focus:ring-cyan-500'
            : 'bg-gray-50 border-gray-300 focus:ring-purple-500'
        }`}
      />
    </div>

    {/* Static Image Upload & Preview */}
    <div className="space-y-2">
      <label className="block text-sm font-medium">Static Image Upload</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
              setLocalField({ ...localField, imageSrc: reader.result });
            };
            reader.readAsDataURL(file);
          }
        }}
        className="block w-full text-sm text-gray-500"
      />
      {localField.imageSrc && (
        <img
          src={localField.imageSrc}
          alt="Preview"
          className="mt-2 max-w-full max-h-40 rounded-lg shadow-md"
        />
      )}
    </div>
  </div>
)}
</div>
)}


{localField.type === 'qr' && (
  <div className="text-sm italic text-center mt-2 text-green-400">
    This field allows QR or barcode scanning via camera.
  </div>
)}


            
            {/* Options Section */}
          { (['select', 'radio', 'checkbox'].includes(localField.type)) && (

              <div className="space-y-3">
                <label className={`block text-sm font-medium ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Options
                </label>
                <div className="space-y-3">
                  {localField.options?.map((option, index) => (
                    <div key={index} className="group flex items-center space-x-3">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        className={`flex-1 px-4 py-2.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
                          darkMode 
                            ? 'bg-gray-800 bg-opacity-50 border-gray-600 border-opacity-50 focus:border-cyan-500 focus:ring-cyan-500 focus:ring-opacity-20' 
                            : 'bg-gray-50 bg-opacity-50 border-gray-300 border-opacity-50 focus:border-purple-500 focus:ring-purple-500 focus:ring-opacity-20'
                        }`}
                      />
                      <button
                        onClick={() => removeOption(index)}
                        className={`p-2.5 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 ${
                          darkMode
                            ? 'text-red-400 hover:bg-red-500 hover:bg-opacity-20 hover:text-red-300'
                            : 'text-red-500 hover:bg-red-500 hover:bg-opacity-10 hover:text-red-600'
                        }`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  
                  <button
                    onClick={addOption}
                    className={`w-full py-3 px-4 border-2 border-dashed rounded-xl transition-all duration-200 font-medium ${
                      darkMode 
                        ? 'border-gray-600 border-opacity-50 hover:border-purple-500 hover:border-opacity-50 text-purple-400 hover:bg-purple-500 hover:bg-opacity-5' 
                        : 'border-gray-300 border-opacity-50 hover:border-purple-500 hover:border-opacity-50 text-purple-600 hover:bg-purple-500 hover:bg-opacity-5'
                    }`}
                  >
                    <Plus size={16} className="inline mr-2" />
                    Add Option
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className={`px-6 py-4 border-t flex space-x-3 flex-shrink-0 ${
          darkMode ? 'border-gray-700 border-opacity-50 bg-gray-900 bg-opacity-50' : 'border-gray-200 border-opacity-50 bg-gray-50 bg-opacity-50'
        }`}>
          <button
            onClick={handleSave}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg ${
              darkMode 
                ? 'bg-purple-600 text-white' 
                : 'bg-purple-600 text-white'
            }`}
          >
            Save Changes
          </button>
          <button
            onClick={onClose}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 ${
              darkMode 
                ? 'bg-gray-700 bg-opacity-50 hover:bg-gray-700 hover:bg-opacity-70 text-gray-300 border border-gray-600 border-opacity-50' 
                : 'bg-gray-100 bg-opacity-50 hover:bg-gray-200 hover:bg-opacity-50 text-gray-700 border border-gray-300 border-opacity-50'
            }`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default FieldEditor;