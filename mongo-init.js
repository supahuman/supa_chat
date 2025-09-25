// MongoDB initialization script
db = db.getSiblingDB('supa_chatbot');

// Create collections
db.createCollection('knowledgebases');
db.createCollection('conversations');

// Create indexes for better performance
db.knowledgebases.createIndex({ "category": 1 });
db.knowledgebases.createIndex({ "title": 1 });
db.knowledgebases.createIndex({ "createdAt": -1 });
db.knowledgebases.createIndex({ "content": "text" });

db.conversations.createIndex({ "userId": 1 });
db.conversations.createIndex({ "sessionId": 1 });
db.conversations.createIndex({ "createdAt": -1 });

// Create a user for the application
db.createUser({
  user: 'app_user',
  pwd: 'app_password',
  roles: [
    {
      role: 'readWrite',
      db: 'supa_chatbot'
    }
  ]
});

print('Database initialized successfully');
