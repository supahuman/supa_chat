import { getModelInfo } from '../config/globalModel.js';

/**
 * Controller for model-related endpoints
 * Provides information about the global model configuration
 */
class ModelController {
  /**
   * Get current model information
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getModelInfo(req, res) {
    try {
      const modelInfo = getModelInfo();
      
      res.json({
        success: true,
        data: modelInfo
      });
    } catch (error) {
      console.error('❌ Error getting model info:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get model information'
      });
    }
  }
}

export default new ModelController();
