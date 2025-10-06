# MongoDB Atlas Vector Search Setup

This document explains how to set up MongoDB Atlas Vector Search for the chatbot platform.

## Prerequisites

- MongoDB Atlas cluster (M10 or higher recommended)
- Atlas Search enabled on your cluster

## Vector Search Indexes

### 1. Agent Vectors Index

**Index Name:** `vector_index`
**Collection:** `agentvectors`

**Configuration:**
```json
{
  "fields": [
    {
      "numDimensions": 1536,
      "path": "embedding",
      "similarity": "cosine",
      "type": "vector"
    }
  ]
}
```

### 2. Conversation Messages Index

**Index Name:** `conversation_vector_index`
**Collection:** `conversations`

**Configuration:**
```json
{
  "fields": [
    {
      "numDimensions": 1536,
      "path": "messages.embedding",
      "similarity": "cosine",
      "type": "vector"
    }
  ]
}
```

## Setup Instructions

### Option 1: MongoDB Atlas UI

1. Go to your MongoDB Atlas dashboard
2. Navigate to your cluster
3. Click on "Search" in the left sidebar
4. Click "Create Index"
5. Select your database and collection
6. Choose "Vector Search" as the index type
7. Paste the configuration JSON for the appropriate index
8. Click "Create Index"

### Option 2: MongoDB CLI

```bash
# Create Agent Vectors index
mongocli atlas search index create \
  --clusterName "your-cluster-name" \
  --db "your-database-name" \
  --collection "agentvectors" \
  --file vector_index.json

# Create Conversations index
mongocli atlas search index create \
  --clusterName "your-cluster-name" \
  --db "your-database-name" \
  --collection "conversations" \
  --file conversation_vector_index.json
```

### Option 3: MongoDB Compass

1. Open MongoDB Compass
2. Connect to your Atlas cluster
3. Navigate to your database and collection
4. Go to the "Search" tab
5. Click "Create Index"
6. Choose "Vector Search"
7. Paste the configuration JSON
8. Click "Create Index"

## Verification

After creating the indexes, you can verify they're working by:

1. **Check Index Status:** In Atlas UI, go to Search → Indexes and verify both indexes show "Ready" status
2. **Test Vector Search:** Run a test query to ensure vector search is working
3. **Monitor Performance:** Check Atlas metrics for search performance

## Performance Optimization

### Index Settings

- **Dimensions:** 1536 (OpenAI text-embedding-3-small)
- **Similarity:** cosine (best for text embeddings)
- **Dynamic:** true (allows flexible schema)

### Query Optimization

- Use appropriate `numCandidates` values (10x your limit)
- Filter results after vector search for better performance
- Monitor index usage and adjust thresholds as needed

## Troubleshooting

### Common Issues

1. **Index Not Found:** Ensure index name matches exactly (`vector_index`, `conversation_vector_index`)
2. **Dimension Mismatch:** Verify embeddings are exactly 1536 dimensions
3. **Performance Issues:** Check `numCandidates` and `limit` values
4. **No Results:** Verify similarity threshold settings

### Fallback Behavior

The system includes automatic fallback to manual cosine similarity if Atlas Vector Search fails, ensuring reliability.

## Cost Considerations

- Atlas Vector Search is available on M10+ clusters
- Search operations consume Atlas Search units
- Monitor usage in Atlas dashboard
- Consider caching frequently accessed vectors

## Support

For issues with Atlas Vector Search setup:
1. Check MongoDB Atlas documentation
2. Verify cluster tier and search capabilities
3. Review index configuration syntax
4. Test with sample data first
