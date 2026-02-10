import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { UserRole, BusinessType, Location, VerificationStatus, Job } from '../backend';
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
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.createOrUpdateProviderProfile(
        params.name,
        params.rate,
        params.businessType,
        params.location,
        params.phoneNumber,
        params.description
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetProvider(principal: Principal) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['provider', principal.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getProvider(principal);
    },
    enabled: !!actor && !isFetching,
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
