import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Principal } from '@icp-sdk/core/principal';
import {
  UserProfileView,
  ProviderProfileView,
  ClientProfile,
  Location,
  ProviderProfileUpdate,
  ClientProfileUpdate,
  BusinessType,
  PlatformStats,
  MPesaConfig,
  BioData,
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

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: {
      role: import('../backend').UserRole;
      clientProfile?: {
        yearOfBirth: string;
        mobileNumber: string;
        surname: string;
        pinnedLocation?: Location;
        middleName: string;
        idNumber: string;
        phoneNumber: string;
        lastName: string;
      };
      providerProfile?: {
        id: string;
        yearOfBirth: string;
        engagementEndTime?: bigint;
        name: string;
        rate?: bigint;
        businessType: BusinessType;
        ratings: Array<bigint>;
        description: string;
        surname: string;
        middleName: string;
        idNumber: string;
        academicDocuments: Array<import('../backend').Document>;
        category: BusinessType;
        phoneNumber: string;
        profilePicture?: import('../backend').ProfilePicture;
        lastName: string;
        location: Location;
        goodConductCert?: import('../backend').Document;
        verificationStatus: import('../backend').VerificationStatus;
        isEngaged: boolean;
      };
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useUpdateClientProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (update: ClientProfileUpdate) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateClientProfile(update);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useSaveClientBioData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bioData: BioData) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveClientBioData(bioData);
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

export function useSetEngaged() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (hours: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setEngaged(hours);
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

export function useRemoveAllProviders() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeAllProviders();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providerResults'] });
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
      queryClient.invalidateQueries({ queryKey: ['providerResults'] });
      queryClient.invalidateQueries({ queryKey: ['platformStats'] });
    },
  });
}
