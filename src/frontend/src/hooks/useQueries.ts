import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Principal } from '@icp-sdk/core/principal';
import { BusinessType, ProviderProfileView, ProviderProfileUpdate, ProviderIdentityUpdate, ClientProfileUpdate, UserRole, BioData, ExternalBlob } from '@/backend';

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

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: {
      role: UserRole;
      clientProfile?: {
        yearOfBirth: string;
        mobileNumber: string;
        surname: string;
        pinnedLocation?: {
          latitude: number;
          longitude: number;
          address: string;
        };
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
        academicDocuments: Array<any>;
        category: BusinessType;
        phoneNumber: string;
        profilePicture?: any;
        lastName: string;
        location: {
          latitude: number;
          longitude: number;
          address: string;
        };
        goodConductCert?: any;
        verificationStatus: any;
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

export function useGetProvider(provider: Principal) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['provider', provider.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getProvider(provider);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetProviderResults(category?: BusinessType | null) {
  const { actor, isFetching } = useActor();

  return useQuery<ProviderProfileView[]>({
    queryKey: ['providerResults', category],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProviderResults(category ?? null);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllProviders() {
  const { actor, isFetching } = useActor();

  return useQuery<ProviderProfileView[]>({
    queryKey: ['allProviders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProviders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPlatformStats() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['platformStats'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPlatformStats();
    },
    enabled: !!actor && !isFetching,
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
      queryClient.invalidateQueries({ queryKey: ['provider'] });
      queryClient.invalidateQueries({ queryKey: ['providerResults'] });
      queryClient.invalidateQueries({ queryKey: ['allProviders'] });
    },
  });
}

export function useUpdateProviderIdentityFields() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (update: ProviderIdentityUpdate) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateProviderIdentityFields(update);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['provider'] });
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
      queryClient.invalidateQueries({ queryKey: ['provider'] });
      queryClient.invalidateQueries({ queryKey: ['providerResults'] });
      queryClient.invalidateQueries({ queryKey: ['allProviders'] });
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
      queryClient.invalidateQueries({ queryKey: ['provider'] });
      queryClient.invalidateQueries({ queryKey: ['providerResults'] });
      queryClient.invalidateQueries({ queryKey: ['allProviders'] });
    },
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

export function useGetMpesaConfig() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['mpesaConfig'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMpesaConfig();
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
      queryClient.invalidateQueries({ queryKey: ['providerResults'] });
      queryClient.invalidateQueries({ queryKey: ['allProviders'] });
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
      queryClient.invalidateQueries({ queryKey: ['allProviders'] });
      queryClient.invalidateQueries({ queryKey: ['platformStats'] });
    },
  });
}

export function useAddWorkSampleImage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blob: ExternalBlob) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addWorkSampleImage(blob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['provider'] });
      queryClient.invalidateQueries({ queryKey: ['providerResults'] });
      queryClient.invalidateQueries({ queryKey: ['allProviders'] });
    },
  });
}

export function useRemoveWorkSampleImage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blob: ExternalBlob) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeWorkSampleImage(blob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['provider'] });
      queryClient.invalidateQueries({ queryKey: ['providerResults'] });
      queryClient.invalidateQueries({ queryKey: ['allProviders'] });
    },
  });
}

// Verification hooks - Provider side
export function useSubmitVerificationDocuments() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documents: { academicDocs: ExternalBlob[]; goodConductCert: ExternalBlob }) => {
      if (!actor) throw new Error('Actor not available');
      
      // For now, we'll use the existing profile update mechanism
      // In a real implementation, this would call a dedicated backend method
      throw new Error('Document submission backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Verification hooks - Admin side
export function useGetProvidersForReview() {
  const { actor, isFetching } = useActor();

  return useQuery<ProviderProfileView[]>({
    queryKey: ['providersForReview'],
    queryFn: async () => {
      if (!actor) return [];
      // Get all providers and filter for those needing review
      const allProviders = await actor.getAllProviders();
      return allProviders.filter(p => {
        const status = p.verificationStatus;
        return status && ('pending' in status || 'unverified' in status);
      });
    },
    enabled: !!actor && !isFetching,
  });
}

export function useVerifyProvider() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (providerPrincipal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      // For now, we'll use a workaround since the backend doesn't have verifyProvider yet
      throw new Error('Provider verification backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providersForReview'] });
      queryClient.invalidateQueries({ queryKey: ['provider'] });
      queryClient.invalidateQueries({ queryKey: ['allProviders'] });
      queryClient.invalidateQueries({ queryKey: ['providerResults'] });
    },
  });
}

export function useRejectProvider() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ providerPrincipal, reason }: { providerPrincipal: Principal; reason: string }) => {
      if (!actor) throw new Error('Actor not available');
      // For now, we'll use a workaround since the backend doesn't have rejectProvider yet
      throw new Error('Provider rejection backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providersForReview'] });
      queryClient.invalidateQueries({ queryKey: ['provider'] });
      queryClient.invalidateQueries({ queryKey: ['allProviders'] });
      queryClient.invalidateQueries({ queryKey: ['providerResults'] });
    },
  });
}
