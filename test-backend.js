// Simple test to check if backend is running
fetch('http://localhost:4000/health')
  .then(response => response.json())
  .then(data => console.log('✅ Backend is running:', data))
  .catch(error => console.error('❌ Backend connection failed:', error));
