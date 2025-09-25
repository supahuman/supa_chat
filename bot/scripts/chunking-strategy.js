#!/usr/bin/env node

import { Command } from 'commander';
import dotenv from 'dotenv';
import ChunkingStrategyManager from '../services/chunkingStrategyManager.js';

// Load environment variables
dotenv.config();

const program = new Command();
const manager = new ChunkingStrategyManager();

program
  .name('chunking-strategy')
  .description('Manage chunking strategies for the knowledge base')
  .version('1.0.0');

program
  .command('status')
  .description('Show current chunking strategy and database status')
  .action(async () => {
    try {
      const status = await manager.getStatus();
      
      console.log('📊 Chunking Strategy Status');
      console.log('========================');
      console.log(`Current Strategy: ${status.currentStrategy}`);
      console.log(`Total Documents: ${status.totalDocuments}`);
      console.log(`Custom Documents: ${status.customDocuments}`);
      console.log(`LangChain Documents: ${status.langchainDocuments}`);
      console.log(`Is Mixed: ${status.isMixed ? '⚠️ Yes' : '✅ No'}`);
      console.log(`Is Clean: ${status.isClean ? '✅ Yes' : '⚠️ No'}`);
      
      if (status.isMixed) {
        console.log('\n⚠️ Warning: Database contains mixed chunking strategies!');
        console.log('This can cause inconsistent search results.');
        console.log('Use "chunking-strategy switch" to fix this.');
      }
      
    } catch (error) {
      console.error('❌ Error getting status:', error.message);
      process.exit(1);
    }
  });

program
  .command('switch <strategy>')
  .description('Switch chunking strategy (custom or langchain)')
  .option('-f, --force', 'Force switch even if database has mixed strategies')
  .option('--no-reload', 'Skip reloading knowledge base after switch')
  .action(async (strategy, options) => {
    try {
      const result = await manager.switchStrategy(strategy, {
        force: options.force,
        reload: options.reload
      });
      
      if (result.success) {
        console.log(`✅ ${result.message}`);
        console.log('\n📝 Next steps:');
        console.log('1. Update CHUNKING_STRATEGY in your .env file');
        console.log('2. Restart your server');
      } else {
        console.error(`❌ ${result.error}`);
        process.exit(1);
      }
      
    } catch (error) {
      console.error('❌ Error switching strategy:', error.message);
      process.exit(1);
    }
  });

program
  .command('clean')
  .description('Clean the entire knowledge base database')
  .option('-f, --force', 'Force cleanup without confirmation')
  .action(async (options) => {
    try {
      if (!options.force) {
        console.log('⚠️ This will delete ALL documents from the knowledge base!');
        console.log('Use --force to proceed without confirmation.');
        process.exit(1);
      }
      
      const result = await manager.cleanDatabase();
      
      if (result.success) {
        console.log(`✅ Cleaned database: ${result.deletedCount} documents deleted`);
      } else {
        console.error(`❌ Error cleaning database: ${result.error}`);
        process.exit(1);
      }
      
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  });

program
  .command('reload')
  .description('Reload knowledge base with current strategy')
  .action(async () => {
    try {
      const result = await manager.reloadKnowledgeBase();
      
      if (result.success) {
        console.log(`✅ Knowledge base reloaded: ${result.count} chunks`);
      } else {
        console.error(`❌ Error reloading: ${result.error}`);
        process.exit(1);
      }
      
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  });

program
  .command('validate')
  .description('Validate database consistency')
  .action(async () => {
    try {
      const validation = await manager.validateDatabase();
      
      console.log('🔍 Database Validation');
      console.log('====================');
      
      if (validation.isValid) {
        console.log('✅ Database is consistent and valid');
      } else {
        console.log('⚠️ Issues found:');
        validation.issues.forEach(issue => console.log(`  - ${issue}`));
      }
      
      console.log('\n📊 Status:', validation.status);
      
    } catch (error) {
      console.error('❌ Error validating database:', error.message);
      process.exit(1);
    }
  });

program
  .command('config')
  .description('Show current chunking configuration')
  .action(() => {
    const config = manager.getChunkingConfig();
    
    console.log('⚙️ Chunking Configuration');
    console.log('========================');
    console.log(`Strategy: ${config.strategy}`);
    console.log(`Chunk Size: ${config.chunkSize}`);
    console.log(`Chunk Overlap: ${config.chunkOverlap}`);
    console.log(`Supported Types: ${config.supportedTypes.join(', ')}`);
    console.log(`Embedding Provider: ${config.embeddingProvider}`);
  });

program.parse();
