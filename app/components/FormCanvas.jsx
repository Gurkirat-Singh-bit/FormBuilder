import { useState, useEffect } from 'react';
import { Trash2, GripVertical, Edit, Plus } from 'lucide-react';

const FormCanvas = ({ form, dispatch, selectedField, setSelectedField, darkMode }) => {
  const [draggedOver, setDraggedOver] = useState(null);
  const [isBrowser, setIsBrowser] = useState(false);
  
  useEffect(() => {
    setIsBrowser(true);
  }, []);
  
  const handleDragOver = (e) => {
    if (!isBrowser) return;
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e) => {
    if (!isBrowser) return;
    e.preventDefault();
    e.stopPropagation();
    
    const fieldType = e.dataTransfer.getData('fieldType');
    if (fieldType) {
      const newField = {
        id: Date.now().toString(),
        type: fieldType,
        label: getDefaultLabel(fieldType),
        required: false,
        placeholder: '',
        options: getDefaultOptions(fieldType)
      };
      if (fieldType === 'captcha') {
  const a = Math.floor(Math.random() * 10);
  const b = Math.floor(Math.random() * 10);
  newField.question = `${a} + ${b} = ?`;
  newField.correctAnswer = (a + b).toString();
}
if (fieldType === 'address') {
  newField.fields = {
    street1: '',
    street2: '',
    city: '',
    state: '',
    zip: ''
  };
}

if (fieldType === 'time') {
  newField.fields = {
    hour: '',
    minute: ''
  };
}
if (fieldType === 'fullname') {
  newField.fields = {
    firstName: '',
    lastName: ''
  };
}

if (fieldType === 'matrix') {
  newField.rows = ['Service Quality', 'Cleanliness', 'Responsiveness', 'Friendliness'];
  newField.columns = ['Not Satisfied', 'Somewhat Satisfied', 'Satisfied'];
  newField.allowComment = true;
}

if (fieldType === 'image-upload') {
  newField.maxFiles = 1;
  newField.accept = 'image/*';
}

if (fieldType === 'image-capture') {
  newField.capture = true;
  newField.accept = 'image/*';
}

if (fieldType === 'qr') {
  newField.qrType = 'barcode'; // or 'qr'
}

      
      dispatch({
        type: 'ADD_FIELD',
        payload: newField
      });
    }
    
    setDraggedOver(null);
  };
  
  const getDefaultLabel = (type) => {
    const labels = {
      text: 'Text Field',
      textarea: 'Text Area',
      select: 'Select Field',
      checkbox: 'Checkbox Group',
      radio: 'Radio Group',
      date: 'Date Field',
      email: 'Email Field',
      phone: 'Phone Field',
      number: 'Number Field',
      file: 'File Upload',
      signature: 'Signature Pad',
      captcha: 'Captcha Challenge',
      address: 'Address',
    time: 'Time',
    rating: 'Star Rating',
    fullname: 'Full Name',
    matrix: 'Satisfaction Table',
    'image-upload': 'Image Upload',
    'image-capture': 'Image Capture',
    qr: 'QR / Barcode Scanner'
    };
    
    return labels[type] || 'New Field';
  };
  
  const getDefaultOptions = (type) => {
    if (type === 'select' || type === 'checkbox' || type === 'radio') {
      return ['Option 1', 'Option 2', 'Option 3'];
    }
    return null;
  };
  
  const handleFieldDragStart = (e, index) => {
    if (!isBrowser) return;
    e.dataTransfer.setData('fieldIndex', index);
  };
  
  const handleFieldDragOver = (e, index) => {
    if (!isBrowser) return;
    e.preventDefault();
    setDraggedOver(index);
  };
  
  const handleFieldDragLeave = () => {
    if (!isBrowser) return;
    setDraggedOver(null);
  };
  
  const handleFieldDrop = (e, dropIndex) => {
    if (!isBrowser) return;
    e.preventDefault();
    
    const dragIndex = e.dataTransfer.getData('fieldIndex');
    if (dragIndex !== '') {
      dispatch({
        type: 'REORDER_FIELDS',
        payload: {
          source: parseInt(dragIndex),
          destination: dropIndex
        }
      });
    } else {
      // Handle dropping a new field from the palette
      handleDrop(e);
    }
    
    setDraggedOver(null);
  };
  
  const handleDeleteField = (fieldId) => {
    dispatch({
      type: 'DELETE_FIELD',
      payload: fieldId
    });
  };
  
  const handleEditField = (field) => {
    setSelectedField(field);
  };
  
  return (
    <div 
      className={`flex-1 overflow-y-auto p-6 ${
        darkMode ? 'bg-gray-800' : 'bg-white/60 backdrop-blur-md'
      }`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="max-w-3xl mx-auto">
        <div className={`mb-6 p-6 rounded-xl border ${
          darkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-gray-200/30 border-white/30 backdrop-blur-sm shadow-md'
        }`}>
          <h2 className={`text-xl font-bold mb-2 ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>
            {form.title || 'Untitled Form'}
          </h2>
          
          <textarea
            value={form.description}
            onChange={(e) => dispatch({
              type: 'UPDATE_FORM_SETTINGS',
              payload: { description: e.target.value }
            })}
            placeholder="Add form description (optional)"
            className={`w-full p-2 rounded-lg border resize-none ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500' 
                : 'bg-white/50 border-white/30 text-gray-800 placeholder-gray-400 backdrop-blur-sm'
            } focus:outline-none focus:ring-2 focus:ring-opacity-20 ${
              darkMode ? 'focus:ring-cyan-500' : 'focus:ring-purple-500'
            }`}
            rows={2}
          />
        </div>
        
        <div className="space-y-4">
          {form.fields.map((field, index) => (
            <div
              key={field.id}
              draggable={isBrowser}
              onDragStart={(e) => handleFieldDragStart(e, index)}
              onDragOver={(e) => handleFieldDragOver(e, index)}
              onDragLeave={handleFieldDragLeave}
              onDrop={(e) => handleFieldDrop(e, index)}
              className={`p-4 rounded-lg border transition-all ${
                draggedOver === index 
                  ? darkMode 
                    ? 'border-cyan-500 bg-gray-700/70' 
                    : 'border-purple-400 bg-[#c0e6e9]/30'
                  : darkMode 
                    ? 'border-gray-700 bg-gray-700/50 hover:bg-gray-700/70' 
                    : 'border-white/30 bg-white/40 hover:bg-white/60 backdrop-blur-sm shadow-md'
              } group`}
            >
              <div className="flex items-center">
                <div className="cursor-grab active:cursor-grabbing p-1 mr-2 text-gray-400 hover:text-gray-600">
                  <GripVertical size={18} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className={`font-medium ${
                      darkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}>
                      {field.label}
                    </span>
                    {field.required && (
                      <span className="ml-1 text-red-500">*</span>
                    )}
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                      darkMode 
                        ? 'bg-gray-600 text-gray-300' 
                        : 'bg-[#f0d7db]/50 text-gray-600'
                    }`}>
                      {field.type}
                    </span>
                  </div>
                  
                  {field.placeholder && (
                    <p className={`text-sm mt-1 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Placeholder: {field.placeholder}
                    </p>
                  )}
                  
                  {field.options && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {field.options.map((option, i) => (
                        <span 
                          key={i}
                          className={`text-xs px-2 py-1 rounded-md ${
                            darkMode 
                              ? 'bg-gray-600 text-gray-300' 
                              : 'bg-[#c0e6e9]/40 text-gray-700'
                          }`}
                        >
                          {option}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEditField(field)}
                    className={`p-1.5 rounded-md ${
                      darkMode 
                        ? 'hover:bg-gray-600 text-gray-400 hover:text-gray-200' 
                        : 'hover:bg-[#c0e6e9]/50 text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Edit size={16} />
                  </button>
                  
                  <button
                    onClick={() => handleDeleteField(field.id)}
                    className={`p-1.5 rounded-md ${
                      darkMode 
                        ? 'hover:bg-gray-600 text-gray-400 hover:text-red-400' 
                        : 'hover:bg-[#f0d7db]/50 text-gray-500 hover:text-red-500'
                    }`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          <div 
            className={`p-4 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors ${
              darkMode 
                ? 'border-gray-700 hover:border-gray-600 bg-gray-800/50 hover:bg-gray-700/50' 
                : 'border-[#c0e6e9]/40 hover:border-[#c0e6e9]/70 bg-white/30 hover:bg-white/50 backdrop-blur-sm'
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="text-center py-4">
              <div className={`mx-auto w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                darkMode 
                  ? 'bg-gray-700 text-gray-400' 
                  : 'bg-gray-300/40 text-gray-600'
              }`}>
                <Plus size={20} />
              </div>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                Drag components here or click to add
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormCanvas;