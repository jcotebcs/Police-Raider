# 🚀 Police-Raider RapidAPI Generator

A comprehensive TypeScript code generator for RapidAPI endpoints specialized in law enforcement, background checks, and verification services.

![Police-Raider Logo](public/police-badge.svg)

## 🎯 Live Application

**🌐 [Visit Police-Raider RapidAPI Generator](https://jcotebcs.github.io/Police-Raider)**

## ✨ Features

- **🔧 13 Pre-configured APIs** for comprehensive background checks and verification
- **⚡ Real-time Code Generation** with live preview
- **📱 Responsive Design** for mobile and desktop
- **💾 Download Ready Projects** as ZIP files
- **🎨 TypeScript Support** with full type definitions
- **🛡️ Production-Ready Code** with error handling and retry logic
- **📖 Complete Documentation** and usage examples

## 🔍 Supported APIs

### Identity & Criminal Background
- **ID Verify API** - Personal identification verification
- **Criminal History API** - Background check data
- **Sex Offender API** - Registry searches

### Employment & Licensing
- **Verify Employment API** - Current employment status
- **Verify Previous Employment API** - Employment history
- **State License Verification API** - Professional licenses
- **Validate Driver License API** - Driver's license validation

### Vehicle & Property
- **Vehicle Lookup API** - Vehicle information lookup
- **Verify Vehicle History API** - Vehicle history reports
- **Deed Search API** - Property records

### Contact & Business
- **Email Search API** - Email verification
- **Search Business License API** - Business registration
- **Military Verification API** - Military service records

## 🚀 Quick Start

1. **Visit the Web App**: https://jcotebcs.github.io/Police-Raider
2. **Select APIs**: Choose from 13 pre-configured law enforcement APIs
3. **Preview Code**: See generated TypeScript code in real-time
4. **Download**: Get a complete, production-ready project
5. **Deploy**: Add your RapidAPI key and start using!

## 🛠️ Development

### Prerequisites
- Node.js 20+
- npm or yarn

### Setup
```bash
# Clone the repository
git clone https://github.com/jcotebcs/Police-Raider.git
cd Police-Raider

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Project Structure
```
src/
├── components/          # React components
│   ├── APISelector.tsx  # API selection interface
│   └── CodePreview.tsx  # Code preview with syntax highlighting
├── data/
│   └── rapidapi-endpoints.ts  # API configurations
├── utils/
│   ├── codeGenerator.ts # TypeScript code generation
│   └── fileUtils.ts     # ZIP file creation
└── App.tsx             # Main application
```

## 📦 Generated Project Structure

When you download a project, you get:

```
police-raider-api-client/
├── src/
│   ├── types.ts         # TypeScript interfaces
│   ├── client.ts        # API client class
│   └── examples.ts      # Usage examples
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── README.md           # Complete documentation
└── setup.sh            # Quick setup script
```

## 🔧 Usage Example

```typescript
import PoliceRaiderAPIClient from './client';

const client = new PoliceRaiderAPIClient({
  apiKey: 'your-rapidapi-key-here'
});

// Verify identity
const idResult = await client.idVerify({
  firstName: 'John',
  lastName: 'Doe',
  ssn: '123-45-6789'
});

// Check criminal history
const criminalResult = await client.criminalHistory({
  firstName: 'John',
  lastName: 'Doe'
});

// Comprehensive background check
const backgroundReport = {
  identity: idResult,
  criminal: criminalResult,
  timestamp: new Date().toISOString()
};
```

## 🎨 Technology Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **File Generation**: JSZip
- **Deployment**: GitHub Pages

## 📈 API Categories

- **Identity Verification** - Personal ID and SSN verification
- **Criminal Background** - Criminal history and sex offender checks
- **Employment Verification** - Current and previous employment
- **License Verification** - Professional and driver's licenses
- **Vehicle Verification** - VIN lookup and history reports
- **Military Verification** - Military service records
- **Business Verification** - Business license searches
- **Property Verification** - Property deed searches
- **Contact Verification** - Email and contact validation

## 🚀 Deployment

The application automatically deploys to GitHub Pages via GitHub Actions:

1. **Push to main branch**
2. **GitHub Actions builds the project**
3. **Deploys to GitHub Pages**
4. **Available at**: https://jcotebcs.github.io/Police-Raider

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Live Application**: https://jcotebcs.github.io/Police-Raider
- **RapidAPI Marketplace**: https://rapidapi.com
- **Police-Raider Repository**: https://github.com/jcotebcs/Police-Raider

## 📞 Support

For support with this generator:
- Open an issue on GitHub
- Check the generated README.md for API-specific help
- Visit [RapidAPI Support](https://rapidapi.com/support) for API questions

---

**🚨 Built for Law Enforcement and Security Professionals**  
Generate production-ready TypeScript code for comprehensive background checks and verification services.
