import { useState, useEffect } from 'react'; 
import { BarChart3, Download, ArrowLeft } from 'lucide-react';
import ExcelJS from 'exceljs';
import saveAs from 'file-saver';

// Converts base64 image to Blob
const dataURItoBlob = (dataURI) => {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
};

const ResponseViewer = ({ darkMode, setDarkMode, onBack }) => {
  const [responses, setResponses] = useState([]);
  const [form, setForm] = useState(null);
  const [forms, setForms] = useState({});
  const [selectedFormId, setSelectedFormId] = useState(null);
  const [formResponses, setFormResponses] = useState({});

  useEffect(() => {
    try {
      // Load all forms and responses from localStorage
      const storedResponses = JSON.parse(localStorage.getItem('formResponses') || '{}');
      const formData = JSON.parse(localStorage.getItem('formBuilderForms') || '{}');
      const sharedForms = JSON.parse(localStorage.getItem('sharedForms') || '{}');
      
      const allForms = { ...formData, ...sharedForms };
      setForms(allForms);
      setFormResponses(storedResponses);
      
      if (selectedFormId) {
        setResponses(storedResponses[selectedFormId] || []);
        setForm(allForms[selectedFormId]);
      }
    } catch (error) {
      console.warn('Failed to load forms or responses:', error);
    }
  }, [selectedFormId]);

  const handleFormSelect = (formId) => {
    setSelectedFormId(formId);
  };
  const handleDeleteForm = (formId) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this form and all its responses?");
  if (!confirmDelete) return;

  const storedForms = JSON.parse(localStorage.getItem('formBuilderForms') || '{}');
  const sharedForms = JSON.parse(localStorage.getItem('sharedForms') || '{}');
  const storedResponses = JSON.parse(localStorage.getItem('formResponses') || '{}');

  delete storedForms[formId];
  delete sharedForms[formId];
  delete storedResponses[formId];

  localStorage.setItem('formBuilderForms', JSON.stringify(storedForms));
  localStorage.setItem('sharedForms', JSON.stringify(sharedForms));
  localStorage.setItem('formResponses', JSON.stringify(storedResponses));

  setForms((prev) => {
    const updated = { ...prev };
    delete updated[formId];
    return updated;
  });

  setFormResponses((prev) => {
    const updated = { ...prev };
    delete updated[formId];
    return updated;
  });
};


 const handleDeleteResponse = (responseId) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this response?");
  if (!confirmDelete) return;

  const storedResponses = JSON.parse(localStorage.getItem('formResponses') || '{}');
  const updatedResponses = (storedResponses[selectedFormId] || []).filter(
    (resp) => resp.id !== responseId
  );

  storedResponses[selectedFormId] = updatedResponses;
  localStorage.setItem('formResponses', JSON.stringify(storedResponses));
  setResponses(updatedResponses);
};
  /*const exportToCSV = () => {
  if (!responses.length || !form) return;

  try {
    const headers = ['Response ID', 'Timestamp', ...form.fields.map(field => field.label)];
    const csvRows = [headers.join(',')];

    responses.forEach((response) => {
      const row = [
        response.id,
        new Date(response.timestamp).toLocaleString(),
        ...form.fields.map((field) => {
          let value = response.responses[field.id];

          if (Array.isArray(value)) {
            return `"${value.join(', ')}"`;
          }

          if (field.type === 'file') {
            if (typeof value === 'string') {
              if (value.startsWith('data:')) {
                // Embed image in CSV with <img> tag
                return `"<img src='${value}' width='100' />"`;
              }
              return `"http://localhost:5173/uploads/${value.replace(/^\/+/, '')}"`;
            }
          }

          if (field.type === 'signature' && value?.startsWith('data:image')) {
            // Embed signature image as <img> tag
            return `"<img src='${value}' width='100' />"`;
          }

          return `"${value || ''}"`;
        })
      ].join(',');
      csvRows.push(row);
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/html' }); // Important: treat as HTML
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.title}-responses.html`; // Download as .html
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.warn('Failed to export CSV:', error);
  }
};*/
// Add at top if not already

/*const exportToExcel = () => {
  if (!responses.length || !form) return;

  const headers = ['Response ID', 'Timestamp', ...form.fields.map(field => field.label)];
  const data = [];

  responses.forEach((response) => {
    const row = [
      response.id,
      new Date(response.timestamp).toLocaleString(),
      ...form.fields.map((field) => {
        const value = response.responses[field.id];

        if (Array.isArray(value)) {
          return value.join(', ');
        }

        if (field.type === 'file' || field.type === 'signature') {
          if (typeof value === 'string' && value.startsWith('data:image')) {
            // Embed as base64 data URI
            return `=IMAGE("${value}")`; // Excel will treat this as an image formula
          }
        }

        return value || '';
      })
    ];

    data.push(row);
  });

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Responses");

  XLSX.writeFile(workbook, `${form.title}-responses.xlsx`);
};*/
const exportToExcel = async () => {
  if (!responses.length || !form) return;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Responses');

  // Step 1: Add headers
  const headers = ['Response ID', 'Timestamp'];
  form.fields.forEach((field) => {
    if (!field.id.endsWith('_countryCode')) {
      headers.push(field.label);
      if (field.type === 'phone') {
        headers.push(`${field.label} - Country Code`);
      }
    }
  });
  worksheet.addRow(headers);

  // Step 2: Add response rows
  for (const response of responses) {
    const rowIndex = worksheet.rowCount + 1;
    const rowValues = [response.id, new Date(response.timestamp).toLocaleString()];

    form.fields.forEach((field) => {
      if (field.id.endsWith('_countryCode')) return; // skip separate field

      const value = response.responses[field.id];

      if (field.type === 'signature' && value?.startsWith('data:image')) {
        rowValues.push('');
        const imageId = workbook.addImage({
          base64: value,
          extension: 'png',
        });

        worksheet.addImage(imageId, {
          tl: { col: rowValues.length, row: rowIndex - 1 },
          ext: { width: 100, height: 50 },
        });
      } else {
        rowValues.push(Array.isArray(value) ? value.join(', ') : value || '');
      }

      // Add separate country code if it's a phone field
      if (field.type === 'phone') {
        const countryCode = response.responses[`${field.id}_countryCode`] || '';
        rowValues.push(countryCode ? `+${countryCode}` : '');
      }
    });

    worksheet.addRow(rowValues);
  }

  // Step 3: Trigger download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  saveAs(blob, `${form.title}-responses.xlsx`);
};



    // Trigger download for signature images separately
    /*responses.forEach((response) => {
      form.fields.forEach((field) => {
        const value = response.responses[field.id];
        if (field.type === 'signature' && value?.startsWith('data:image')) {
          const signatureBlob = dataURItoBlob(value);
          const signatureUrl = URL.createObjectURL(signatureBlob);

          const link = document.createElement('a');
          link.href = signatureUrl;
          link.download = `${response.id}_${field.id}.png`;
          link.click();

          setTimeout(() => URL.revokeObjectURL(signatureUrl), 1000);
        }
      });
    });
*/

  // If no form is selected, show the form selection screen
  if (!selectedFormId) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
        <header className={`px-6 py-4 ${
          darkMode 
            ? 'bg-gray-900 border-b border-gray-700/50' 
            : 'bg-white/70 backdrop-blur-md border-b border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h2 className={`text-2xl font-bold ${
                darkMode ? 'text-purple-400' : 'text-gray-800'
              }`}>
                Form Responses
              </h2>
            </div>
            
            <div className="flex items-center space-x-3">
              {onBack && (
                <button
                  onClick={onBack}
                  className={`px-4 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2 ${
                    darkMode 
                      ? 'bg-gray-800/60 hover:bg-gray-700/60 text-gray-300 hover:text-white border border-gray-700/50' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 backdrop-blur-sm'
                  }`}
                >
                  <ArrowLeft size={16} />
                  <span>Back to Builder</span>
                </button>
              )}
              
              <div className="w-px h-8 bg-gray-300 dark:bg-gray-700"></div>
              
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-full ${
                  darkMode ? 'bg-gray-800 text-yellow-400' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {darkMode ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" 
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" 
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </header>
        
        <div className="p-6">
          <p className={`mb-4 ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Select a form to view responses
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(forms).map(([id, formData]) => {
              const responseCount = (formResponses[id] || []).length;
              return (
  <div
    key={id}
    className={`p-6 rounded-xl border transition-all relative group ${
      darkMode 
        ? 'border-gray-700 hover:border-gray-600 bg-gray-800 hover:bg-gray-700' 
        : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 shadow-sm'
    }`}
  >
    <h3 
      className="text-lg font-semibold mb-2 cursor-pointer"
      onClick={() => handleFormSelect(id)}
    >
      {formData.title}
    </h3>

    <div className="flex items-center justify-between">
      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {formData.fields?.length || 0} fields
      </span>
      <span className={`px-3 py-1 rounded-full text-xs ${
        (formResponses[id] || []).length > 0
          ? darkMode 
            ? 'bg-green-900 text-green-300' 
            : 'bg-green-100 text-green-800'
          : darkMode
            ? 'bg-gray-700 text-gray-400'
            : 'bg-gray-100 text-gray-600'
      }`}>
        {(formResponses[id] || []).length} {(formResponses[id] || []).length === 1 ? 'response' : 'responses'}
      </span>
    </div>
 {/* DELETE BUTTON */}
    <button
      onClick={(e) => {
        e.stopPropagation(); // prevent card click
        handleDeleteForm(id);
      }}
      className="absolute top-3 right-3 text-red-500 hover:text-red-700"
      title="Delete Form"
    >
      🗑️
    </button>
  </div>
);
            })}
              
            {Object.keys(forms).length === 0 && (
              <div className={`col-span-3 text-center py-12 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg">No forms found</p>
                <p>Create a form first to collect responses</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <header className={`px-6 py-4 ${
        darkMode 
          ? 'bg-gray-900 border-b border-gray-700/50' 
          : 'bg-white/70 backdrop-blur-md border-b border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSelectedFormId(null)}
              className={`p-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <ArrowLeft size={16} />
            </button>
            <h2 className={`text-2xl font-bold ${
              darkMode ? 'text-purple-400' : 'text-gray-800'
            }`}>
              {form?.title}
            </h2>
            <span className={`px-3 py-1 rounded-full text-xs ${
              darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
            }`}>
              {responses.length} {responses.length === 1 ? 'response' : 'responses'}
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            {responses.length > 0 && (
              <button
                onClick={exportToExcel}
                className={`px-4 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2 ${
                  darkMode 
                    ? 'bg-green-700 hover:bg-green-600 text-white' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                <Download size={16} />
                <span>Export Excel</span>
              </button>
            )}
            
            {onBack && (
              <button
                onClick={onBack}
                className={`px-4 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2 ${
                  darkMode 
                    ? 'bg-gray-800/60 hover:bg-gray-700/60 text-gray-300 hover:text-white border border-gray-700/50' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
                }`}
              >
                <ArrowLeft size={16} />
                <span>Back to Builder</span>
              </button>
            )}
            
            <div className="w-px h-8 bg-gray-300 dark:bg-gray-700"></div>
            
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full ${
                darkMode ? 'bg-gray-800 text-yellow-400' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {darkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" 
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" 
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>
      
      <div className="p-6">
        {responses.length === 0 ? (
          <div className={`text-center py-12 ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">No responses yet</p>
            <p>Share your form to start collecting responses</p>
          </div>
        ) : (
          <div className={`overflow-x-auto rounded-lg border shadow-lg ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <table className={`w-full ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
            <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
  <tr>
    <th className="px-4 py-3 text-left text-sm font-medium">
      Timestamp
    </th>
    {form?.fields?.map((field) =>
      field.id.endsWith('_countryCode') ? null : (
        <th
          key={field.id}
          className={`px-4 py-3 text-left text-sm font-medium ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}
        >
          {field.label}
        </th>
      )
    )}
    <th className="px-4 py-3 text-right text-sm font-medium">
      Actions
    </th>
  </tr>
</thead>
<tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
  {responses.map((response) => (
    <tr key={response.id}>
      <td className={`px-4 py-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        {new Date(response.timestamp).toLocaleString()}
      </td>
      {form?.fields?.map((field) => {
        const value = response.responses[field.id];
        let displayValue = '-';

        if (Array.isArray(value)) {
          displayValue = value.join(', ');
        } else if (field.type === 'file' && value) {
          if (value.startsWith('data:image')) {
            displayValue = (
              <img src={value} alt="Uploaded File" className="h-16 border rounded" />
            );
          } else {
            displayValue = (
              <a
                href={
                  value.startsWith('data:')
                    ? value
                    : `http://localhost:5173/uploads/${value.replace(/^\/+/, '')}`
                }
                download
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                {value.startsWith('data:') ? 'Download File' : value}
              </a>
            );
          }
        } else if (field.type === 'signature' && value) {
          displayValue = <img src={value} alt="Signature" className="h-16 border rounded" />;
        } else {
          displayValue = value || '-';
        }

        return (
          <td key={field.id} className={`px-4 py-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {displayValue}
          </td>
        );
      })}

      {/* Delete Button Column */}
      <td className="px-4 py-3 text-sm text-right">
        <button
          onClick={() => {
            const confirmDelete = window.confirm('Are you sure you want to delete this response?');
            if (!confirmDelete) return;

            const storedResponses = JSON.parse(localStorage.getItem('formResponses') || '{}');
            const updated = (storedResponses[selectedFormId] || []).filter(r => r.id !== response.id);
            storedResponses[selectedFormId] = updated;
            localStorage.setItem('formResponses', JSON.stringify(storedResponses));
            setResponses(updated);
          }}
          className="text-red-500 hover:text-red-700 font-medium"
          title="Delete Response"
          aria-label="Delete Response"
        >
          🗑️ Delete
        </button>
      </td>
    </tr>
  ))}
</tbody>


            </table>
          </div>
        )}
      </div>
    </div>
  );
  
};

export default ResponseViewer;
