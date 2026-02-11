import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Principal } from '@icp-sdk/core/principal';
import {
  UserProfileView,
  ProviderProfileView,
  ClientProfile,
  Location,
  OtpRole,
  ProviderProfileUpdate,
  BusinessType,
  PlatformStats,
  MPesaConfig,
} from '../backend';
import { getCategoryById } from '../lib/categories';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfileView | null>({
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

export function useGetProvider(
  provider: Principal,
  options?: { enabled?: boolean; refetchInterval?: number | false }
) {
  const { actor, isFetching } = useActor();

  return useQuery<ProviderProfileView | null>({
    queryKey: ['provider', provider.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getProvider(provider);
    },
    enabled: !!actor && !isFetching && (options?.enabled ?? true),
    refetchInterval: options?.refetchInterval,
    staleTime: 0,
    refetchOnMount: 'always',
  });
}

export function useGetProviderResults(categoryId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<ProviderProfileView[]>({
    queryKey: ['providerResults', categoryId],
    queryFn: async () => {
      if (!actor) return [];
      
      // Convert categoryId to BusinessType for backend query
      let categoryFilter: BusinessType | null = null;
      if (categoryId) {
        const category = getCategoryById(categoryId);
        if (category) {
          categoryFilter = category.businessType;
        }
      }
      
      return actor.getProviderResults(categoryFilter);
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
    refetchOnMount: 'always',
  });
}

export function useGetPlatformStats() {
  const { actor, isFetching } = useActor();

  return useQuery<PlatformStats>({
    queryKey: ['platformStats'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPlatformStats();
    },
    enabled: !!actor && !isFetching,
  });
}

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

export function useInitiateOtp() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ phoneNumber, role }: { phoneNumber: string; role: OtpRole }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.initiateOtp(phoneNumber, role);
    },
  });
}

export function useVerifyOtp() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.verifyOtp(code);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useUpdateClientPinnedLocation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (location: Location) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateClientPinnedLocation(location.latitude, location.longitude, location.address);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useUpdateProviderPinnedLocation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (location: Location) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateProviderLocation(location.latitude, location.longitude, location.address);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useSetEngaged() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (hours: number) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setEngaged(BigInt(hours));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useDisengage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.disengage();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useUpdateProviderProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (update: ProviderProfileUpdate) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateProviderProfile(update);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['providerResults'] });
      queryClient.invalidateQueries({ queryKey: ['provider'] });
    },
  });
}

// Admin operations for provider dataset management
export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRemoveAllProviders() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeAllProviders();
    },
    onSuccess: () => {
      // Invalidate all provider-related caches
      queryClient.invalidateQueries({ queryKey: ['providerResults'] });
      queryClient.invalidateQueries({ queryKey: ['provider'] });
      queryClient.invalidateQueries({ queryKey: ['platformStats'] });
    },
  });
}

export function useSeedProviders() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (providers: Array<[Principal, ProviderProfileView]>) => {
      if (!actor) throw new Error('Actor not available');
      return actor.seedProviders(providers);
    },
    onSuccess: () => {
      // Invalidate all provider-related caches
      queryClient.invalidateQueries({ queryKey: ['providerResults'] });
      queryClient.invalidateQueries({ queryKey: ['provider'] });
      queryClient.invalidateQueries({ queryKey: ['platformStats'] });
    },
  });
}

// Placeholder hooks for features not yet implemented in backend
export function useProviderUnlockState(providerId: string) {
  // Return a query-like object with data property
  return {
    data: false,
    isLoading: false,
    isError: false,
    error: null,
  };
}

export function useUnlockProvider() {
  return useMutation({
    mutationFn: async (providerId: string) => {
      // Placeholder - backend doesn't support this yet
      console.log('Unlock provider:', providerId);
      return true;
    },
  });
}
