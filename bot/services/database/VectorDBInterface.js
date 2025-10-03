/**
 * Abstract interface for all vector database implementations
 * Ensures consistent API across different database types
 */
class VectorDBInterface {
  /**
   * Connect to the database
   * @param {Object} config - Database configuration
   */
  async connect(config) {
    throw new Error('connect() method must be implemented');
  }

  /**
   * Search for similar documents using vector similarity
   * @param {Array} queryVector - Query embedding vector
   * @param {number} limit - Maximum number of results
   * @returns {Object} Search results with documents and scores
   */
  async search(queryVector, limit = 5) {
    throw new Error('search() method must be implemented');
  }

  /**
   * Add documents to the database
   * @param {Array} documents - Array of document objects
   * @returns {Object} Result with success status and count
   */
  async addDocuments(documents) {
    throw new Error('addDocuments() method must be implemented');
  }

  /**
   * Delete documents by IDs
   * @param {Array} documentIds - Array of document IDs to delete
   * @returns {Object} Result with success status and deleted count
   */
  async deleteDocuments(documentIds) {
    throw new Error('deleteDocuments() method must be implemented');
  }

  /**
   * Get database statistics
   * @returns {Object} Database stats (document count, size, etc.)
   */
  async getStats() {
    throw new Error('getStats() method must be implemented');
  }

  /**
   * Test database connection
   * @returns {boolean} Connection status
   */
  async testConnection() {
    throw new Error('testConnection() method must be implemented');
  }

  /**
   * Disconnect from database
   */
  async disconnect() {
    throw new Error('disconnect() method must be implemented');
  }
}

export default VectorDBInterface;
