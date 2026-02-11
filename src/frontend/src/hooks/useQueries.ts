import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { useActor } from './useActor';
import { UserRole, BusinessType, Location, VerificationStatus, Job, MPesaConfig, DocumentType, ExternalBlob, ProviderProfileView, OtpRole } from '../backend';
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

// OTP Functions
export function useInitiateOtp() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (params: { phoneNumber: string; role: OtpRole }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.initiateOtp(params.phoneNumber, params.role);
    },
  });
}

export function useVerifyOtp() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.verifyOtp(code);
      } catch (error: any) {
        // Translate backend traps into user-friendly messages
        if (error.message?.includes('OTP expired')) {
          throw new Error('Verification code has expired. Please request a new one.');
        } else if (error.message?.includes('Invalid OTP')) {
          throw new Error('Invalid verification code. Please try again.');
        } else if (error.message?.includes('No pending OTP')) {
          throw new Error('No verification code found. Please request a new one.');
        }
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate user profile to reflect verification status
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Location Update Functions
export function useUpdateProviderPinnedLocation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (location: Location) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.updateProviderLocation(
          location.latitude,
          location.longitude,
          location.address
        );
      } catch (error: any) {
        // Translate authorization errors
        if (error.message?.includes('not a provider') || error.message?.includes('Unauthorized')) {
          throw new Error('You must be a service provider to update your location');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['provider'] });
    },
  });
}

export function useUpdateClientPinnedLocation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (location: Location) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.updateClientPinnedLocation(
          location.latitude,
          location.longitude,
          location.address
        );
      } catch (error: any) {
        // Translate authorization errors
        if (error.message?.includes('not found') || error.message?.includes('Unauthorized')) {
          throw new Error('You must be a client to update your location');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Provider Engagement Functions
export function useSetEngaged() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (hours: number) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.setEngaged(BigInt(hours));
      } catch (error: any) {
        // Translate backend errors into user-friendly messages
        if (error.message?.includes('not a provider') || error.message?.includes('Unauthorized')) {
          throw new Error('Only service providers can set engagement status');
        } else if (error.message?.includes('hours')) {
          throw new Error('Please enter a valid number of hours (1-24)');
        }
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate queries to refresh engagement state
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['provider'] });
    },
  });
}

export function useDisengage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.disengage();
      } catch (error: any) {
        // Translate backend errors into user-friendly messages
        if (error.message?.includes('not a provider') || error.message?.includes('Unauthorized')) {
          throw new Error('Only service providers can update engagement status');
        }
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate queries to refresh engagement state
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['provider'] });
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
