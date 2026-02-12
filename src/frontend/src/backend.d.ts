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
    yearOfBirth: string;
    principal: Principal;
    workSampleImages: Array<ExternalBlob>;
    displayName: string;
    engagementEndTime?: bigint;
    name: string;
    rate: bigint;
    businessType: BusinessType;
    ratings: Array<bigint>;
    description: string;
    surname: string;
    middleName: string;
    idNumber: string;
    academicDocuments: Array<Document>;
    category?: BusinessType;
    servicesWriteUp: string;
    phoneNumber: string;
    profilePicture?: ProfilePicture;
    lastName: string;
    location: Location;
    goodConductCert?: Document;
    verificationStatus: VerificationStatus;
    isEngaged: boolean;
}
export interface Location {
    latitude: number;
    longitude: number;
    address: string;
}
export type BusinessType = {
    __kind__: "it";
    it: null;
} | {
    __kind__: "repair";
    repair: null;
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
    __kind__: "generalTrade";
    generalTrade: null;
} | {
    __kind__: "entertainment";
    entertainment: null;
} | {
    __kind__: "marketing";
    marketing: null;
} | {
    __kind__: "professionalServices";
    professionalServices: null;
} | {
    __kind__: "education";
    education: null;
} | {
    __kind__: "security";
    security: null;
} | {
    __kind__: "consulting";
    consulting: null;
} | {
    __kind__: "personalServices";
    personalServices: null;
} | {
    __kind__: "skilledTrade";
    skilledTrade: null;
} | {
    __kind__: "legal";
    legal: null;
} | {
    __kind__: "sales";
    sales: null;
} | {
    __kind__: "domesticwork";
    domesticwork: null;
} | {
    __kind__: "petServices";
    petServices: null;
} | {
    __kind__: "socialServices";
    socialServices: null;
} | {
    __kind__: "events";
    events: null;
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
} | {
    __kind__: "unskilledLabor";
    unskilledLabor: null;
} | {
    __kind__: "handyman";
    handyman: null;
} | {
    __kind__: "hairAndBeauty";
    hairAndBeauty: null;
} | {
    __kind__: "mediar";
    mediar: null;
};
export interface Document {
    blob: ExternalBlob;
    filename: string;
    docType: DocumentType;
}
export interface ClientProfileUpdate {
    yearOfBirth: string;
    mobileNumber: string;
    surname: string;
    pinnedLocation: Location;
    middleName: string;
    idNumber: string;
    phoneNumber: string;
    lastName: string;
}
export interface ProviderProfileUpdate {
    yearOfBirth: string;
    rate: bigint;
    businessType: BusinessType;
    description: string;
    surname: string;
    category: BusinessType;
    servicesWriteUp: string;
    profilePicture?: ProfilePicture;
    location: Location;
}
export interface BioData {
    fullName: string;
    email: string;
    nationalId: string;
    address: string;
}
export interface ProfilePicture {
    id: string;
    blob: ExternalBlob;
}
export interface WhatsAppConfig {
    providerBaseUrl: string;
    authToken: string;
    senderPhoneNumber: string;
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
export interface ProviderIdentityUpdate {
    middleName: string;
    idNumber: string;
    phoneNumber: string;
    lastName: string;
}
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
    yearOfBirth: string;
    principal: Principal;
    mobileNumber: string;
    surname: string;
    pinnedLocation?: Location;
    middleName: string;
    idNumber: string;
    isVerified: boolean;
    phoneNumber: string;
    lastName: string;
    bioData?: BioData;
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
    addWorkSampleImage(blob: ExternalBlob): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    disengage(): Promise<void>;
    getAllProviders(): Promise<Array<ProviderProfileView>>;
    getCallerUserProfile(): Promise<UserProfileView | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getClient(client: Principal): Promise<ClientProfile | null>;
    getClientBioData(client: Principal): Promise<BioData | null>;
    getJob(jobId: string): Promise<Job | null>;
    getMpesaConfig(): Promise<MPesaConfig | null>;
    getPlatformStats(): Promise<PlatformStats>;
    getProvider(provider: Principal): Promise<ProviderProfileView | null>;
    getProviderResults(category: BusinessType | null): Promise<Array<ProviderProfileView>>;
    getUserProfile(user: Principal): Promise<UserProfileView | null>;
    getWhatsAppConfig(): Promise<WhatsAppConfig | null>;
    isCallerAdmin(): Promise<boolean>;
    removeAllProviders(): Promise<void>;
    removeWorkSampleImage(blob: ExternalBlob): Promise<void>;
    saveCallerUserProfile(profile: {
        role: UserRole;
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
            academicDocuments: Array<Document>;
            category: BusinessType;
            phoneNumber: string;
            profilePicture?: ProfilePicture;
            lastName: string;
            location: Location;
            goodConductCert?: Document;
            verificationStatus: VerificationStatus;
            isEngaged: boolean;
        };
    }): Promise<void>;
    saveClientBioData(bioData: BioData): Promise<void>;
    seedProviders(providers: Array<[Principal, ProviderProfileView]>): Promise<void>;
    setEngaged(hours: bigint): Promise<{
        engagementEndTime?: bigint;
    }>;
    setMPesaConfig(config: MPesaConfig): Promise<void>;
    setWhatsAppConfig(config: WhatsAppConfig): Promise<void>;
    updateClientPinnedLocation(latitude: number, longitude: number, address: string): Promise<void>;
    updateClientProfile(update: ClientProfileUpdate): Promise<void>;
    updateProviderIdentityFields(update: ProviderIdentityUpdate): Promise<void>;
    updateProviderLocation(latitude: number, longitude: number, address: string): Promise<void>;
    updateProviderProfile(update: ProviderProfileUpdate): Promise<void>;
}
