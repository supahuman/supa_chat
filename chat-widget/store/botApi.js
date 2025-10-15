import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const botApi = createApi({
  reducerPath: 'botApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_BOT_API_URL || 'http://localhost:4000',
    prepareHeaders: (headers) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
        tagTypes: ['Conversation', 'Clients', 'Client', 'Model', 'Agents', 'Agent', 'CompanyAgents'],
  endpoints: (builder) => ({
    sendMessage: builder.mutation({
      query: ({ message, sessionId, clientId = 'supa-chat' }) => ({
        url: `/api/client/${clientId}/bot`,
        method: 'POST',
        body: { message, sessionId },
      }),
      invalidatesTags: (result) => (result?.sessionId ? [{ type: 'Conversation', id: result.sessionId }] : []),
    }),
    getConversation: builder.query({
      query: (sessionId) => `/api/bot/conversations/${sessionId}`,
      providesTags: (result, error, sessionId) => [{ type: 'Conversation', id: sessionId }],
    }),
    // Client management endpoints
    getClients: builder.query({
      query: () => '/api/client',
      providesTags: ['Clients'],
    }),
    getClient: builder.query({
      query: (clientId) => `/api/client/${clientId}`,
      providesTags: (result, error, clientId) => [{ type: 'Client', id: clientId }],
    }),
    createClient: builder.mutation({
      query: (clientData) => ({
        url: '/api/client',
        method: 'POST',
        body: clientData,
      }),
      invalidatesTags: ['Clients'],
    }),
    updateClient: builder.mutation({
      query: ({ clientId, ...clientData }) => ({
        url: `/api/client/${clientId}`,
        method: 'PUT',
        body: clientData,
      }),
      invalidatesTags: (result, error, { clientId }) => [
        { type: 'Client', id: clientId },
        'Clients'
      ],
    }),
    deleteClient: builder.mutation({
      query: (clientId) => ({
        url: `/api/client/${clientId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Clients'],
    }),
    testDatabaseConnection: builder.mutation({
      query: (clientId) => ({
        url: `/api/client/${clientId}/test-database`,
        method: 'POST',
      }),
    }),
    testLLMConnection: builder.mutation({
      query: (clientId) => ({
        url: `/api/client/${clientId}/test-llm`,
        method: 'POST',
      }),
    }),
    // Global model information
    getModelInfo: builder.query({
      query: () => '/api/model/info',
      providesTags: ['Model'],
    }),
        
        // Company-scoped agent endpoints
        getCompanyAgents: builder.query({
          query: () => ({
            url: '/api/company/agents',
            headers: {
              'X-Company-Key': typeof window !== 'undefined' ? localStorage.getItem('companyApiKey') : '',
              'X-User-ID': typeof window !== 'undefined' ? localStorage.getItem('userId') : ''
            }
          }),
          providesTags: ['CompanyAgents'],
        }),

        getCompanyAgent: builder.query({
          query: (agentId) => ({
            url: `/api/company/agents/${agentId}`,
            headers: {
              'X-Company-Key': typeof window !== 'undefined' ? localStorage.getItem('companyApiKey') : '',
              'X-User-ID': typeof window !== 'undefined' ? localStorage.getItem('userId') : ''
            }
          }),
          providesTags: (result, error, agentId) => [{ type: 'CompanyAgents', id: agentId }],
        }),
        
        createCompanyAgent: builder.mutation({
          query: (agentData) => ({
            url: '/api/company/agents',
            method: 'POST',
            headers: {
              'X-Company-Key': typeof window !== 'undefined' ? localStorage.getItem('companyApiKey') : '',
              'X-User-ID': typeof window !== 'undefined' ? localStorage.getItem('userId') : ''
            },
            body: agentData,
          }),
          invalidatesTags: ['CompanyAgents'],
        }),

        updateCompanyAgent: builder.mutation({
          query: ({ agentId, ...agentData }) => ({
            url: `/api/company/agents/${agentId}`,
            method: 'PUT',
            headers: {
              'X-Company-Key': typeof window !== 'undefined' ? localStorage.getItem('companyApiKey') : '',
              'X-User-ID': typeof window !== 'undefined' ? localStorage.getItem('userId') : ''
            },
            body: agentData,
          }),
          invalidatesTags: ['CompanyAgents'],
        }),

        deleteCompanyAgent: builder.mutation({
          query: (agentId) => ({
            url: `/api/company/agents/${agentId}`,
            method: 'DELETE',
            headers: {
              'X-Company-Key': typeof window !== 'undefined' ? localStorage.getItem('companyApiKey') : '',
              'X-User-ID': typeof window !== 'undefined' ? localStorage.getItem('userId') : '',
              'X-Admin-Key': 'admin_secret_key' // Temporary admin key
            },
          }),
          invalidatesTags: ['CompanyAgents'],
        }),

        // Agent limits endpoint
        getAgentLimits: builder.query({
          query: () => ({
            url: '/api/company/agents/limits',
            headers: {
              'X-Company-Key': typeof window !== 'undefined' ? localStorage.getItem('companyApiKey') : '',
              'X-User-ID': typeof window !== 'undefined' ? localStorage.getItem('userId') : ''
            },
          }),
          providesTags: ['AgentLimits'],
        }),

        // Knowledge base endpoints
        addKnowledgeItem: builder.mutation({
          query: ({ agentId, ...knowledgeData }) => ({
            url: `/api/company/agents/${agentId}/knowledge`,
            method: 'POST',
            headers: {
              'X-Company-Key': typeof window !== 'undefined' ? localStorage.getItem('companyApiKey') : '',
              'X-User-ID': typeof window !== 'undefined' ? localStorage.getItem('userId') : ''
            },
            body: knowledgeData,
          }),
          invalidatesTags: ['CompanyAgents'],
        }),

        // File upload endpoint
        uploadKnowledgeFile: builder.mutation({
          query: ({ agentId, file, title }) => {
            const formData = new FormData();
            formData.append('file', file);
            if (title) formData.append('title', title);

            return {
              url: `/api/company/agents/${agentId}/knowledge/upload`,
              method: 'POST',
              headers: {
                'X-Company-Key': typeof window !== 'undefined' ? localStorage.getItem('companyApiKey') : '',
                'X-User-ID': typeof window !== 'undefined' ? localStorage.getItem('userId') : ''
              },
              body: formData,
            };
          },
          invalidatesTags: ['CompanyAgents'],
        }),

        // Delete knowledge item endpoint
        deleteKnowledgeItem: builder.mutation({
          query: ({ agentId, knowledgeId }) => ({
            url: `/api/company/agents/${agentId}/knowledge/${knowledgeId}`,
            method: 'DELETE',
            headers: {
              'X-Company-Key': typeof window !== 'undefined' ? localStorage.getItem('companyApiKey') : '',
              'X-User-ID': typeof window !== 'undefined' ? localStorage.getItem('userId') : ''
            },
          }),
          invalidatesTags: ['CompanyAgents'],
        }),

        // Agent crawler endpoints
        crawlAgentUrls: builder.mutation({
          query: ({ agentId, urls }) => ({
            url: `/api/company/agents/${agentId}/crawl`,
            method: 'POST',
            headers: {
              'X-Company-Key': typeof window !== 'undefined' ? localStorage.getItem('companyApiKey') : '',
              'X-User-ID': typeof window !== 'undefined' ? localStorage.getItem('userId') : ''
            },
            body: { urls },
          }),
          invalidatesTags: ['CompanyAgents'],
        }),

        getCrawlStatus: builder.query({
          query: (agentId) => ({
            url: `/api/company/agents/${agentId}/crawl/status`,
            headers: {
              'X-Company-Key': typeof window !== 'undefined' ? localStorage.getItem('companyApiKey') : '',
              'X-User-ID': typeof window !== 'undefined' ? localStorage.getItem('userId') : ''
            }
          }),
          providesTags: (result, error, agentId) => [{ type: 'CompanyAgents', id: agentId }],
        }),

        testCrawlUrl: builder.mutation({
          query: ({ agentId, url }) => ({
            url: `/api/company/agents/${agentId}/crawl/test`,
            method: 'POST',
            headers: {
              'X-Company-Key': typeof window !== 'undefined' ? localStorage.getItem('companyApiKey') : '',
              'X-User-ID': typeof window !== 'undefined' ? localStorage.getItem('userId') : ''
            },
            body: { url },
          }),
        }),

        clearAgentKnowledgeBase: builder.mutation({
          query: (agentId) => ({
            url: `/api/company/agents/${agentId}/crawl`,
            method: 'DELETE',
            headers: {
              'X-Company-Key': typeof window !== 'undefined' ? localStorage.getItem('companyApiKey') : '',
              'X-User-ID': typeof window !== 'undefined' ? localStorage.getItem('userId') : ''
            },
          }),
          invalidatesTags: ['CompanyAgents'],
        }),

        // Deployment endpoints
        getDeploymentConfig: builder.query({
          query: (agentId) => ({
            url: `/api/company/agents/${agentId}/deploy`,
            headers: {
              'X-Company-Key': typeof window !== 'undefined' ? localStorage.getItem('companyApiKey') : '',
              'X-User-ID': typeof window !== 'undefined' ? localStorage.getItem('userId') : ''
            }
          }),
          providesTags: (result, error, agentId) => [{ type: 'CompanyAgents', id: agentId }],
        }),

        generateEmbedCode: builder.mutation({
          query: ({ agentId, ...config }) => ({
            url: `/api/company/agents/${agentId}/deploy/embed-code`,
            method: 'POST',
            headers: {
              'X-Company-Key': typeof window !== 'undefined' ? localStorage.getItem('companyApiKey') : '',
              'X-User-ID': typeof window !== 'undefined' ? localStorage.getItem('userId') : ''
            },
            body: config,
          }),
        }),

        testDeployment: builder.mutation({
          query: ({ agentId, testMessage }) => ({
            url: `/api/company/agents/${agentId}/deploy/test`,
            method: 'POST',
            headers: {
              'X-Company-Key': typeof window !== 'undefined' ? localStorage.getItem('companyApiKey') : '',
              'X-User-ID': typeof window !== 'undefined' ? localStorage.getItem('userId') : ''
            },
            body: { testMessage },
          }),
        }),

        getDeploymentAnalytics: builder.query({
          query: ({ agentId, days = 7 }) => ({
            url: `/api/company/agents/${agentId}/deploy/analytics?days=${days}`,
            headers: {
              'X-Company-Key': typeof window !== 'undefined' ? localStorage.getItem('companyApiKey') : '',
              'X-User-ID': typeof window !== 'undefined' ? localStorage.getItem('userId') : ''
            }
          }),
          providesTags: (result, error, { agentId }) => [{ type: 'CompanyAgents', id: agentId }],
        }),

        // Agent chat endpoints
        chatWithAgent: builder.mutation({
          query: ({ agentId, message, sessionId }) => ({
            url: `/api/company/agents/${agentId}/chat`,
            method: 'POST',
            headers: {
              'X-Company-Key': typeof window !== 'undefined' ? localStorage.getItem('companyApiKey') : '',
              'X-User-ID': typeof window !== 'undefined' ? localStorage.getItem('userId') : ''
            },
            body: { message, sessionId },
          }),
          invalidatesTags: (result, error, { agentId }) => [
            { type: 'CompanyAgents', id: agentId },
            'CompanyAgents'
          ],
        }),

        getAgentConversation: builder.query({
          query: ({ agentId, sessionId }) => ({
            url: `/api/company/agents/${agentId}/conversation/${sessionId}`,
            headers: {
              'X-Company-Key': typeof window !== 'undefined' ? localStorage.getItem('companyApiKey') : '',
              'X-User-ID': typeof window !== 'undefined' ? localStorage.getItem('userId') : ''
            }
          }),
          providesTags: (result, error, { agentId, sessionId }) => [
            { type: 'CompanyAgents', id: agentId },
            { type: 'Conversation', id: sessionId }
          ],
        }),
  }),
});

export const { 
  useSendMessageMutation, 
  useGetConversationQuery,
  useGetClientsQuery,
  useGetClientQuery,
  useCreateClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
  useTestDatabaseConnectionMutation,
  useTestLLMConnectionMutation,
  useGetModelInfoQuery,
  useGetCompanyAgentsQuery,
  useGetCompanyAgentQuery,
  useCreateCompanyAgentMutation,
  useUpdateCompanyAgentMutation,
  useDeleteCompanyAgentMutation,
  useAddKnowledgeItemMutation,
  useUploadKnowledgeFileMutation,
  useDeleteKnowledgeItemMutation,
  useCrawlAgentUrlsMutation,
  useGetCrawlStatusQuery,
  useTestCrawlUrlMutation,
  useClearAgentKnowledgeBaseMutation,
  useGetDeploymentConfigQuery,
  useGenerateEmbedCodeMutation,
  useTestDeploymentMutation,
  useGetDeploymentAnalyticsQuery,
  useChatWithAgentMutation,
  useGetAgentConversationQuery
} = botApi;


