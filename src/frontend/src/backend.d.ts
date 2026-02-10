import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface ProviderProfileView {
    principal: Principal;
    name: string;
    rate: bigint;
    businessType: BusinessType;
    ratings: Array<bigint>;
    description: string;
    academicDocuments: Array<Document>;
    phoneNumber: string;
    profilePicture?: ProfilePicture;
    location: Location;
    goodConductCert?: Document;
    verificationStatus: VerificationStatus;
}
export interface Location {
    latitude: number;
    longitude: number;
    address: string;
}
export interface ProviderPreview {
    provider: ProviderProfileView;
    isEngaged: boolean;
}
export type BusinessType = {
    __kind__: "it";
    it: null;
} | {
    __kind__: "retail";
    retail: null;
} | {
    __kind__: "healthcare";
    healthcare: null;
} | {
    __kind__: "transportation";
    transportation: null;
} | {
    __kind__: "hospitality";
    hospitality: null;
} | {
    __kind__: "finance";
    finance: null;
} | {
    __kind__: "realEstate";
    realEstate: null;
} | {
    __kind__: "cleaning";
    cleaning: null;
} | {
    __kind__: "construction";
    construction: null;
} | {
    __kind__: "other";
    other: string;
} | {
    __kind__: "marketing";
    marketing: null;
} | {
    __kind__: "education";
    education: null;
} | {
    __kind__: "consulting";
    consulting: null;
} | {
    __kind__: "maintenance";
    maintenance: null;
} | {
    __kind__: "wellness";
    wellness: null;
} | {
    __kind__: "catering";
    catering: null;
} | {
    __kind__: "manufacturing";
    manufacturing: null;
};
export interface Document {
    blob: ExternalBlob;
    filename: string;
    docType: DocumentType;
}
export interface ProfilePicture {
    id: string;
    blob: ExternalBlob;
}
export type VerificationStatus = {
    __kind__: "verified";
    verified: null;
} | {
    __kind__: "pending";
    pending: null;
} | {
    __kind__: "unverified";
    unverified: null;
} | {
    __kind__: "rejected";
    rejected: string;
};
export interface Job {
    id: string;
    status: {
        __kind__: "requested";
        requested: null;
    } | {
        __kind__: "cancelled";
        cancelled: string;
    } | {
        __kind__: "completed";
        completed: {
            rating: bigint;
        };
    } | {
        __kind__: "inProgress";
        inProgress: null;
    };
    client: Principal;
    provider: Principal;
    description: string;
    payment: bigint;
}
export interface UserProfileView {
    role: UserRole;
    clientProfile?: ClientProfile;
    providerProfile?: ProviderProfileView;
}
export interface ClientProfile {
    principal: Principal;
    phoneNumber: string;
}
export interface PlatformStats {
    totalProviders: bigint;
    totalClients: bigint;
}
export interface MPesaConfig {
    consumerSecret: string;
    passkey: string;
    shortCode: string;
    consumerKey: string;
    callbackUrl: string;
}
export enum DocumentType {
    goodConductCertificate = "goodConductCertificate",
    academicQualification = "academicQualification"
}
export enum UserRole {
    client = "client",
    provider = "provider",
    backOffice = "backOffice"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addDocumentToProvider(docId: string): Promise<void>;
    addProfilePictureToProvider(pictureId: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    cancelJob(jobId: string, reason: string): Promise<void>;
    createOrUpdateClientProfile(phoneNumber: string): Promise<void>;
    createOrUpdateProviderProfile(name: string, rate: bigint, businessType: BusinessType, location: Location, phoneNumber: string, description: string): Promise<void>;
    getCallerUserProfile(): Promise<UserProfileView | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getClient(client: Principal): Promise<ClientProfile | null>;
    getJob(jobId: string): Promise<Job | null>;
    getMpesaConfig(): Promise<MPesaConfig | null>;
    getPlatformStats(): Promise<PlatformStats>;
    getProvider(provider: Principal): Promise<ProviderProfileView | null>;
    getProviderPreview(provider: Principal): Promise<ProviderPreview | null>;
    getUserProfile(user: Principal): Promise<UserProfileView | null>;
    isCallerAdmin(): Promise<boolean>;
    markJobCompleted(jobId: string, rating: bigint): Promise<void>;
    markJobInProgress(jobId: string): Promise<void>;
    providerHasEngagedJob(provider: Principal): Promise<boolean>;
    requestLink(provider: Principal, payment: bigint, jobDescription: string): Promise<string>;
    saveCallerUserProfile(profile: {
        role: UserRole;
        clientProfile?: {
            principal: Principal;
            phoneNumber: string;
        };
        providerProfile?: {
            principal: Principal;
            name: string;
            rate: bigint;
            businessType: BusinessType;
            ratings: Array<bigint>;
            description: string;
            academicDocuments: Array<Document>;
            phoneNumber: string;
            profilePicture?: ProfilePicture;
            location: Location;
            goodConductCert?: Document;
            verificationStatus: VerificationStatus;
        };
    }): Promise<void>;
    searchProviders(filterBusinessType: BusinessType | null, _userLocation: Location, _maxDistance: bigint | null): Promise<Array<ProviderProfileView>>;
    setMPesaConfig(config: MPesaConfig): Promise<void>;
    setUserRole(role: UserRole): Promise<void>;
    updateVerificationStatus(provider: Principal, status: VerificationStatus): Promise<void>;
    uploadDocument(docType: DocumentType, filename: string, blob: ExternalBlob): Promise<string>;
    uploadProfilePicture(id: string, blob: ExternalBlob): Promise<string>;
}
