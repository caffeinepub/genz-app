import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { useActor } from './useActor';
import { UserRole, BusinessType, Location, VerificationStatus, Job, ProviderPreview, MPesaConfig, DocumentType, ExternalBlob, ProviderProfileView } from '../backend';
import { Principal } from '@icp-sdk/core/principal';

// User Profile & Authentication
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSetUserRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (role: UserRole) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setUserRole(role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Provider Profile Management
export function useCreateOrUpdateProviderProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      name: string;
      rate: bigint;
      businessType: BusinessType;
      location: Location;
      phoneNumber: string;
      description: string;
      isEngaged: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.createOrUpdateProviderProfile(
        params.name,
        params.rate,
        params.businessType,
        params.location,
        params.phoneNumber,
        params.description,
        params.isEngaged
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useCreateOrUpdateClientProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (phoneNumber: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.createOrUpdateClientProfile(phoneNumber);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetProvider(
  principal: Principal,
  options?: Partial<UseQueryOptions<ProviderProfileView | null>>
) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['provider', principal.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getProvider(principal);
    },
    enabled: !!actor && !isFetching,
    ...options,
  });
}

// Provider Preview (with engagement status) - now supports polling
export function useGetProviderPreview(
  principal: Principal,
  options?: Partial<UseQueryOptions<ProviderPreview | null>>
) {
  const { actor, isFetching } = useActor();

  return useQuery<ProviderPreview | null>({
    queryKey: ['providerPreview', principal.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getProviderPreview(principal);
    },
    enabled: !!actor && !isFetching,
    ...options,
  });
}

// Provider Search
export function useSearchProviders(businessType: BusinessType | null) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['providers', businessType],
    queryFn: async () => {
      if (!actor) return [];
      const dummyLocation: Location = { latitude: 0, longitude: 0, address: '' };
      return actor.searchProviders(businessType, dummyLocation, null);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllProviders() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['allProviders'],
    queryFn: async () => {
      if (!actor) return [];
      const dummyLocation: Location = { latitude: 0, longitude: 0, address: '' };
      return actor.searchProviders(null, dummyLocation, null);
    },
    enabled: !!actor && !isFetching,
  });
}

// Platform Stats (public, no auth required)
export function useGetPlatformStats() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['platformStats'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getPlatformStats();
    },
    enabled: !!actor && !isFetching,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

// Job Management
export function useRequestLink() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      provider: Principal;
      payment: bigint;
      jobDescription: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.requestLink(params.provider, params.payment, params.jobDescription);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['providerPreview'] });
    },
  });
}

export function useGetCallerJobs() {
  const { actor, isFetching } = useActor();
  const { data: userProfile } = useGetCallerUserProfile();

  return useQuery<Job[]>({
    queryKey: ['jobs'],
    queryFn: async () => {
      if (!actor || !userProfile) return [];
      
      // Since backend doesn't have a getCallerJobs method, we'll return empty for now
      // In a real implementation, the backend would need to add this method
      return [];
    },
    enabled: !!actor && !isFetching && !!userProfile,
  });
}

export function useMarkJobCompleted() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { jobId: string; rating: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.markJobCompleted(params.jobId, params.rating);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['providers'] });
      queryClient.invalidateQueries({ queryKey: ['providerPreview'] });
    },
  });
}

export function useCancelJob() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { jobId: string; reason: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.cancelJob(params.jobId, params.reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['providerPreview'] });
    },
  });
}

// Verification
export function useUpdateVerificationStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      provider: Principal;
      status: VerificationStatus;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateVerificationStatus(params.provider, params.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providers'] });
      queryClient.invalidateQueries({ queryKey: ['allProviders'] });
    },
  });
}

// Engagement Status Update
export function useUpdateEngagementStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (isEngaged: boolean) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateEngagementStatus(isEngaged);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['provider'] });
      queryClient.invalidateQueries({ queryKey: ['providerPreview'] });
    },
  });
}

// M-Pesa Configuration
export function useGetMpesaConfig() {
  const { actor, isFetching } = useActor();

  return useQuery<MPesaConfig | null>({
    queryKey: ['mpesaConfig'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMpesaConfig();
    },
    enabled: !!actor && !isFetching,
  });
}

// Provider Unlock State (simulated client-side for now)
// In production, backend would track unlock state per (client, provider) pair
export function useProviderUnlockState(providerId: string) {
  const queryClient = useQueryClient();
  
  return useQuery<boolean>({
    queryKey: ['providerUnlock', providerId],
    queryFn: () => {
      // Check localStorage for unlock state
      const unlocked = localStorage.getItem(`unlock_${providerId}`);
      return unlocked === 'true';
    },
    staleTime: Infinity, // Don't refetch automatically
  });
}

export function useUnlockProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (providerId: string) => {
      // Simulate payment verification delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Store unlock state
      localStorage.setItem(`unlock_${providerId}`, 'true');
      return true;
    },
    onSuccess: (_, providerId) => {
      queryClient.invalidateQueries({ queryKey: ['providerUnlock', providerId] });
      queryClient.invalidateQueries({ queryKey: ['provider', providerId] });
    },
  });
}

// Document Upload
export function useUploadDocument() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      docType: DocumentType;
      filename: string;
      blob: ExternalBlob;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const docId = await actor.uploadDocument(params.docType, params.filename, params.blob);
      await actor.addDocumentToProvider(docId);
      return docId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Profile Picture Upload
export function useUploadProfilePicture() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      blob: ExternalBlob;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const pictureId = await actor.uploadProfilePicture(params.id, params.blob);
      await actor.addProfilePictureToProvider(pictureId);
      return pictureId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['provider'] });
    },
  });
}
