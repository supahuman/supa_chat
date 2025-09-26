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
  tagTypes: ['Conversation'],
  endpoints: (builder) => ({
    sendMessage: builder.mutation({
      query: ({ message, sessionId }) => ({
        url: '/api/client/supa-chat/bot',
        method: 'POST',
        body: { message, sessionId },
      }),
      invalidatesTags: (result) => (result?.sessionId ? [{ type: 'Conversation', id: result.sessionId }] : []),
    }),
    getConversation: builder.query({
      query: (sessionId) => `/api/bot/conversations/${sessionId}`,
      providesTags: (result, error, sessionId) => [{ type: 'Conversation', id: sessionId }],
    }),
  }),
});

export const { useSendMessageMutation, useGetConversationQuery } = botApi;


