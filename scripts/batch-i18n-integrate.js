/**
 * Batch i18n Integration Script for EVzone My Accounts
 * 
 * This script helps integrate i18n into multiple React components automatically.
 * 
 * Usage:
 *   node scripts/batch-i18n-integrate.js <feature-folder>
 * 
 * Example:
 *   node scripts/batch-i18n-integrate.js auth/verify-phone
 *   node scripts/batch-i18n-integrate.js auth/mfa
 *   node scripts/batch-i18n-integrate.js auth/error
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FEATURES_DIR = path.join(__dirname, '../src/features');

// Common patterns to replace with i18n
const REPLACEMENTS = [
  // Headers and titles
  { pattern: /<AuthHeader\s+title="([^"]+)"\s+subtitle="([^"]+)"\s*\/>/g, replace: '<AuthHeader title={t("$1")} subtitle={t("$2")} />' },
  
  // Buttons
  { pattern: />Sign In</g, replace: '>{t("auth.common.signIn")}</' },
  { pattern: />Sign Up</g, replace: '>{t("auth.common.signUp")}</' },
  { pattern: />Continue</g, replace: '>{t("auth.common.continue")}</' },
  { pattern: />Back</g, replace: '>{t("auth.common.back")}</' },
  { pattern: />Cancel</g, replace: '>{t("auth.common.cancel")}</' },
  { pattern: />Send</g, replace: '>{t("auth.common.send")}</' },
  { pattern: />Verify</g, replace: '>{t("auth.common.verify")}</' },
  { pattern: />Save</g, replace: '>{t("auth.common.save")}</' },
  { pattern: />Submit</g, replace: '>{t("auth.common.submit")}</' },
  
  // Common auth strings
  { pattern: />Forgot Password\?<\/Typography>/g, replace: '>{t("auth.signIn.forgotPassword")}</' },
  { pattern: />Don't have an account\?<\/Typography>/g, replace: '>{t("auth.signIn.noAccount")}</' },
  { pattern: />Already have an account\?<\/Typography>/g, replace: '>{t("auth.signUp.alreadyHaveAccount")}</' },
  { pattern: />or continue with</g, replace: '>{t("auth.signIn.orContinueWith")}</' },
  { pattern: />Loading...<\/Typography>/g, replace: '>{t("auth.common.loading")}</' },
  { pattern: />Initializing secure session...<\/Typography>/g, replace: '>{t("auth.loading.session")}</' },
  { pattern: />Authentication Error<\/Typography>/g, replace: '>{t("auth.error.title")}</' },
  { pattern: />Failed to initialize secure session.<\/Typography>/g, replace: '>{t("auth.error.sessionFailed")}</' },
  { pattern: />Retry<\/Button>/g, replace: '>{t("auth.error.retry")}</' },
];

function addImportStatement(content) {
  // Check if already has i18n import
  if (content.includes('import { useTranslation } from "react-i18next";')) {
    return content;
  }
  
  // Add import at the top after existing imports
  const lines = content.split('\n');
  const importIndex = lines.findIndex(line => line.startsWith('import React'));
  
  if (importIndex >= 0) {
    lines.splice(importIndex + 1, 0, 'import { useTranslation } from "react-i18next";');
    return lines.join('\n');
  }
  
  // Fallback: add at the beginning
  return 'import { useTranslation } from "react-i18next";\n' + content;
}

function addHook(componentContent) {
  // Find the component function
  const componentPattern = /export default function (\w+)\(\)/;
  const match = componentContent.match(componentPattern);
  
  if (!match) return componentContent;
  
  const componentName = match[1];
  
  // Check if hook already exists
  if (componentContent.includes('const { t } = useTranslation')) {
    return componentContent;
  }
  
  // Add hook after function declaration
  return componentContent.replace(
    `export default function ${componentName}()`,
    `export default function ${componentName}() {\n  const { t } = useTranslation("common");`
  );
}

function integrateI18n(filePath) {
  console.log(`\n📄 Processing: ${filePath}`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Step 1: Add import statement
    content = addImportStatement(content);
    
    // Step 2: Add useTranslation hook
    content = addHook(content);
    
    // Step 3: Apply replacements
    REPLACEMENTS.forEach(({ pattern, replace }) => {
      content = content.replace(pattern, replace);
    });
    
    // Step 4: Write back if changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('✅ i18n integration applied!');
      return true;
    } else {
      console.log('⚠️  No changes made');
      return false;
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return false;
  }
}

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  let processed = 0;
  let failed = 0;
  
  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      const result = processDirectory(fullPath);
      processed += result.processed;
      failed += result.failed;
    } else if (file.endsWith('.tsx') && !file.includes('.test.') && !file.includes('.spec.')) {
      const success = integrateI18n(fullPath);
      if (success) processed++;
      else failed++;
    }
  });
  
  return { processed, failed };
}

// Main execution
const args = process.argv.slice(2);
const targetPath = args[0] || 'auth';

if (targetPath === 'help' || targetPath === '--help') {
  console.log(`
🔧 EVzone My Accounts - Batch i18n Integration Script

Usage:
  node scripts/batch-i18n-integrate.js <path>

Arguments:
  path     Relative path from src/features/
           - 'auth' - all auth pages
           - 'auth/verify-phone' - specific page
           - 'admin' - admin pages
           - 'dashboard' - dashboard pages

Examples:
  node scripts/batch-i18n-integrate.js auth
  node scripts/batch-i18n-integrate.js auth/verify-phone
  node scripts/batch-i18n-integrate.js admin
  `);
  process.exit(0);
}

const targetDir = path.join(FEATURES_DIR, targetPath);

if (!fs.existsSync(targetDir)) {
  console.error(`❌ Directory not found: ${targetDir}`);
  console.log(`\nAvailable directories:`);
  fs.readdirSync(FEATURES_DIR).forEach(dir => {
    if (fs.statSync(path.join(FEATURES_DIR, dir)).isDirectory()) {
      console.log(`  - ${dir}`);
    }
  });
  process.exit(1);
}

console.log(`\n🚀 Starting i18n integration for: ${targetPath}`);
console.log(`📁 Directory: ${targetDir}`);
console.log('='.repeat(50));

const { processed, failed } = processDirectory(targetDir);

console.log('='.repeat(50));
console.log(`\n📊 Summary:`);
console.log(`   Processed: ${processed} files`);
console.log(`   Failed: ${failed} files`);

if (processed > 0) {
  console.log(`\n✅ i18n integration complete!`);
  console.log(`\nNext steps:`);
  console.log(`   1. Review modified files`);
  console.log(`   2. Add translation keys to public/locales/en/common.json`);
  console.log(`   3. Test the application`);
}
