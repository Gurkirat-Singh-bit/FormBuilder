import { useEffect, useState } from 'react';

const FormFieldPreview = ({ field, darkMode }) => {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const baseInputClasses = `w-full p-3 border rounded-lg transition-all ${
    darkMode 
      ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-cyan-500' 
      : 'bg-white/70 border-[#c0e6e9]/50 text-gray-900 focus:border-purple-500 backdrop-blur-sm'
  } placeholder-gray-400 shadow-sm`;

  if (!isMounted) {
    return <div className={`${baseInputClasses} h-10`}></div>;
  }

  switch (field.type) {
    case 'text':
    case 'email':
    case 'phone':
      return (
        <input
          type={field.type}
          placeholder={field.placeholder}
          className={baseInputClasses}
          disabled
        />
      );
    
    case 'textarea':
      return (
        <textarea
          placeholder={field.placeholder}
          className={`${baseInputClasses} h-24 resize-none`}
          disabled
        />
      );
    
    case 'select':
      return (
        <div className="relative">
          <select className={`${baseInputClasses} appearance-none`} disabled>
            <option>{field.placeholder || "Choose an option"}</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
            <svg className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      );
    
    case 'checkbox':
      return (
        <div className="space-y-3">
          {field.options?.map((option, index) => (
            <label key={index} className="flex items-center space-x-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                darkMode 
                  ? 'border-gray-500 bg-gray-700' 
                  : 'border-[#c0e6e9]/70 bg-white/50'
              }`}>
                {/* Empty checkbox */}
              </div>
              <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{option}</span>
            </label>
          ))}
        </div>
      );
    
    case 'radio':
      return (
        <div className="space-y-3">
          {field.options?.map((option, index) => (
            <label key={index} className="flex items-center space-x-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                darkMode 
                  ? 'border-gray-500 bg-gray-700' 
                  : 'border-[#c0e6e9]/70 bg-white/50'
              }`}>
                {/* Empty radio button */}
              </div>
              <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{option}</span>
            </label>
          ))}
        </div>
      );
    
    case 'date':
      return (
        <div className="relative">
          <input
            type="text"
            placeholder="Select date"
            className={baseInputClasses}
            disabled
          />
          <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
            <svg className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      );
    
    case 'number':
      return (
        <input
          type="number"
          placeholder={field.placeholder}
          className={baseInputClasses}
          disabled
        />
      );

          case 'file':
      return (
        <div className="relative">
          <input
            type="file"
            disabled
            className={baseInputClasses}
          />
        </div>
      );

    case 'signature':
      return (
        <div className={`w-full h-40 border-2 border-dashed rounded-lg flex items-center justify-center ${
          darkMode
            ? 'border-gray-600 bg-gray-700 text-gray-400'
            : 'border-[#c0e6e9]/70 bg-white/50 text-gray-600'
        }`}>
          <span>Signature Pad (Preview)</span>
        </div>
      );
     case 'captcha':
  return (
    <div
      className={`w-full px-4 py-3 rounded-lg border text-sm flex items-center justify-between ${
        darkMode
          ? 'border-gray-600 bg-gray-700 text-gray-300'
          : 'border-[#c0e6e9]/60 bg-white/50 text-gray-700'
      }`}
    >
      <span>I’m not a robot</span>
      <div
        className={`w-5 h-5 rounded-sm border flex items-center justify-center ${
          darkMode ? 'border-gray-400 bg-gray-800' : 'border-gray-400 bg-white'
        }`}
      >
        <svg
          className={`w-3 h-3 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          viewBox="0 0 24 24"
        >
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
case 'address':
  return (
    <div className="space-y-2">
      <input
        type="text"
        placeholder="Street Address"
        className={baseInputClasses}
        disabled
      />
      <input
        type="text"
        placeholder="Street Address Line 2"
        className={baseInputClasses}
        disabled
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          placeholder="City"
          className={baseInputClasses}
          disabled
        />
        <input
          type="text"
          placeholder="State / Province"
          className={baseInputClasses}
          disabled
        />
      </div>
      <input
        type="text"
        placeholder="Postal / Zip Code"
        className={baseInputClasses}
        disabled
      />
    </div>
  );
case 'time':
  return (
    <div className="grid grid-cols-2 gap-4">
      <input
        type="number"
        placeholder="HH"
        className={baseInputClasses}
        disabled
      />
      <input
        type="number"
        placeholder="MM"
        className={baseInputClasses}
        disabled
      />
    </div>
  );
case 'rating':
  return (
    <div className="flex space-x-1">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-6 h-6 ${
            darkMode ? 'text-yellow-400' : 'text-yellow-500'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.975a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.39 2.463a1 1 0 00-.364 1.118l1.287 3.975c.3.921-.755 1.688-1.54 1.118l-3.39-2.463a1 1 0 00-1.176 0l-3.39 2.463c-.784.57-1.838-.197-1.539-1.118l1.286-3.975a1 1 0 00-.364-1.118L2.045 9.402c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.975z" />
        </svg>
      ))}
    </div>
  );
case 'fullname':
  return (
    <div className="grid grid-cols-2 gap-4">
      <input
        type="text"
        placeholder="First Name"
        className={baseInputClasses}
        disabled
      />
      <input
        type="text"
        placeholder="Last Name"
        className={baseInputClasses}
        disabled
      />
    </div>
  );
case 'matrix':
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border border-collapse rounded-lg overflow-hidden">
        <thead>
          <tr>
            <th className="p-2 border">Question</th>
            {field.columns?.map((col, colIdx) => (
              <th key={colIdx} className="p-2 border">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {field.rows?.map((row, rowIdx) => (
            <tr key={rowIdx}>
              <td className="p-2 border">{row}</td>
              {field.columns?.map((_, colIdx) => (
                <td key={colIdx} className="p-2 border text-center">
                  <div className="w-4 h-4 rounded-full border inline-block" />
                </td>
              ))}
            </tr>
          ))}
          {field.allowComment && (
            <tr>
              <td className="p-2 border font-medium" colSpan={1}>Any thoughts?</td>
              <td className="p-2 border" colSpan={field.columns?.length}>
                <textarea disabled placeholder="Write here..." className={`${baseInputClasses} h-20 resize-none`} />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
case 'image-upload':
  return (
    <div className="space-y-2">
      <input
        type="file"
        accept={field.accept || 'image/*'}
        multiple={field.maxFiles > 1}
        disabled
        className={baseInputClasses}
      />
     {field.imageSrc && (
        <div>
          <p className="text-xs text-gray-400">Uploaded image preview</p>
          <img
            src={field.imageSrc}
            alt="Preview"
            className="mt-1 max-w-full max-h-40 rounded-lg shadow-md"
          />
        </div>
      )}
    </div>
  );

case 'image-capture':
  return (
    <div>
      <input
        type="file"
        accept={field.accept || 'image/*'}
        capture="environment"
        disabled
        className={baseInputClasses}
      />
    </div>
  );
case 'qr':
  return (
    <div className={`w-full p-4 rounded-lg border text-sm flex items-center justify-between ${
      darkMode
        ? 'border-gray-600 bg-gray-700 text-gray-300'
        : 'border-[#c0e6e9]/60 bg-white/50 text-gray-700'
    }`}>
      <span>Scan QR / Barcode</span>
      <svg
        className={`w-6 h-6 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M3 3h6v6H3V3zm12 0h6v6h-6V3zM3 15h6v6H3v-6zm12 0h6v6h-6v-6z" />
      </svg>
    </div>
  );

    
    default:
      return <div>Unknown field type</div>;
  }
};

export default FormFieldPreview;