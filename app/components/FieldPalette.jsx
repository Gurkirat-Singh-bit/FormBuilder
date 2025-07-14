import { useState, useEffect } from 'react';
import { Type, AlignLeft, ChevronDown, Check, Circle, Calendar, Mail, Phone, Hash, PenTool,Image as ImageIcon , ShieldCheck,Home,Clock, Star} from 'lucide-react';

const FIELD_TYPES = {
  text: { label: 'Text Input', icon: Type, component: 'TextInput' },
  textarea: { label: 'Text Area', icon: AlignLeft, component: 'TextareaInput' },
  select: { label: 'Select', icon: ChevronDown, component: 'SelectInput' },
  checkbox: { label: 'Checkbox', icon: Check, component: 'CheckboxInput' },
  radio: { label: 'Radio Button', icon: Circle, component: 'RadioInput' },
  date: { label: 'Date Picker', icon: Calendar, component: 'DateInput' },
  email: { label: 'Email', icon: Mail, component: 'EmailInput' },
  phone: { label: 'Phone', icon: Phone, component: 'PhoneInput' },
  number: { label: 'Number', icon: Hash, component: 'NumberInput' },
  file: { label: 'File Upload', icon: ImageIcon, component: 'FileInput' },
  signature: { label: 'Signature', icon: PenTool, component: 'SignatureInput' },
  captcha: { label: 'Captcha', icon: ShieldCheck, component: 'CaptchaInput' },
  address: { label: 'Address', icon: Home, component: 'AddressInput' },
  time: { label: 'Time', icon: Clock, component: 'TimeInput' },
  rating: { label: 'Star Rating', icon: Star, component: 'RatingInput' },
   fullname: { label: 'Full Name', icon: Type, component: 'FullNameInput' },
  matrix: { label: 'Input Table', icon: AlignLeft, component: 'MatrixInput' },
  'image-upload': { label: 'Image Upload', icon: ImageIcon, component: 'ImageUploadInput' },
  'image-capture': { label: 'Image Capture', icon: ImageIcon, component: 'ImageCaptureInput' },
  qr: { label: 'QR / Barcode Scanner', icon: ShieldCheck, component: 'QRCodeScannerInput' }
};

const FieldPalette = ({ darkMode }) => {
  const [isBrowser, setIsBrowser] = useState(false);
  
  useEffect(() => {
    setIsBrowser(true);
  }, []);

  return (
    <div className={`w-70 border-r backdrop-blur-sm ${
      darkMode 
        ? 'bg-slate-900/95 border-gray-700' 
        : 'bg-white border-slate-200/50'
    }`}>
      <div className="px-6 py-3 border-b border-inherit">
        <h3 className={`text-lg font-semibold tracking-tight ${
          darkMode ? 'text-slate-100' : 'text-slate-900'
        }`}>
          Components
        </h3>
        <p className={`text-sm mt-1 ${
          darkMode ? 'text-slate-400' : 'text-slate-500'
        }`}>
          Drag to add fields
        </p>
      </div>
      
      <div className="p-4 space-y-1">
        {Object.entries(FIELD_TYPES).map(([type, config]) => {
          const IconComponent = config.icon;
          return (
            <div
              key={type}
              draggable={isBrowser}
              onDragStart={(e) => {
                if (!isBrowser) return;
                e.dataTransfer.setData('fieldType', type);
              }}
              className={`group flex items-center gap-3 px-3 py-2 rounded-lg cursor-grab active:cursor-grabbing transition-all duration-200 select-none ${
                darkMode 
                  ? 'hover:bg-slate-800/70 active:bg-slate-700/70 border border-transparent hover:border-slate-600/50' 
                  : 'hover:bg-slate-50 active:bg-slate-100 border border-transparent hover:border-slate-200/60'
              }`}
            >
              <div className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors ${
                darkMode 
                  ? 'bg-slate-800 group-hover:bg-slate-700 text-slate-300 group-hover:text-slate-200' 
                  : 'bg-slate-100 group-hover:bg-slate-200 text-slate-600 group-hover:text-slate-700'
              }`}>
                <IconComponent size={16} />
              </div>
              
              <div className="flex-1 min-w-0">
                <span className={`font-medium text-sm ${
                  darkMode ? 'text-slate-200 group-hover:text-slate-100' : 'text-slate-700 group-hover:text-slate-900'
                }`}>
                  {config.label}
                </span>
              </div>
              
              <div className={`w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                darkMode ? 'bg-slate-500' : 'bg-slate-400'
              }`} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FieldPalette;