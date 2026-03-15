'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStorage } from '@/lib/storage';
import type { Document } from '@/types';

const DOCUMENTS_KEY = ['documents'] as const;

export function useProjects() {
  const queryClient = useQueryClient();
  const storage = getStorage();

  const documentsQuery = useQuery<Document[]>({
    queryKey: DOCUMENTS_KEY,
    queryFn: () => storage.getDocuments(),
  });

  const saveMutation = useMutation<void, Error, Document>({
    mutationFn: (doc: Document) => storage.saveDocument(doc),
    onMutate: async (newDoc) => {
      await queryClient.cancelQueries({ queryKey: DOCUMENTS_KEY });
      const previous = queryClient.getQueryData<Document[]>(DOCUMENTS_KEY);

      queryClient.setQueryData<Document[]>(DOCUMENTS_KEY, (old = []) => {
        const index = old.findIndex((d) => d.id === newDoc.id);
        if (index >= 0) {
          const updated = [...old];
          updated[index] = newDoc;
          return updated;
        }
        return [...old, newDoc];
      });

      return { previous };
    },
    onError: (_err, _doc, context: { previous?: Document[] } | undefined) => {
      if (context?.previous) {
        queryClient.setQueryData(DOCUMENTS_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEY });
    },
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: (id: string) => storage.deleteDocument(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: DOCUMENTS_KEY });
      const previous = queryClient.getQueryData<Document[]>(DOCUMENTS_KEY);

      queryClient.setQueryData<Document[]>(DOCUMENTS_KEY, (old = []) =>
        old.filter((d) => d.id !== id),
      );

      return { previous };
    },
    onError: (_err, _id, context: { previous?: Document[] } | undefined) => {
      if (context?.previous) {
        queryClient.setQueryData(DOCUMENTS_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEY });
    },
  });

  return {
    documents: documentsQuery.data ?? [],
    saveDocument: saveMutation.mutate,
    deleteDocument: deleteMutation.mutate,
    isLoading: documentsQuery.isLoading,
  };
}
