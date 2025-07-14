import { useState, useEffect } from "react";
import { Moon, Sun, ArrowRight, CheckCircle, Clock, User } from "lucide-react";
import { useNavigate } from "@remix-run/react";
import SignatureCanvas from 'react-signature-canvas';
import { Html5Qrcode}  from "html5-qrcode";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const FormFiller = ({ formId, initialDarkMode = false }) => {
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState({});
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [darkMode, setDarkMode] = useState(initialDarkMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseId, setResponseId] = useState(null);
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [savedResponses, setSavedResponses] = useState(null);
  const navigate = useNavigate();
const [activeScannerField, setActiveScannerField] = useState(null);

  useEffect(() => {
    try {
      const sharedForms = JSON.parse(localStorage.getItem('sharedForms') || '{}');
      const foundForm = sharedForms[formId];
      if (foundForm) {
        setForm(foundForm);
        
        // Check for saved progress
        const savedProgress = JSON.parse(localStorage.getItem('formFillerProgress') || '{}');
        if (savedProgress[formId]) {
          setSavedResponses(savedProgress[formId]);
          // Ask user if they want to restore progress
          if (window.confirm('You have a saved form in progress. Would you like to restore it?')) {
            setResponses(savedProgress[formId]);
          } else {
            // If user declines, remove the saved progress
            const updatedProgress = { ...savedProgress };
            delete updatedProgress[formId];
            localStorage.setItem('formFillerProgress', JSON.stringify(updatedProgress));
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load form or saved progress:', error);
    }
  }, [formId]);

  // Auto-save responses as user fills the form
  useEffect(() => {
    if (!form || Object.keys(responses).length === 0) return;
    
    const autoSave = setTimeout(() => {
      try {
        const savedProgress = JSON.parse(localStorage.getItem('formFillerProgress') || '{}');
        savedProgress[formId] = responses;
        localStorage.setItem('formFillerProgress', JSON.stringify(savedProgress));
        
        // Show save notification
        setShowSaveNotification(true);
        
        setTimeout(() => {
          setShowSaveNotification(false);
        }, 3000);
      } catch (error) {
        console.warn('Auto-save failed:', error);
      }
    }, 2000); // Auto-save after 2 seconds of inactivity
    
    return () => clearTimeout(autoSave);
  }, [responses, formId, form]);
  useEffect(() => {
  if (!activeScannerField) return;

  const scannerId = `qr-scanner-${activeScannerField.id}`;
  const qrScanner = new Html5Qrcode(scannerId);

  qrScanner.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    (decodedText) => {
      handleInputChange(activeScannerField.id, decodedText);
      qrScanner.stop().then(() => {
        console.log("QR Scanner stopped after successful read");
        setActiveScannerField(null); // stop scanning after success
      });
    },
    (errMsg) => {
      // console.debug("QR scan error:", errMsg);
    }
  ).catch(err => {
    console.error("QR scanner init failed:", err);
  });

  return () => {
    qrScanner.stop().catch(() => {});
  };
}, [activeScannerField]);


  const generateResponseId = () => {
    return 'resp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  const validateField = (field, value) => {
    if (field.required && (!value || value.toString().trim() === '')) {
      return `${field.label} is required`;
    }
    
    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email address';
      }
    }
   if (field.type === 'phone' && value) {
  const phoneRegex = /^\+?\d{10,15}$/; // allows 10–15 digits, optional +
  if (!phoneRegex.test(value.replace(/\s+/g, ''))) {
    return 'Enter a valid phone number';
  }
}


    
    if (field.type === 'captcha' && field.answer) {
  const expected = field.answer.toString().trim().toLowerCase();
  const actual = (value || '').toString().trim().toLowerCase();
  if (actual !== expected) {
    return 'Incorrect CAPTCHA answer';
  }
}


    
    return null;
  };

  const calculateProgress = () => {
    if (!form || form.fields.length === 0) return 0;
    const filledFields = form.fields.filter(field => {
      const value = responses[field.id];
      return value && value.toString().trim() !== '';
    }).length;
    return Math.round((filledFields / form.fields.length) * 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const newErrors = {};
    form.fields.forEach(field => {
      const error = validateField(field, responses[field.id]);
      if (error) {
        newErrors[field.id] = error;
      }
    });
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      // Generate unique response ID
      const uniqueResponseId = generateResponseId();
      setResponseId(uniqueResponseId);
      
      try {
        const formResponses = JSON.parse(localStorage.getItem('formResponses') || '{}');
        if (!formResponses[formId]) {
          formResponses[formId] = [];
        }
        
        const responseData = {
          id: uniqueResponseId,
          timestamp: new Date().toISOString(),
          formTitle: form.title,
          responses: responses,
          submittedAt: new Date().toLocaleString(),
          status: 'completed'
        };
        
        formResponses[formId].push(responseData);
        localStorage.setItem('formResponses', JSON.stringify(formResponses));
        
        const savedProgress = JSON.parse(localStorage.getItem('formFillerProgress') || '{}');
        delete savedProgress[formId];
        localStorage.setItem('formFillerProgress', JSON.stringify(savedProgress));
      } catch (error) {
        console.warn('Failed to save response or clear progress:', error);
      }
      
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitted(true);
      }, 1500);
    } else {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (fieldId, value) => {
    setResponses(prev => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: null }));
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  

  const renderFormField = (field) => {
    const baseInputClasses = `w-full p-4 border-2 rounded-xl transition-all duration-200 ${
      errors[field.id]
        ? 'border-red-500 focus:border-red-500 bg-red-50'
        : darkMode 
          ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-cyan-500 hover:border-gray-500' 
          : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500 hover:border-gray-400'
    } focus:outline-none focus:ring-4 focus:ring-opacity-20 ${
      darkMode ? 'focus:ring-cyan-500' : 'focus:ring-purple-500'
    }`;

    switch (field.type) {
  case 'text':
    return (
      <input
        type="text"
        value={responses[field.id] || ''}
        onChange={(e) => handleInputChange(field.id, e.target.value)}
        placeholder={field.placeholder || ''}
        className={`w-full p-3 rounded-md border ${
          darkMode
            ? 'bg-gray-700 text-white border-gray-600'
            : 'bg-white text-gray-800 border-gray-300'
        }`}
      />
    );

  case 'email':
    return (
      <input
        type="email"
        value={responses[field.id] || ''}
        onChange={(e) => handleInputChange(field.id, e.target.value)}
        placeholder={field.placeholder || 'Enter email'}
        className={`w-full p-3 rounded-md border ${
          darkMode
            ? 'bg-gray-700 text-white border-gray-600'
            : 'bg-white text-gray-800 border-gray-300'
        }`}
        required
      />
    );

      case 'phone':
  return (
    <div className="space-y-2">
      <PhoneInput
        country={'in'}
        value={responses[field.id] || ''}
        onChange={(phone, data) => {
          handleInputChange(field.id, phone); // full number
          handleInputChange(`${field.id}_countryCode`, data.dialCode); // store country code separately
        }}
        inputClass={darkMode 
          ? 'bg-gray-700 text-white border border-gray-600 w-full p-3 rounded-md' 
          : 'bg-white text-gray-800 border border-gray-300 w-full p-3 rounded-md'}
        containerStyle={{ width: '100%' }}
        inputStyle={{ width: '100%' }}
        enableSearch
        masks={{ in: '(...) ...-....' }}
        placeholder="Enter phone number"
        isValid={(value, country) => {
          const digits = value.replace(/\D/g, '');
          return digits.length === 10;
        }}
      />
      {responses[`${field.id}_countryCode`] && (
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Country Code: +{responses[`${field.id}_countryCode`]}
        </p>
      )}
    </div>
  );


      
      case 'textarea':
        return (
          <textarea
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            value={responses[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={`${baseInputClasses} h-32 resize-none`}
            required={field.required}
          />
        );
      
      case 'select':
        return (
          <select
            value={responses[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={baseInputClasses}
            required={field.required}
          >
            <option value="">Choose an option</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        );
      
      case 'checkbox':
        return (
          <div className="space-y-3">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={(responses[field.id] || []).includes(option)}
                  onChange={(e) => {
                    const currentValues = responses[field.id] || [];
                    const newValues = e.target.checked
                      ? [...currentValues, option]
                      : currentValues.filter(v => v !== option);
                    handleInputChange(field.id, newValues);
                  }}
                  className="w-5 h-5 text-purple-600 rounded border-2 border-gray-300 focus:ring-2 focus:ring-purple-500"
                />
                <span className={`${darkMode ? 'text-gray-300 group-hover:text-white' : 'text-gray-700 group-hover:text-gray-900'} transition-colors`}>
                  {option}
                </span>
              </label>
            ))}
          </div>
        );
      
      case 'radio':
        return (
          <div className="space-y-3">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={responses[field.id] === option}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className="w-5 h-5 text-purple-600 border-2 border-gray-300 focus:ring-2 focus:ring-purple-500"
                />
                <span className={`${darkMode ? 'text-gray-300 group-hover:text-white' : 'text-gray-700 group-hover:text-gray-900'} transition-colors`}>
                  {option}
                </span>
              </label>
            ))}
          </div>
        );
      
      case 'date':
        return (
          <input
            type="date"
            value={responses[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={baseInputClasses}
            required={field.required}
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            value={responses[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={baseInputClasses}
            required={field.required}
          />
        );
        case 'file':
  return (
    <input
      type="file"
      accept={field.accept || '*'}
      onChange={(e) => {
        const file = e.target.files[0];
        if (file) {
          handleInputChange(field.id, file.name); // or store as base64 if needed
        }
      }}
      className={baseInputClasses}
      required={field.required}
    />
  );
case 'signature':
  return (
    <div className="space-y-2">
      <SignatureCanvas
        penColor={darkMode ? "cyan" : "black"}
        canvasProps={{ width: 400, height: 150, className: "border rounded-xl" }}
        ref={(ref) => {
          if (ref && !responses[field.id]) {
            ref.clear();
          }
          field._sigRef = ref;
        }}
        onEnd={() => {
          const sigData = field._sigRef?.toDataURL();
          handleInputChange(field.id, sigData);
        }}
      />
      <button
        type="button"
        onClick={() => {
          field._sigRef?.clear();
          handleInputChange(field.id, '');
        }}
        className="text-sm text-red-500 underline"
      >
        Clear Signature
      </button>
    </div>
  );
  case 'captcha': {
  const question = field.question || '3 + 4 = ?';
  const expectedAnswer = field.answer || '7';

  return (
    <div className="flex flex-col items-start space-y-2">
      <div className={`p-4 rounded-md border text-sm font-semibold select-none ${
        darkMode 
          ? 'bg-gray-700 border-gray-600 text-gray-200' 
          : 'bg-gray-100 border-gray-300 text-gray-800'
      }`}>
        Please solve: <span className="ml-2 font-mono">{question}</span>
      </div>
      <input
        type="text"
        value={responses[field.id] || ''}
        onChange={(e) => handleInputChange(field.id, e.target.value)}
        placeholder="Enter answer"
        className={baseInputClasses}
      />
    </div>
  );
}
case 'address':
  return (
    <div className="space-y-3">
      {['Street', 'City', 'State', 'Zip'].map((part) => {
        const key = part.toLowerCase();
        return (
          <input
            key={key}
            type="text"
            placeholder={`${part}...`}
            value={responses[field.id]?.[key] || ''}
            onChange={(e) => handleInputChange(field.id, {
              ...responses[field.id],
              [key]: e.target.value
            })}
            className={baseInputClasses}
          />
        );
      })}
    </div>
  );
case 'time':
  return (
    <input
      type="time"
      value={responses[field.id] || ''}
      onChange={(e) => handleInputChange(field.id, e.target.value)}
      className={baseInputClasses}
      required={field.required}
    />
  );
case 'rating':
  return (
    <div className="flex items-center space-x-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleInputChange(field.id, star)}
          className={`text-2xl transition-all ${
            responses[field.id] >= star 
              ? 'text-yellow-400' 
              : darkMode ? 'text-gray-600' : 'text-gray-300'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );  
  case 'fullname':
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {['firstName', 'lastName'].map((part) => (
        <input
          key={part}
          type="text"
          placeholder={part === 'firstName' ? 'First Name' : 'Last Name'}
          value={responses[field.id]?.[part] || ''}
          onChange={(e) =>
            handleInputChange(field.id, {
              ...responses[field.id],
              [part]: e.target.value
            })
          }
          className={baseInputClasses}
        />
      ))}
    </div>
  );
case 'matrix':
  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full text-sm border rounded-xl ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
        <thead>
          <tr>
            <th className="px-4 py-2"></th>
            {field.columns?.map((col, colIdx) => (
              <th key={colIdx} className="px-4 py-2 text-center">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {field.rows?.map((rowLabel, rowIdx) => (
            <tr key={rowIdx}>
              <td className="px-4 py-2 font-medium">{rowLabel}</td>
              {field.columns?.map((colLabel, colIdx) => {
                const cellKey = `${rowLabel}_${colLabel}`;
                return (
                  <td key={colIdx} className="px-4 py-2 text-center">
                    <input
                      type="radio"
                      name={`${field.id}_${rowLabel}`}
                      value={colLabel}
                      checked={responses[field.id]?.[rowLabel] === colLabel}
                      onChange={() =>
                        handleInputChange(field.id, {
                          ...responses[field.id],
                          [rowLabel]: colLabel,
                        })
                      }
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

case 'image-upload':
  return (
    <div className="space-y-2">
      {field.imageSrc || responses[field.id] ? (
        <img
          src={responses[field.id] || field.imageSrc}
          alt="Uploaded"
          className="w-48 h-auto rounded shadow"
        />
      ) : (
        <p className="text-sm text-gray-400 italic">No image uploaded</p>
      )}
    </div>
  );


case 'image-capture':
  return (
    <div className="space-y-2">
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
              handleInputChange(field.id, reader.result);
            };
            reader.readAsDataURL(file);
          }
        }}
        className={baseInputClasses}
      />
      {responses[field.id] && (
        <img src={responses[field.id]} alt="Captured" className="w-48 h-auto rounded shadow" />
      )}
    </div>
  );
case 'barcode':
case 'qr': {
  const scannerId = `qr-scanner-${field.id}`;

  return (
    <div className="space-y-2">
      <div className="w-full h-64 border-2 rounded-xl" id={scannerId}></div>
      <button
        type="button"
        onClick={() => setActiveScannerField(field)}
        className="mt-2 px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700"
      >
        {activeScannerField?.id === field.id ? 'Scanning...' : 'Start Scanner'}
      </button>
    </div>
  );
}


      default:
        return <div className="text-red-500">Unknown field type: {field.type}</div>;
    }
  };

  if (!form) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100' : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900'
      }`}>
        <div className="text-center">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
            darkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'
          }`}>
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-4">Form Not Found</h2>
          <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            The form you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100' : 'bg-gradient-to-br from-purple-50 to-cyan-50 text-gray-900'
      }`}>
        <div className={`max-w-lg w-full mx-4 p-8 rounded-2xl text-center shadow-2xl ${
          darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
            darkMode ? 'bg-green-800 text-green-400' : 'bg-green-100 text-green-600'
          } animate-pulse`}>
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Thank You!</h2>
          <p className={`text-lg mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Your response has been submitted successfully.
          </p>
          {responseId && (
            <div className={`p-4 rounded-lg mb-6 ${
              darkMode ? 'bg-gray-700 border border-gray-600' : 'bg-gray-50 border border-gray-200'
            }`}>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Response ID:</p>
              <p className={`font-mono text-sm ${darkMode ? 'text-cyan-400' : 'text-purple-600'}`}>
                {responseId}
              </p>
            </div>
          )}
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Submitted on {new Date().toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  }

  const progress = calculateProgress();

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100' : 'bg-gradient-to-br from-purple-50 to-cyan-50 text-gray-900'
    }`}>
      {/* Header with dark mode toggle */}
      <div className={`sticky top-0 z-10 backdrop-blur-xl border-b ${
        darkMode ? 'bg-gray-900/80 border-gray-700' : 'bg-gray-100 border-gray-200'
      }`}>
        <div className="max-w-8xl px-5 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              darkMode ? 'bg-gray-800' : 'bg-white shadow-sm'
            }`}>
              <User className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">{form.title}</h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {progress}% Complete
              </p>
            </div>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`p-3 rounded-xl transition-all duration-200 ${
              darkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
        
        {/* Progress Bar */}
        <div className={`w-full h-1 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
          <div 
            className={`h-full transition-all duration-500 ${
              darkMode ? 'bg-white' : 'bg-gradient-to-r from-purple-500 to-pink-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className={`rounded-2xl p-8 backdrop-blur-sm ${
          darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-white/50'
        }`}>
          {form.description && (
            <div className="mb-8">
              <p className={`text-lg leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {form.description}
              </p>
            </div>
          )}

          <div className="space-y-8">
            {form.fields.map((field, index) => (
              <div key={field.id} className="group">
                <label className={`block text-lg font-semibold mb-3 transition-colors ${
                  darkMode ? 'text-gray-200 group-hover:text-white' : 'text-gray-800 group-hover:text-gray-900'
                }`}>
                  <span className="flex items-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium mr-3 ${
                      responses[field.id] && responses[field.id].toString().trim() !== ''
                        ? darkMode ? 'bg-cyan-600 text-white' : 'bg-purple-600 text-white'
                        : darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {responses[field.id] && responses[field.id].toString().trim() !== '' ? '✓' : index + 1}
                    </span>
                    {field.label}
                    {field.required && <span className="text-red-500 ml-2">*</span>}
                  </span>
                </label>
                
                <div className="ml-11">
                  {renderFormField(field)}
                  
                  {errors[field.id] && (
                    <div className="flex items-center mt-2 text-red-500">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm font-medium">{errors[field.id]}</p>
                    </div>
                  )}
                  
                  {field.helpText && (
                    <p className={`text-sm mt-2 ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      💡 {field.helpText}
                    </p>
                  )}
                </div>
              </div>
            ))}

            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`w-full py-4 px-8 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-3 ${
                  isSubmitting
                    ? 'opacity-50 cursor-not-allowed'
                    : darkMode 
                      ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1' 
                      : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Form</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Auto-save Notification */}
      <div className={`fixed bottom-4 left-4 transform transition-all duration-500 z-50 ${
        showSaveNotification 
          ? 'translate-y-0 opacity-100' 
          : 'translate-y-full opacity-0 pointer-events-none'
      }`}>
        <div className={`px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 ${
          darkMode 
            ? 'bg-gray-800 border border-gray-600 text-gray-200' 
            : 'bg-white border border-gray-200 text-gray-800'
        }`}>
          <div className={`w-2 h-2 rounded-full animate-pulse ${
            darkMode ? 'bg-green-400' : 'bg-green-500'
          }`}></div>
          <span className="text-sm font-medium">Progress auto-saved</span>
          <div className={`text-xs px-2 py-1 rounded ${
            darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
          }`}>
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormFiller;