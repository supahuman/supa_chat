#!/usr/bin/env node

/**
 * Chunking Control CLI
 * Easy way to manage chunking strategy
 */

import { program } from 'commander';
import chunkingConfig from '../utils/chunkingConfig.js';
import fs from 'fs/promises';
import path from 'path';

program
  .name('chunking-control')
  .description('Control chunking strategy for the chatbot')
  .version('1.0.0');

// Show current configuration
program
  .command('status')
  .description('Show current chunking configuration')
  .action(async () => {
    const summary = chunkingConfig.getConfigSummary();
    
    console.log('\n🔧 Current Chunking Configuration:');
    console.log('=====================================');
    console.log(`Strategy: ${summary.current}`);
    console.log(`Name: ${summary.info.name}`);
    console.log(`Description: ${summary.info.description}`);
    console.log(`Supported Types: ${summary.info.supportedTypes.join(', ')}`);
    console.log(`Chunk Size: ${summary.info.chunkSize}`);
    console.log(`Chunk Overlap: ${summary.info.chunkOverlap}`);
    
    console.log('\n📋 Features:');
    summary.info.features.forEach(feature => {
      console.log(`  ✅ ${feature}`);
    });
    
    console.log('\n🌍 Environment Variables:');
    Object.entries(summary.envVars).forEach(([key, value]) => {
      console.log(`  ${key}=${value}`);
    });
  });

// List available strategies
program
  .command('list')
  .description('List all available chunking strategies')
  .action(() => {
    const strategies = chunkingConfig.getAllStrategies();
    
    console.log('\n📚 Available Chunking Strategies:');
    console.log('==================================');
    
    strategies.forEach(strategy => {
      console.log(`\n🔹 ${strategy.name} (${strategy.key})`);
      console.log(`   ${strategy.description}`);
      console.log(`   Supported: ${strategy.supportedTypes.join(', ')}`);
      console.log(`   Chunk Size: ${strategy.chunkSize}`);
      console.log(`   Features: ${strategy.features.length} features`);
    });
  });

// Switch strategy
program
  .command('switch <strategy>')
  .description('Switch to a different chunking strategy')
  .option('-c, --chunk-size <size>', 'Chunk size for LangChain strategy', '1000')
  .option('-o, --chunk-overlap <overlap>', 'Chunk overlap for LangChain strategy', '200')
  .option('-t, --types <types>', 'Supported file types (comma-separated)')
  .action(async (strategy, options) => {
    const config = {
      chunkSize: parseInt(options.chunkSize),
      chunkOverlap: parseInt(options.chunkOverlap),
      supportedTypes: options.types ? options.types.split(',') : undefined
    };
    
    // Validate configuration
    const validation = chunkingConfig.validateConfig(strategy, config);
    if (!validation.valid) {
      console.error('❌ Configuration validation failed:');
      validation.errors.forEach(error => console.error(`   ${error}`));
      process.exit(1);
    }
    
    try {
      // Update .env file
      await updateEnvFile(strategy, config);
      
      console.log(`✅ Successfully switched to ${strategy} chunking strategy`);
      console.log('\n🔄 Restart your bot to apply changes:');
      console.log('   pnpm dev');
      
    } catch (error) {
      console.error('❌ Failed to update configuration:', error.message);
      process.exit(1);
    }
  });

// Test file type support
program
  .command('test <fileType>')
  .description('Test if a file type is supported by current strategy')
  .action((fileType) => {
    const current = chunkingConfig.getCurrentStrategy();
    const supported = chunkingConfig.isFileTypeSupported(fileType);
    
    console.log(`\n🧪 File Type Support Test:`);
    console.log(`File Type: .${fileType}`);
    console.log(`Current Strategy: ${current}`);
    console.log(`Supported: ${supported ? '✅ Yes' : '❌ No'}`);
    
    if (!supported) {
      const strategies = chunkingConfig.getAllStrategies();
      const supportingStrategies = strategies.filter(s => 
        s.supportedTypes.includes(fileType)
      );
      
      if (supportingStrategies.length > 0) {
        console.log(`\n💡 Supported by: ${supportingStrategies.map(s => s.name).join(', ')}`);
      }
    }
  });

// Update .env file
async function updateEnvFile(strategy, config) {
  const envPath = path.join(process.cwd(), '.env');
  const envVars = chunkingConfig.getEnvVars(strategy);
  
  let envContent = '';
  
  try {
    envContent = await fs.readFile(envPath, 'utf-8');
  } catch (error) {
    // .env file doesn't exist, create it
    envContent = '';
  }
  
  // Update or add chunking-related variables
  const lines = envContent.split('\n');
  const updatedLines = [];
  const addedVars = new Set();
  
  for (const line of lines) {
    const [key] = line.split('=');
    
    if (key && envVars[key]) {
      // Update existing variable
      updatedLines.push(`${key}=${envVars[key]}`);
      addedVars.add(key);
    } else {
      // Keep existing line
      updatedLines.push(line);
    }
  }
  
  // Add new variables
  for (const [key, value] of Object.entries(envVars)) {
    if (!addedVars.has(key)) {
      updatedLines.push(`${key}=${value}`);
    }
  }
  
  // Write back to file
  await fs.writeFile(envPath, updatedLines.join('\n'));
}

// Parse command line arguments
program.parse();
