#!/usr/bin/env node

/**
 * Security scanning script for Police Raider application
 * Performs comprehensive security analysis and generates reports
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class SecurityScanner {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      vulnerabilities: [],
      warnings: [],
      recommendations: [],
      summary: {
        criticalIssues: 0,
        highIssues: 0,
        mediumIssues: 0,
        lowIssues: 0
      }
    };
    this.projectRoot = process.cwd();
  }

  /**
   * Run comprehensive security scan
   */
  async runScan() {
    console.log('🔒 Starting Police Raider Security Scan...\n');

    try {
      await this.scanDependencies();
      await this.scanSourceCode();
      await this.scanConfiguration();
      await this.scanSecrets();
      await this.generateReport();
      
      console.log('\n✅ Security scan completed successfully!');
      process.exit(this.results.summary.criticalIssues > 0 ? 1 : 0);
    } catch (error) {
      console.error('❌ Security scan failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Scan dependencies for known vulnerabilities
   */
  async scanDependencies() {
    console.log('📦 Scanning dependencies...');
    
    try {
      // Run npm audit
      const auditOutput = execSync('npm audit --json', { encoding: 'utf8' });
      const auditResults = JSON.parse(auditOutput);
      
      if (auditResults.vulnerabilities) {
        Object.entries(auditResults.vulnerabilities).forEach(([pkg, vuln]) => {
          this.addVulnerability(
            vuln.severity,
            'dependency',
            `Vulnerable dependency: ${pkg}`,
            `Package ${pkg} has ${vuln.severity} severity vulnerability. ${vuln.title || ''}`
          );
        });
      }
    } catch (error) {
      if (error.status !== 0) {
        this.addWarning('dependency', 'NPM audit found vulnerabilities', error.stdout);
      }
    }

    // Check for outdated dependencies
    try {
      const outdatedOutput = execSync('npm outdated --json', { encoding: 'utf8' });
      if (outdatedOutput.trim()) {
        const outdated = JSON.parse(outdatedOutput);
        Object.keys(outdated).forEach(pkg => {
          this.addWarning('dependency', `Outdated package: ${pkg}`, 
            `Package ${pkg} is outdated. Consider updating for security fixes.`);
        });
      }
    } catch (error) {
      // npm outdated exits with code 1 when outdated packages are found
    }
  }

  /**
   * Scan source code for security issues
   */
  async scanSourceCode() {
    console.log('🔍 Scanning source code...');
    
    const sourceFiles = await this.findFiles(['src/**/*.js'], []);
    
    for (const file of sourceFiles) {
      await this.scanFile(file);
    }
  }

  /**
   * Scan individual file for security issues
   */
  async scanFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        const lineNum = index + 1;
        
        // Check for hardcoded secrets
        if (this.containsSecret(line)) {
          this.addVulnerability('high', 'secret', 
            `Potential hardcoded secret in ${filePath}:${lineNum}`,
            `Line contains what appears to be a hardcoded secret: ${line.trim()}`);
        }
        
        // Check for SQL injection vulnerabilities
        if (this.containsSQLInjection(line)) {
          this.addVulnerability('medium', 'sql-injection',
            `Potential SQL injection in ${filePath}:${lineNum}`,
            `Line may be vulnerable to SQL injection: ${line.trim()}`);
        }
        
        // Check for eval usage
        if (line.includes('eval(') && !line.trim().startsWith('//')) {
          this.addVulnerability('high', 'code-injection',
            `Use of eval() in ${filePath}:${lineNum}`,
            'eval() can lead to code injection vulnerabilities');
        }
        
        // Check for console.log in production code
        if (line.includes('console.log') && !filePath.includes('test')) {
          this.addWarning('information-disclosure', 
            `Console.log found in ${filePath}:${lineNum}`,
            'Remove console.log statements from production code');
        }
      });
      
    } catch (error) {
      this.addWarning('file-scan', `Could not scan ${filePath}`, error.message);
    }
  }

  /**
   * Scan configuration files
   */
  async scanConfiguration() {
    console.log('⚙️  Scanning configuration...');
    
    // Check .env files
    const envFiles = await this.findFiles(['.env*'], ['.env.example']);
    for (const envFile of envFiles) {
      await this.scanEnvFile(envFile);
    }
    
    // Check package.json
    await this.scanPackageJson();
    
    // Check Docker configuration
    if (await this.fileExists('Dockerfile')) {
      await this.scanDockerfile();
    }
  }

  /**
   * Scan environment files
   */
  async scanEnvFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        if (line.trim() && !line.startsWith('#')) {
          const [key, value] = line.split('=');
          
          if (value && value.length < 32 && 
              (key.includes('SECRET') || key.includes('PASSWORD') || key.includes('KEY'))) {
            this.addVulnerability('medium', 'weak-secret',
              `Weak secret in ${filePath}:${index + 1}`,
              `Secret ${key} appears to be too short or weak`);
          }
          
          if (value && (value.includes('password') || value.includes('123') || value === 'changeme')) {
            this.addVulnerability('high', 'default-credential',
              `Default/weak credential in ${filePath}:${index + 1}`,
              `Credential ${key} appears to use a default or weak value`);
          }
        }
      });
    } catch (error) {
      this.addWarning('config-scan', `Could not scan ${filePath}`, error.message);
    }
  }

  /**
   * Scan package.json for security issues
   */
  async scanPackageJson() {
    try {
      const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
      
      // Check for scripts that might be dangerous
      if (packageJson.scripts) {
        Object.entries(packageJson.scripts).forEach(([scriptName, script]) => {
          if (script.includes('rm -rf') || script.includes('sudo')) {
            this.addWarning('dangerous-script', 
              `Potentially dangerous script: ${scriptName}`,
              `Script contains potentially dangerous commands: ${script}`);
          }
        });
      }
      
      // Check for missing security-related fields
      if (!packageJson.homepage) {
        this.addWarning('missing-metadata', 'Missing homepage field', 
          'Consider adding homepage field for transparency');
      }
      
      if (!packageJson.repository) {
        this.addWarning('missing-metadata', 'Missing repository field',
          'Consider adding repository field for transparency');
      }
      
    } catch (error) {
      this.addWarning('config-scan', 'Could not scan package.json', error.message);
    }
  }

  /**
   * Scan Dockerfile for security issues
   */
  async scanDockerfile() {
    try {
      const content = await fs.readFile('Dockerfile', 'utf8');
      const lines = content.split('\n');
      
      let runningAsRoot = true;
      
      lines.forEach((line, index) => {
        const trimmed = line.trim().toUpperCase();
        
        // Check for running as root
        if (trimmed.startsWith('USER ') && !trimmed.includes('USER ROOT')) {
          runningAsRoot = false;
        }
        
        // Check for ADD instead of COPY
        if (trimmed.startsWith('ADD ') && !trimmed.includes('.tar')) {
          this.addWarning('docker-security', 
            `Use COPY instead of ADD in Dockerfile:${index + 1}`,
            'ADD has additional features that can be security risks');
        }
        
        // Check for --privileged
        if (line.includes('--privileged')) {
          this.addVulnerability('high', 'docker-security',
            `Privileged mode in Dockerfile:${index + 1}`,
            'Avoid using privileged mode in containers');
        }
      });
      
      if (runningAsRoot) {
        this.addVulnerability('medium', 'docker-security',
          'Container running as root',
          'Container should run as non-root user for security');
      }
      
    } catch (error) {
      this.addWarning('config-scan', 'Could not scan Dockerfile', error.message);
    }
  }

  /**
   * Scan for exposed secrets
   */
  async scanSecrets() {
    console.log('🔐 Scanning for secrets...');
    
    const secretPatterns = [
      { name: 'AWS Access Key', pattern: /AKIA[0-9A-Z]{16}/ },
      { name: 'AWS Secret Key', pattern: /[0-9a-zA-Z/+]{40}/ },
      { name: 'GitHub Token', pattern: /ghp_[0-9a-zA-Z]{36}/ },
      { name: 'JWT Token', pattern: /eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/ },
      { name: 'Private Key', pattern: /-----BEGIN [A-Z ]+PRIVATE KEY-----/ },
      { name: 'API Key', pattern: /[aA][pP][iI][_]?[kK][eE][yY].*[=:]\s*['"][0-9a-zA-Z]{32,}['"]/ }
    ];
    
    const files = await this.findFiles(['src/**/*', '*.js', '*.json', '*.md'], 
      ['node_modules/**', '.git/**', 'logs/**']);
    
    for (const file of files) {
      await this.scanFileForSecrets(file, secretPatterns);
    }
  }

  /**
   * Scan file for secret patterns
   */
  async scanFileForSecrets(filePath, patterns) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        patterns.forEach(pattern => {
          if (pattern.pattern.test(line)) {
            this.addVulnerability('critical', 'exposed-secret',
              `Potential ${pattern.name} in ${filePath}:${index + 1}`,
              `Line may contain exposed ${pattern.name}`);
          }
        });
      });
      
    } catch (error) {
      // Skip binary files and other unreadable files
    }
  }

  /**
   * Generate comprehensive security report
   */
  async generateReport() {
    console.log('📄 Generating security report...');
    
    const reportDir = path.join(this.projectRoot, 'security-reports');
    await fs.mkdir(reportDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(reportDir, `security-report-${timestamp}.json`);
    
    // Calculate summary
    this.results.vulnerabilities.forEach(vuln => {
      switch (vuln.severity) {
        case 'critical': this.results.summary.criticalIssues++; break;
        case 'high': this.results.summary.highIssues++; break;
        case 'medium': this.results.summary.mediumIssues++; break;
        case 'low': this.results.summary.lowIssues++; break;
      }
    });
    
    // Add recommendations
    this.generateRecommendations();
    
    await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));
    
    console.log(`\n📊 Security Report Summary:`);
    console.log(`   Critical Issues: ${this.results.summary.criticalIssues}`);
    console.log(`   High Issues: ${this.results.summary.highIssues}`);
    console.log(`   Medium Issues: ${this.results.summary.mediumIssues}`);
    console.log(`   Low Issues: ${this.results.summary.lowIssues}`);
    console.log(`   Warnings: ${this.results.warnings.length}`);
    console.log(`\n   Report saved to: ${reportPath}`);
  }

  /**
   * Generate security recommendations
   */
  generateRecommendations() {
    this.results.recommendations = [
      'Regularly update dependencies to patch known vulnerabilities',
      'Use environment variables for all sensitive configuration',
      'Implement proper input validation and sanitization',
      'Use HTTPS in production environments',
      'Implement proper error handling that doesn\'t leak sensitive information',
      'Use security headers (helmet.js is already configured)',
      'Implement rate limiting for all API endpoints',
      'Use strong, unique secrets for JWT signing',
      'Regularly rotate API keys and secrets',
      'Implement proper logging and monitoring',
      'Use parameterized queries to prevent SQL injection',
      'Implement proper session management',
      'Run containers as non-root users',
      'Keep Docker images updated',
      'Implement proper backup and recovery procedures'
    ];
  }

  // Helper methods
  addVulnerability(severity, type, title, description) {
    this.results.vulnerabilities.push({
      severity, type, title, description,
      timestamp: new Date().toISOString()
    });
  }

  addWarning(type, title, description) {
    this.results.warnings.push({
      type, title, description,
      timestamp: new Date().toISOString()
    });
  }

  containsSecret(line) {
    const secretIndicators = [
      /password\s*[=:]\s*['"][^'"]{8,}['"]/i,
      /secret\s*[=:]\s*['"][^'"]{8,}['"]/i,
      /key\s*[=:]\s*['"][^'"]{16,}['"]/i,
      /token\s*[=:]\s*['"][^'"]{16,}['"]/i
    ];
    
    return secretIndicators.some(pattern => pattern.test(line));
  }

  containsSQLInjection(line) {
    return line.includes('query(') && 
           (line.includes('req.') || line.includes('${')) &&
           !line.includes('?') && !line.includes('$1');
  }

  async findFiles(patterns, excludePatterns = []) {
    // Simplified file finder - in a real implementation you'd use glob
    const files = [];
    try {
      const { execSync } = require('child_process');
      const result = execSync('find . -type f -name "*.js" -o -name "*.json" -o -name "*.md"', 
        { encoding: 'utf8' });
      files.push(...result.split('\n').filter(f => f.trim()));
    } catch (error) {
      // Fallback for systems without find
    }
    return files.filter(f => !excludePatterns.some(pattern => f.includes(pattern.replace('/**', ''))));
  }

  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

// Run the security scan
if (require.main === module) {
  const scanner = new SecurityScanner();
  scanner.runScan();
}

module.exports = SecurityScanner;