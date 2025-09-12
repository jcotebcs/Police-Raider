import JSZip from 'jszip';
import type { GeneratedCode } from './codeGenerator';

export async function createZipFile(
  generatedCode: GeneratedCode,
  _projectName: string = 'police-raider-api-client'
): Promise<Blob> {
  const zip = new JSZip();

  // Create main project structure
  zip.file('package.json', generatedCode.packageJson);
  zip.file('README.md', generatedCode.readme);
  
  // Source files
  const srcFolder = zip.folder('src');
  if (srcFolder) {
    srcFolder.file('types.ts', generatedCode.types);
    srcFolder.file('client.ts', generatedCode.client);
    srcFolder.file('examples.ts', generatedCode.examples);
  }

  // TypeScript configuration
  const tsConfig = {
    "compilerOptions": {
      "target": "ES2020",
      "module": "ESNext",
      "moduleResolution": "node",
      "strict": true,
      "esModuleInterop": true,
      "skipLibCheck": true,
      "forceConsistentCasingInFileNames": true,
      "declaration": true,
      "outDir": "dist",
      "rootDir": "src"
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules", "dist"]
  };
  zip.file('tsconfig.json', JSON.stringify(tsConfig, null, 2));

  // ESLint configuration
  const eslintConfig = {
    "extends": [
      "@typescript-eslint/recommended"
    ],
    "parser": "@typescript-eslint/parser",
    "plugins": ["@typescript-eslint"],
    "rules": {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "error"
    }
  };
  zip.file('.eslintrc.json', JSON.stringify(eslintConfig, null, 2));

  // .gitignore
  const gitignore = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log
`;
  zip.file('.gitignore', gitignore);

  // Quick start script
  const quickStart = `#!/bin/bash
echo "🚀 Setting up Police-Raider API Client..."
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "🔧 Next steps:"
echo "1. Add your RapidAPI key to the examples"
echo "2. Run 'npm run build' to compile TypeScript"
echo "3. Run 'npm test' to test the examples"
echo ""
echo "📖 See README.md for detailed usage instructions"
`;
  zip.file('setup.sh', quickStart);

  return zip.generateAsync({ type: 'blob' });
}

export function downloadZip(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function formatCode(code: string, _language: string = 'typescript'): string {
  // Basic code formatting - in a real implementation, you'd use a proper formatter
  const lines = code.split('\n');
  let indentLevel = 0;
  
  return lines.map(line => {
    const trimmed = line.trim();
    
    if (trimmed.endsWith('{')) {
      const formatted = '  '.repeat(indentLevel) + trimmed;
      indentLevel++;
      return formatted;
    } else if (trimmed.startsWith('}')) {
      indentLevel = Math.max(0, indentLevel - 1);
      return '  '.repeat(indentLevel) + trimmed;
    } else {
      return '  '.repeat(indentLevel) + trimmed;
    }
  }).join('\n');
}