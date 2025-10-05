import CompanyService from '../services/CompanyService.js';
import mongoose from 'mongoose';

async function setupCompany() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/supa_chatbot';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Create a sample company
    const companyData = {
      name: 'Demo Company',
      domain: 'demo.com',
      adminUser: {
        name: 'Admin User',
        email: 'admin@demo.com'
      }
    };

    const result = await CompanyService.createCompany(companyData);
    
    if (result.success) {
      console.log('\n🎉 Company created successfully!');
      console.log('📋 Company Details:');
      console.log(`   Company ID: ${result.data.company.companyId}`);
      console.log(`   Company Name: ${result.data.company.name}`);
      console.log(`   API Key: ${result.data.company.apiKey}`);
      console.log('\n👤 Admin User Details:');
      console.log(`   User ID: ${result.data.adminUser.userId}`);
      console.log(`   Email: ${result.data.adminUser.email}`);
      console.log(`   Role: ${result.data.adminUser.role}`);
      
      console.log('\n🔧 Usage Example:');
      console.log('curl -X POST http://localhost:4000/api/company/agents \\');
      console.log('  -H "Content-Type: application/json" \\');
      console.log(`  -H "X-Company-Key: ${result.data.company.apiKey}" \\`);
      console.log(`  -H "X-User-ID: ${result.data.adminUser.userId}" \\`);
      console.log('  -d \'{"name": "My First Agent", "personality": "friendly and helpful"}\'');
    } else {
      console.error('❌ Failed to create company:', result.error);
    }

  } catch (error) {
    console.error('❌ Setup failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

setupCompany();
