import { useState, useReducer, useEffect } from 'react';
import { FileText, Copy, BarChart3, Save } from 'lucide-react';
import { useNavigate } from '@remix-run/react';
import PreviewToggle from './PreviewToggle';
import ThemeToggle from './ThemeToggle';
import FieldPalette from './FieldPalette';
import FormCanvas from './FormCanvas';
import FormPreview from './FormPreview';
import FieldEditor from './FieldEditor';
import { auth } from "../firebase/firebase.config";
async function saveFormToMongo(formObject) {
  const user = auth.currentUser;
  if (!user) return;

  try {
    await fetch(`${import.meta.env.VITE_API_BASE_URL}/forms/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uid: user.uid,
        formData: formObject,
      }),
    });
    console.log("✅ Form synced to MongoDB");
  } catch (error) {
    console.error("❌ Failed to sync form to MongoDB:", error);
  }
}


const formReducer = (state, action) => {
  const newState = (() => {
    switch (action.type) {
      case 'ADD_FIELD':
        return {
          ...state,
          currentForm: {
            ...state.currentForm,
            fields: [...state.currentForm.fields, action.payload]
          }
        };
      
      case 'UPDATE_FIELD':
        return {
          ...state,
          currentForm: {
            ...state.currentForm,
            fields: state.currentForm.fields.map(field => 
              field.id === action.payload.id ? { ...field, ...action.payload.updates } : field
            )
          }
        };
      
      case 'DELETE_FIELD':
        return {
          ...state,
          currentForm: {
            ...state.currentForm,
            fields: state.currentForm.fields.filter(field => field.id !== action.payload)
          }
        };
      
      case 'REORDER_FIELDS':
        const fields = Array.from(state.currentForm.fields);
        const [reorderedField] = fields.splice(action.payload.source, 1);
        fields.splice(action.payload.destination, 0, reorderedField);
        return {
          ...state,
          currentForm: {
            ...state.currentForm,
            fields
          }
        };
      
      case 'SET_FORM':
        return {
          ...state,
          currentForm: action.payload
        };
      
      case 'ADD_STEP':
        return {
          ...state,
          currentForm: {
            ...state.currentForm,
            steps: [...(state.currentForm.steps || []), {
              id: Date.now().toString(),
              name: `Step ${(state.currentForm.steps?.length || 0) + 1}`,
              fields: []
            }]
          }
        };
      
      case 'UPDATE_FORM_SETTINGS':
        return {
          ...state,
          currentForm: {
            ...state.currentForm,
            ...action.payload
          }
        };
      
      default:
        return state;
    }
  })();

  if (action.type !== 'UNDO' && action.type !== 'REDO') {
    return {
      ...newState,
      history: [...state.history.slice(0, state.historyIndex + 1), newState],
      historyIndex: state.historyIndex + 1
    };
  }
  
  return newState;
};

const FORM_TEMPLATES = {
  contact: {
    name: 'Contact Us',
    fields: [
      { id: '1', type: 'text', label: 'Full Name', required: true, placeholder: 'Enter your name' },
      { id: '2', type: 'email', label: 'Email', required: true, placeholder: 'your@email.com' },
      { id: '3', type: 'phone', label: 'Phone', required: false, placeholder: '+1 (555) 123-4567' },
      { id: '4', type: 'textarea', label: 'Message', required: true, placeholder: 'Your message here...' }
    ]
  },
  survey: {
    name: 'Customer Survey',
    fields: [
      { id: '1', type: 'text', label: 'Name', required: true },
      { id: '2', type: 'select', label: 'Satisfaction', required: true, options: ['Excellent', 'Good', 'Fair', 'Poor'] },
      { id: '3', type: 'radio', label: 'Recommend?', required: true, options: ['Yes', 'No', 'Maybe'] },
      { id: '4', type: 'textarea', label: 'Comments', required: false }
    ]
  }
};

const FormBuilder = ({ setAppDarkMode }) => {
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (setAppDarkMode) {
      setAppDarkMode(darkMode);
    }
  }, [darkMode, setAppDarkMode]);
  
  const [previewMode, setPreviewMode] = useState('desktop');
  const [selectedField, setSelectedField] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [activeTab, setActiveTab] = useState('builder');
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [showShareNotification, setShowShareNotification] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const initialState = {
    currentForm: {
      id: Date.now().toString(),
      title: 'New Form',
      description: '',
      fields: [],
      steps: []
    },
    history: [],
    historyIndex: -1
  };

  const [state, dispatch] = useReducer(formReducer, initialState);

  useEffect(() => {
    try {
      const customTemplates = JSON.parse(localStorage.getItem('customFormTemplates') || '{}');
      Object.entries(customTemplates).forEach(([key, template]) => {
        if (!FORM_TEMPLATES[key]) {
          FORM_TEMPLATES[key] = template;
        }
      });
    } catch (error) {
      console.warn('Failed to load custom templates:', error);
    }
  }, []);

  // Manual save function
  const saveForm =async () => {
    try {
      const formsData = JSON.parse(localStorage.getItem('formBuilderForms') || '{}');
      formsData[state.currentForm.id] = state.currentForm;
      localStorage.setItem('formBuilderForms', JSON.stringify(formsData));
      
    // ✅ Sync to MongoDB
    await saveFormToMongo(state.currentForm);

      setShowSaveNotification(true);
      
      setTimeout(() => {
        setShowSaveNotification(false);
      }, 3000);
    } catch (error) {
      console.warn('Save failed:', error);
      alert('Failed to save form. Please try again.');
    }
  };

  const handleFieldUpdate = (field) => {
    dispatch({
      type: 'UPDATE_FIELD',
      payload: { id: field.id, updates: field }
    });
  };

  const loadTemplate = (templateKey) => {
    const template = FORM_TEMPLATES[templateKey];
    if (template) {
      dispatch({
        type: 'SET_FORM',
        payload: {
          ...state.currentForm,
          title: template.name,
          fields: template.fields
        }
      });
      setShowTemplates(false);
    }
  };
  
  const saveAsTemplate = () => {
    setTemplateName(state.currentForm.title);
    setShowSaveTemplateModal(true);
  };
  
  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }
    
    try {
      const templateKey = templateName.toLowerCase().replace(/\s+/g, '_');
      
      const newTemplate = {
        name: templateName,
        fields: state.currentForm.fields
      };
      
      const customTemplates = JSON.parse(localStorage.getItem('customFormTemplates') || '{}');
      
      customTemplates[templateKey] = newTemplate;
      
      localStorage.setItem('customFormTemplates', JSON.stringify(customTemplates));
      
      FORM_TEMPLATES[templateKey] = newTemplate;
      
      setShowSaveTemplateModal(false);
      setTemplateName('');
      alert(`Template "${templateName}" saved successfully!`);
    } catch (error) {
      console.error('Failed to save template:', error);
      alert('Failed to save template. Please try again.');
    }
  };

  const generateFormId = () => {
    return 'form_' + Math.random().toString(36).substr(2, 9);
  };

  const shareForm = () => {
    try {
      const shareId = generateFormId();
      const shareableForm = { ...state.currentForm, shareId };
      
      const sharedForms = JSON.parse(localStorage.getItem('sharedForms') || '{}');
      sharedForms[shareId] = shareableForm;
      localStorage.setItem('sharedForms', JSON.stringify(sharedForms));
      
      const url = `${window.location.origin}/?form=${shareId}`;
      setShareUrl(url);
      
      navigator.clipboard.writeText(url).then(() => {
        setShowShareNotification(true);
        setTimeout(() => {
          setShowShareNotification(false);
        }, 3000);
      }).catch(() => {
        setShowShareNotification(true);
        setTimeout(() => {
          setShowShareNotification(false);
        }, 3000);
      });
    } catch (error) {
      console.warn('Failed to share form:', error);
    }
  };

  const viewResponses = () => {
    navigate('/?responses=true');
  };
   const handleDeleteTemplate = (key) => {
  const storedTemplates = JSON.parse(localStorage.getItem('customFormTemplates') || '{}');
  if (storedTemplates[key]) {
    if (window.confirm(`Delete template "${storedTemplates[key].name}"?`)) {
      delete storedTemplates[key];
      localStorage.setItem('customFormTemplates', JSON.stringify(storedTemplates));
      delete FORM_TEMPLATES[key];
      setShowTemplates(false); // Close and reopen to refresh UI
      setTimeout(() => setShowTemplates(true), 50);
    }
  }
};

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gray-900 text-gray-100' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Header */}
      <header className={`relative px-6 py-4 ${
        darkMode 
          ? 'bg-gray-900 border-b border-gray-700/50' 
          : 'bg-white border-b border-gray-200'
      }`}>
        {/* Background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[#111828]"></div>
        </div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/25`}>
                <FileText size={20} className="text-white" />
              </div>              
              <h1 className={`text-2xl font-bold ${
                darkMode 
                    ? 'text-purple-400' 
                    : 'bg-gradient-to-r from-purple-600 to-purple-600 bg-clip-text text-transparent'
                }`}>
                Form Builder
              </h1>
            </div>
            
            {/* Form Title Input */}
            <div className="flex items-center space-x-3">
              <div className={`w-px h-8 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
              <div className="relative">
                <input
                  type="text"
                  value={state.currentForm.title}
                  onChange={(e) => dispatch({
                    type: 'UPDATE_FORM_SETTINGS',
                    payload: { title: e.target.value }
                  })}
                  className={`px-4 py-2.5 rounded-xl border-0 bg-transparent font-medium text-lg transition-all focus:outline-none focus:ring-2 ${
                    darkMode 
                      ? 'text-gray-200 focus:ring-cyan-500/30 focus:bg-gray-800/50' 
                      : 'text-gray-800 focus:ring-purple-500/30 focus:bg-white/80'
                  } placeholder-gray-400`}
                  placeholder="Form Title"
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Preview Toggle */}
            <PreviewToggle 
              previewMode={previewMode} 
              setPreviewMode={setPreviewMode}
              darkMode={darkMode}
            />
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              
              <button
                onClick={saveForm}
                className={`group px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 flex items-center space-x-2 ${
                  darkMode 
                    ? 'bg-gray-800/60 hover:bg-gray-700/60 text-gray-300 hover:text-white border border-gray-700/50 hover:border-gray-600' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 border border-gray-200 shadow-sm hover:shadow'
                }`}
              >
                <Save size={16} className="transition-transform group-hover:scale-110" />
                <span>Save</span>
              </button>
              
              <button
                onClick={saveAsTemplate}
                className={`group px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 flex items-center space-x-2 ${
                  darkMode 
                    ? 'bg-gray-800/60 hover:bg-gray-700/60 text-gray-300 hover:text-white border border-gray-700/50 hover:border-gray-600' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 border border-gray-200 shadow-sm hover:shadow'
                }`}
              >
                <FileText size={16} className="transition-transform group-hover:scale-110" />
                <span>Template it</span>
              </button>

              <button
                onClick={() => setShowTemplates(true)}
                className={`group px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 flex items-center space-x-2 ${
                  darkMode 
                    ? 'bg-gray-800/60 hover:bg-gray-700/60 text-gray-300 hover:text-white border border-gray-700/50 hover:border-gray-600' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 border border-gray-200 shadow-sm hover:shadow'
                }`}
              >
                <FileText size={16} className="transition-transform group-hover:scale-110" />
                <span>Templates</span>
              </button>
              
              <button
                onClick={viewResponses}
                className={`group px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 flex items-center space-x-2 ${
                  darkMode 
                    ? 'bg-gray-800/60 hover:bg-gray-700/60 text-gray-300 hover:text-white border border-gray-700/50 hover:border-gray-600' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 border border-gray-200 shadow-sm hover:shadow'
                }`}
              >
                <BarChart3 size={16} className="transition-transform group-hover:scale-110" />
                <span>Responses</span>
              </button>
              
              <button
                onClick={shareForm}
                className="group px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white hover:shadow-purple-500/40"
              >
                <Copy size={16} className="transition-transform group-hover:scale-110" />
                <span>Share</span>
              </button>
            </div>
            
            {/* Theme Toggle */}
            <div className={`w-px h-8 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
            <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row">
        <FieldPalette darkMode={darkMode} />
        
        <FormCanvas
          form={state.currentForm}
          dispatch={dispatch}
          selectedField={selectedField}
          setSelectedField={setSelectedField}
          darkMode={darkMode}
        />
        
        <FormPreview
          form={state.currentForm}
          previewMode={previewMode}
          darkMode={darkMode}
        />
      </div>

      {/* Field Editor Modal */}
      {selectedField && (
        <FieldEditor
          field={selectedField}
          onUpdate={handleFieldUpdate}
          onClose={() => setSelectedField(null)}
          darkMode={darkMode}
        />
      )}

      {/* Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`w-[450px] max-h-[80vh] overflow-y-auto rounded-2xl shadow-2xl ${
            darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'
          }`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className={`text-xl font-bold ${
                darkMode ? 'text-purple-400' : 'text-gray-800'
              }`}>
                Choose Template
              </h3>
              <button 
                onClick={() => setShowTemplates(false)}
                className={`p-2 rounded-full hover:bg-gray-600 dark:hover:bg-gray-700`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(FORM_TEMPLATES).map(([key, template]) => (
  <div
    key={key}
    className={`relative p-4 rounded-xl border group transition-all ${
      darkMode 
        ? 'border-gray-700 hover:border-gray-600 bg-gray-700/50 hover:bg-gray-700/80' 
        : 'border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100'
    }`}
  >
    <div
      onClick={() => loadTemplate(key)}
      className="flex items-center cursor-pointer"
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
        darkMode 
          ? 'bg-gray-800 text-gray-300' 
          : 'bg-gray-100 text-gray-700'
      }`}>
        <FileText size={20} />
      </div>
      <div>
        <h4 className="font-medium">{template.name}</h4>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {template.fields.length} fields included
        </p>
      </div>
    </div>

    {/* Show delete only for custom templates */}
    {!(key === 'contact' || key === 'survey') && (
      <button
        onClick={() => handleDeleteTemplate(key)}
        className="absolute top-2 right-2 text-red-400 hover:text-red-600 text-xs"
        title="Delete Template"
      >
        ✖
      </button>
    )}
  </div>
))}

              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setShowTemplates(false)}
                className={`py-2.5 px-5 rounded-xl font-medium transition-all ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Template Modal */}
      {showSaveTemplateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`w-[450px] rounded-2xl shadow-2xl overflow-hidden ${
            darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'
          }`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className={`text-xl font-bold ${
                darkMode ? 'text-purple-400' : 'text-gray-800'
              }`}>
                Save as Template
              </h3>
              <button 
                onClick={() => setShowSaveTemplateModal(false)}
                className={`p-2 rounded-full hover:bg-gray-400 dark:hover:bg-gray-700`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Template Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Enter template name"
                    className={`w-full px-4 py-3 rounded-xl border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-200' 
                        : 'bg-gray-50 border-gray-200 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-opacity-20 ${
                      darkMode ? 'focus:ring-gray-500' : 'focus:ring-gray-300'
                    }`}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  This template will be available in your templates list for future use.
                </p>
              </div>
              
              <div className="flex items-center p-3 rounded-lg bg-blue-50 dark:bg-gray-700/50 text-blue-800 dark:text-blue-300">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">Template will include {state.currentForm.fields.length} fields</span>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => setShowSaveTemplateModal(false)}
                className={`py-2.5 px-5 rounded-xl font-medium transition-all ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTemplate}
                className={`py-2.5 px-5 rounded-xl font-medium transition-all ${
                  darkMode 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white' 
                    : 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white'
                } shadow-lg hover:shadow-xl`}
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}

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
          <span className="text-sm font-medium">Form saved</span>
          <div className={`text-xs px-2 py-1 rounded ${
            darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
          }`}>
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
      
      {/* Share Notification */}
      <div className={`fixed top-4 right-4 transform transition-all duration-300 z-50 ${
        showShareNotification 
          ? 'translate-y-0 opacity-100' 
          : '-translate-y-12 opacity-0 pointer-events-none'
      }`}>
        <div className={`px-5 py-4 rounded-xl shadow-xl flex items-center space-x-3 ${
          darkMode 
            ? 'bg-gray-800 border border-gray-600 text-gray-200' 
            : 'bg-white border border-gray-200 text-gray-800 shadow-gray-200'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            darkMode ? 'bg-emerald-900/50 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
          }`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <div className="font-medium">Form shared successfully!</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Link copied to clipboard</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormBuilder;