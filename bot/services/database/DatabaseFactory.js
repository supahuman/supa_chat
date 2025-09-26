import VectorDBInterface from './VectorDBInterface.js';
import MongoDBAdapter from './MongoDBAdapter.js';
import SupabaseAdapter from './SupabaseAdapter.js';

/**
 * Factory class for creating database connections
 * Centralizes database type selection and configuration
 */
class DatabaseFactory {
  /**
   * Create a database connection based on type
   * @param {string} type - Database type (mongodb, supabase, etc.)
   * @param {Object} config - Database configuration
   * @returns {VectorDBInterface} Database adapter instance
   */
  static create(type, config) {
    if (!type || !config) {
      throw new Error('Database type and config are required');
    }

    switch (type.toLowerCase()) {
      case 'mongodb':
      case 'mongodb_atlas':
        return new MongoDBAdapter(config);
      
      case 'supabase':
        return new SupabaseAdapter(config);
      
      default:
        throw new Error(`Unsupported database type: ${type}`);
    }
  }

  /**
   * Get list of supported database types
   * @returns {Array} Array of supported database types
   */
  static getSupportedTypes() {
    return ['mongodb', 'supabase'];
  }

  /**
   * Validate database configuration
   * @param {string} type - Database type
   * @param {Object} config - Database configuration
   * @returns {Object} Validation result
   */
  static validateConfig(type, config) {
    const errors = [];

    if (!type) {
      errors.push('Database type is required');
    }

    if (!config) {
      errors.push('Database configuration is required');
    }

    // Type-specific validation
    switch (type?.toLowerCase()) {
      case 'mongodb':
        if (!config.connectionString) {
          errors.push('MongoDB connection string is required');
        }
        break;
      
      case 'supabase':
        if (!config.url || !config.key) {
          errors.push('Supabase URL and API key are required');
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export default DatabaseFactory;
