# Form Builder

A modern, feature-rich form builder and management application built with React Remix. Create, share, and collect responses with a clean, intuitive interface.

**Live Demo:** [https://form-builder-alpha-ten.vercel.app/](https://form-builder-alpha-ten.vercel.app/)
**Video Demo:** [https://youtu.be/2URwDjsSQgk/](https://youtu.be/2URwDjsSQgk/)

![image](https://github.com/user-attachments/assets/97f72dc5-aba0-4d5d-af95-0630cbfa4425)


## Features

### Form Building
- **Drag-and-Drop Interface**: Easily create forms by dragging components from the palette
- **Multiple Field Types**: Support for text, textarea, select, checkbox, radio, date, email, phone, and number fields
- **Field Customization**: Configure field properties like labels, placeholders, required status, and help text
- **Form Preview**: Real-time preview of your form as you build it
- **Responsive Design Preview**: Test how your form looks on desktop, tablet, and mobile devices

### Form Management
- **Templates**: Save and reuse form templates for common use cases
- **Built-in Templates**: Pre-built templates for common form types (Contact, Survey)
- **Dark Mode**: Toggle between light and dark themes for comfortable editing

### Form Sharing
- **Shareable Links**: Generate unique links to share your forms with respondents
- **Copy to Clipboard**: One-click copying of form links
- **Form Status**: Track the number of responses for each form

### Response Collection
- **Response Viewer**: View all responses in a clean, tabular format
- **Response Filtering**: Select specific forms to view their responses
- **Export to CSV**: Download responses as CSV files for further analysis
- **Response Statistics**: See the number of responses for each form at a glance

### User Experience
- **Modern UI**: Clean, intuitive interface with smooth animations
- **Offline Capability**: Forms and responses are stored in localStorage
- **Progress Saving**: Form fillers can save their progress and return later
- **Validation**: Built-in validation for required fields and specific field types

## Technical Details

### Architecture
- **React Remix**: Built with React Remix for server-rendered React applications
- **State Management**: Uses React's Context API and useReducer for state management
- **Local Storage**: Stores forms, templates, and responses in browser localStorage
- **CSS**: Styled with Tailwind CSS for a responsive, modern design

### Data Storage
- **Forms**: Stored in `formBuilderForms` localStorage key
- **Shared Forms**: Stored in `sharedForms` localStorage key
- **Templates**: Stored in `customFormTemplates` localStorage key
- **Responses**: Stored in `formResponses` localStorage key
- **In-Progress Forms**: Stored in `formFillerProgress` localStorage key

### Components
- **FormBuilderMain**: Main form builder interface
- **FieldPalette**: Draggable field components
- **FormCanvas**: Form editing area
- **FormPreview**: Real-time form preview
- **FormFiller**: Form response interface for end-users
- **ResponseViewer**: View and export form responses
- **FieldEditor**: Edit field properties

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone [https://github.com/Prabhsingh0401/Form-Builder.git](https://github.com/Prabhsingh0401/Form-Builder-Remix.git)
cd form-builder
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Usage Guide

### Creating a Form
1. Open the Form Builder
2. Drag fields from the left palette onto the canvas
3. Click on fields to edit their properties
4. Use the preview panel to see how your form will look
5. Click "Save" to save your form

### Using Templates
1. Click "Templates" to view available templates
2. Select a template to load it into the editor
3. Customize the template as needed
4. To save your own template, click "Template it"

### Sharing Forms
1. Click the "Share" button
2. The form link will be copied to your clipboard
3. Share this link with your respondents

### Viewing Responses
1. Click "Responses" to open the response viewer
2. Select a form to view its responses
3. Use the "Export CSV" button to download responses

## Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- Built with [React Remix](https://remix.run/) and [React](https://reactjs.org/)
