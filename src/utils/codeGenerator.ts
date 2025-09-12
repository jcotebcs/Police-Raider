import type { RapidAPIEndpoint } from '../data/rapidapi-endpoints';

export interface GeneratedCode {
  types: string;
  client: string;
  examples: string;
  readme: string;
  packageJson: string;
}

export function generateTypeScript(apis: RapidAPIEndpoint[]): GeneratedCode {
  const types = generateTypes(apis);
  const client = generateClient(apis);
  const examples = generateExamples(apis);
  const readme = generateReadme(apis);
  const packageJson = generatePackageJson();

  return {
    types,
    client,
    examples,
    readme,
    packageJson
  };
}

function generateTypes(apis: RapidAPIEndpoint[]): string {
  const typeDefinitions = apis.map(api => {
    const requestInterface = `export interface ${pascalCase(api.id)}Request {
${api.parameters.map(param => `  ${param.name}${param.required ? '' : '?'}: ${mapTSType(param.type)};`).join('\n')}
}`;

    const responseInterface = `export interface ${pascalCase(api.id)}Response {
  success: boolean;
  data: any;
  message?: string;
  error?: string;
}`;

    return `// ${api.name}
${requestInterface}

${responseInterface}`;
  }).join('\n\n');

  return `/**
 * Police-Raider RapidAPI TypeScript Definitions
 * Generated from RapidAPI specifications
 * 
 * This file contains TypeScript interfaces for all supported APIs:
${apis.map(api => ` * - ${api.name}`).join('\n')}
 */

export interface RapidAPIConfig {
  apiKey: string;
  timeout?: number;
  retryAttempts?: number;
}

export interface APIResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

${typeDefinitions}

// API Category Types
export type APICategory = 
${apis.map(api => `  | '${api.category}'`).join('\n')};

// API Endpoint IDs
export type APIEndpointId = 
${apis.map(api => `  | '${api.id}'`).join('\n')};
`;
}

function generateClient(apis: RapidAPIEndpoint[]): string {
  const methods = apis.map(api => {
    const methodName = camelCase(api.id);
    const requestType = `${pascalCase(api.id)}Request`;
    const responseType = `${pascalCase(api.id)}Response`;

    return `  /**
   * ${api.description}
   * @param request - Request parameters
   * @returns Promise<${responseType}>
   */
  async ${methodName}(request: ${requestType}): Promise<APIResponse<${responseType}>> {
    try {
      const response = await this.makeRequest('${api.baseUrl}${api.endpoint}', {
        method: '${api.method}',
        headers: {
          'X-RapidAPI-Key': this.config.apiKey,
          'X-RapidAPI-Host': '${api.headers['X-RapidAPI-Host']}',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      return {
        success: true,
        data: response,
        statusCode: 200
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        statusCode: 500
      };
    }
  }`;
  }).join('\n\n');

  return `/**
 * Police-Raider RapidAPI Client
 * Generated TypeScript client for RapidAPI endpoints
 */

import { RapidAPIConfig, APIResponse } from './types';
${apis.map(api => `import { ${pascalCase(api.id)}Request, ${pascalCase(api.id)}Response } from './types';`).join('\n')}

export class PoliceRaiderAPIClient {
  private config: RapidAPIConfig;

  constructor(config: RapidAPIConfig) {
    this.config = {
      timeout: 30000,
      retryAttempts: 3,
      ...config
    };
  }

  private async makeRequest(url: string, options: RequestInit): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

${methods}

  /**
   * Test API connection with a simple endpoint
   */
  async testConnection(): Promise<APIResponse<any>> {
    try {
      // Use the ID Verify endpoint for testing
      const testRequest = {
        firstName: 'Test',
        lastName: 'User'
      };
      
      return await this.idVerify(testRequest);
    } catch (error) {
      return {
        success: false,
        data: null,
        error: 'Connection test failed: ' + (error instanceof Error ? error.message : 'Unknown error')
      };
    }
  }
}

export default PoliceRaiderAPIClient;
`;
}

function generateExamples(apis: RapidAPIEndpoint[]): string {
  const examples = apis.map(api => {
    const methodName = camelCase(api.id);
    const exampleParams = api.parameters.reduce((acc, param) => {
      let exampleValue: string;
      
      switch (param.type) {
        case 'string':
          exampleValue = param.example || (param.name.includes('email') ? '"john.doe@example.com"' : 
                                         param.name.includes('state') ? '"CA"' :
                                         param.name.includes('vin') ? '"1HGBH41JXMN109186"' :
                                         '"example"');
          break;
        case 'number':
          exampleValue = param.example || '2023';
          break;
        default:
          exampleValue = '"example"';
      }
      
      acc[param.name] = exampleValue;
      return acc;
    }, {} as Record<string, string>);

    return `// ${api.name} Example
async function ${methodName}Example() {
  const client = new PoliceRaiderAPIClient({
    apiKey: 'your-rapidapi-key-here'
  });

  try {
    const result = await client.${methodName}({
${Object.entries(exampleParams).map(([key, value]) => `      ${key}: ${value}`).join(',\n')}
    });

    if (result.success) {
      console.log('${api.name} Success:', result.data);
    } else {
      console.error('${api.name} Error:', result.error);
    }
  } catch (error) {
    console.error('${api.name} Exception:', error);
  }
}`;
  }).join('\n\n');

  return `/**
 * Police-Raider RapidAPI Client Examples
 * 
 * This file contains usage examples for all API endpoints.
 * Replace 'your-rapidapi-key-here' with your actual RapidAPI key.
 */

import PoliceRaiderAPIClient from './client';

${examples}

// Combined example using multiple APIs for comprehensive background check
async function comprehensiveBackgroundCheck() {
  const client = new PoliceRaiderAPIClient({
    apiKey: 'your-rapidapi-key-here'
  });

  const firstName = 'John';
  const lastName = 'Doe';
  const ssn = '123-45-6789';

  console.log('Starting comprehensive background check...');

  // 1. Identity Verification
  const idVerifyResult = await client.idVerify({
    firstName,
    lastName,
    ssn
  });

  // 2. Criminal History Check
  const criminalHistoryResult = await client.criminalHistory({
    firstName,
    lastName,
    ssn
  });

  // 3. Sex Offender Registry Check
  const sexOffenderResult = await client.sexOffender({
    firstName,
    lastName
  });

  // 4. Employment Verification
  const employmentResult = await client.verifyEmployment({
    firstName,
    lastName,
    employerName: 'Example Corp'
  });

  // Compile results
  const backgroundCheckReport = {
    subject: { firstName, lastName },
    identityVerification: idVerifyResult,
    criminalHistory: criminalHistoryResult,
    sexOffenderCheck: sexOffenderResult,
    employmentVerification: employmentResult,
    timestamp: new Date().toISOString()
  };

  console.log('Background Check Complete:', backgroundCheckReport);
  return backgroundCheckReport;
}

// Export all examples
export {
${apis.map(api => `  ${camelCase(api.id)}Example`).join(',\n')},
  comprehensiveBackgroundCheck
};
`;
}

function generateReadme(apis: RapidAPIEndpoint[]): string {
  return `# Police-Raider RapidAPI Client

A comprehensive TypeScript client for RapidAPI endpoints used in law enforcement, background checks, and verification services.

## 🚀 Features

- **${apis.length} Pre-configured APIs** for comprehensive background checks
- **TypeScript Support** with full type definitions
- **Error Handling** with retry mechanisms
- **Timeout Control** for reliable API calls
- **Easy Integration** with existing applications

## 📦 Installation

\`\`\`bash
npm install
\`\`\`

## 🔧 Configuration

Get your RapidAPI key from [RapidAPI](https://rapidapi.com) and configure the client:

\`\`\`typescript
import PoliceRaiderAPIClient from './client';

const client = new PoliceRaiderAPIClient({
  apiKey: 'your-rapidapi-key-here',
  timeout: 30000,        // Optional: request timeout in ms
  retryAttempts: 3       // Optional: retry attempts on failure
});
\`\`\`

## 🎯 Available APIs

### Identity Verification
${apis.filter(api => api.category === 'Identity Verification').map(api => `- **${api.name}**: ${api.description}`).join('\n')}

### Criminal Background
${apis.filter(api => api.category === 'Criminal Background').map(api => `- **${api.name}**: ${api.description}`).join('\n')}

### Employment Verification
${apis.filter(api => api.category === 'Employment Verification').map(api => `- **${api.name}**: ${api.description}`).join('\n')}

### License Verification
${apis.filter(api => api.category === 'License Verification').map(api => `- **${api.name}**: ${api.description}`).join('\n')}

### Vehicle Verification
${apis.filter(api => api.category === 'Vehicle Verification').map(api => `- **${api.name}**: ${api.description}`).join('\n')}

### Other Services
${apis.filter(api => !['Identity Verification', 'Criminal Background', 'Employment Verification', 'License Verification', 'Vehicle Verification'].includes(api.category)).map(api => `- **${api.name}**: ${api.description}`).join('\n')}

## 📖 Usage Examples

### Basic Identity Verification
\`\`\`typescript
const result = await client.idVerify({
  firstName: 'John',
  lastName: 'Doe',
  ssn: '123-45-6789'
});

if (result.success) {
  console.log('Verification successful:', result.data);
} else {
  console.error('Verification failed:', result.error);
}
\`\`\`

### Criminal History Check
\`\`\`typescript
const result = await client.criminalHistory({
  firstName: 'John',
  lastName: 'Doe',
  dateOfBirth: '1990-01-01'
});
\`\`\`

### Vehicle History Report
\`\`\`typescript
const result = await client.verifyVehicleHistory({
  vin: '1HGBH41JXMN109186'
});
\`\`\`

## 🔄 Comprehensive Background Check

Run multiple checks in sequence:

\`\`\`typescript
import { comprehensiveBackgroundCheck } from './examples';

const report = await comprehensiveBackgroundCheck();
console.log('Complete background report:', report);
\`\`\`

## 🛡️ Error Handling

All API methods return a standardized response:

\`\`\`typescript
interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  statusCode?: number;
}
\`\`\`

## 🔧 API Reference

For detailed parameter information and response formats, see:
- \`types.ts\` - Type definitions
- \`examples.ts\` - Usage examples
- Individual API documentation on [RapidAPI](https://rapidapi.com)

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support with this client, please open an issue on GitHub.
For RapidAPI-specific questions, visit [RapidAPI Support](https://rapidapi.com/support).

---

**Generated by Police-Raider RapidAPI Generator**  
🚀 [Visit the generator](https://jcotebcs.github.io/Police-Raider)
`;
}

function generatePackageJson(): string {
  return JSON.stringify({
    "name": "police-raider-api-client",
    "version": "1.0.0",
    "description": "TypeScript client for Police-Raider RapidAPI endpoints",
    "main": "dist/client.js",
    "types": "dist/types.d.ts",
    "scripts": {
      "build": "tsc",
      "dev": "tsc --watch",
      "test": "node examples.js"
    },
    "keywords": [
      "rapidapi",
      "police",
      "background-check",
      "verification",
      "typescript",
      "api-client"
    ],
    "author": "Police-Raider",
    "license": "MIT",
    "dependencies": {
      "node-fetch": "^3.3.0"
    },
    "devDependencies": {
      "@types/node": "^20.0.0",
      "typescript": "^5.0.0"
    },
    "files": [
      "dist/**/*",
      "README.md"
    ]
  }, null, 2);
}

// Utility functions
function pascalCase(str: string): string {
  return str.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('');
}

function camelCase(str: string): string {
  const pascal = pascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function mapTSType(type: string): string {
  switch (type) {
    case 'string': return 'string';
    case 'number': return 'number';
    case 'boolean': return 'boolean';
    case 'array': return 'any[]';
    case 'object': return 'Record<string, any>';
    default: return 'any';
  }
}