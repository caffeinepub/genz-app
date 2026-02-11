import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Storage "blob-storage/Storage";

module {
  // Old types
  type BusinessType = {
    #cleaning;
    #catering;
    #construction;
    #consulting;
    #domesticwork;
    #education;
    #entertainment;
    #events;
    #finance;
    #generalTrade;
    #handyman;
    #hairAndBeauty;
    #healthcare;
    #hospitality;
    #it;
    #legal;
    #maintenance;
    #manufacturing;
    #marketing;
    #mediar;
    #personalServices;
    #petServices;
    #professionalServices;
    #realEstate;
    #repair;
    #retail;
    #sales;
    #security;
    #skilledTrade;
    #socialServices;
    #transportation;
    #unskilledLabor;
    #wellness;
    #other : Text;
  };

  type UserRole = {
    #client;
    #provider;
    #backOffice;
  };

  type VerificationStatus = {
    #unverified;
    #pending;
    #verified;
    #rejected : Text;
  };

  type DocumentType = {
    #academicQualification;
    #goodConductCertificate;
  };

  type Document = {
    docType : DocumentType;
    filename : Text;
    blob : Storage.ExternalBlob;
  };

  type Location = {
    latitude : Float;
    longitude : Float;
    address : Text;
  };

  type ProviderProfileOld = {
    principal : Principal;
    name : Text;
    rate : Nat;
    businessType : BusinessType;
    location : Location;
    verificationStatus : VerificationStatus;
    ratings : List.List<Nat>;
    profilePicture : ?{ id : Text; blob : Storage.ExternalBlob };
    phoneNumber : Text;
    description : Text;
    academicDocuments : List.List<Document>;
    goodConductCert : ?Document;
    isEngaged : Bool;
  };

  type ClientProfileOld = {
    principal : Principal;
    phoneNumber : Text;
    pinnedLocation : ?Location;
    isVerified : Bool;
  };

  type UserProfileOld = {
    role : UserRole;
    providerProfile : ?ProviderProfileOld;
    clientProfile : ?ClientProfileOld;
  };

  type Job = {
    id : Text;
    client : Principal;
    provider : Principal;
    payment : Nat;
    description : Text;
    status : {
      #requested;
      #inProgress;
      #completed : { rating : Nat };
      #cancelled : Text;
    };
  };

  type MPesaConfig = {
    consumerKey : Text;
    consumerSecret : Text;
    shortCode : Text;
    passkey : Text;
    callbackUrl : Text;
  };

  type PendingOtp = {
    phoneNumber : Text;
    role : { #client; #provider };
    code : Text;
    expiresAt : Int;
  };

  // Old actor type
  type OldActor = {
    userRoles : Map.Map<Principal, UserRole>;
    providerProfiles : Map.Map<Principal, ProviderProfileOld>;
    clientProfiles : Map.Map<Principal, ClientProfileOld>;
    jobs : Map.Map<Text, Job>;
    otpState : Map.Map<Principal, PendingOtp>;
    mpesaConfig : ?MPesaConfig;
  };

  // New types (with engagementEndTime)
  type ProviderProfile = {
    principal : Principal;
    name : Text;
    rate : Nat;
    businessType : BusinessType;
    location : Location;
    verificationStatus : VerificationStatus;
    ratings : List.List<Nat>;
    profilePicture : ?{ id : Text; blob : Storage.ExternalBlob };
    phoneNumber : Text;
    description : Text;
    academicDocuments : List.List<Document>;
    goodConductCert : ?Document;
    isEngaged : Bool;
    engagementEndTime : ?Int;
  };

  type ClientProfile = {
    principal : Principal;
    phoneNumber : Text;
    pinnedLocation : ?Location;
    isVerified : Bool;
  };

  type UserProfile = {
    role : UserRole;
    providerProfile : ?ProviderProfile;
    clientProfile : ?ClientProfile;
  };

  type NewActor = {
    userRoles : Map.Map<Principal, UserRole>;
    providerProfiles : Map.Map<Principal, ProviderProfile>;
    clientProfiles : Map.Map<Principal, ClientProfile>;
    jobs : Map.Map<Text, Job>;
    otpState : Map.Map<Principal, PendingOtp>;
    mpesaConfig : ?MPesaConfig;
  };

  public func run(old : OldActor) : NewActor {
    let newProviderProfiles = old.providerProfiles.map<Principal, ProviderProfileOld, ProviderProfile>(
      func(_k, oldProfile) {
        { oldProfile with engagementEndTime = null };
      }
    );

    { old with providerProfiles = newProviderProfiles };
  };
};
