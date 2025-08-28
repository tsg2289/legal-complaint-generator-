# Legal Complaint Generator

A secure, modern web application for generating professional legal complaints using AI assistance. Built with Next.js and featuring a beautiful black and turquoise color scheme.

## Features

- 🔒 **Secure API Key Management** - API keys are stored only in browser session
- ⚖️ **Professional Legal Documents** - Generates California Superior Court complaints
- 🎨 **Modern UI/UX** - Beautiful black and turquoise design
- 📄 **Export Options** - Download as PDF or print directly
- 🛡️ **Security First** - Input validation and sanitization
- 📱 **Responsive Design** - Works on all devices

## Getting Started

### Prerequisites

- Node.js 18+ installed
- OpenAI API key (you'll be prompted to enter this securely)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd complaint
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Deployment

This application is configured for easy deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

## Usage

1. **API Key Setup**: When you first visit the app, you'll be prompted to securely enter your OpenAI API key
2. **Enter Case Details**: Provide a detailed factual summary of your case
3. **Generate Complaint**: Click to generate a professional legal complaint
4. **Review & Export**: Review the generated document and export as PDF or print

## Security Features

- API keys are never stored on servers
- Input validation and sanitization
- Secure API communication
- No persistent data storage
- Client-side only key management

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **PDF Generation**: jsPDF
- **API**: OpenAI GPT-3.5-turbo
- **Deployment**: Vercel

## Legal Disclaimer

This application generates AI-assisted legal documents. All generated content should be reviewed by a qualified attorney before filing. The application is for assistance purposes only and does not constitute legal advice.

## Support

For support or questions, please contact the development team.
