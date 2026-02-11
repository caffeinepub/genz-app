import Map "mo:core/Map";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Array "mo:core/Array";


import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import OutCall "http-outcalls/outcall";

// Use migration mechanism to upgrade custom data model. Critical for persistence!

actor {
  // Types
  type Location = {
    latitude : Float;
    longitude : Float;
    address : Text;
  };

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

  public type UserRole = {
    #client;
    #provider;
    #backOffice;
  };

  public type VerificationStatus = {
    #unverified;
    #pending;
    #verified;
    #rejected : Text;
  };

  public type DocumentType = {
    #academicQualification;
    #goodConductCertificate;
  };

  public type Document = {
    docType : DocumentType;
    filename : Text;
    blob : Storage.ExternalBlob;
  };

  public type ProfilePicture = {
    id : Text;
    blob : Storage.ExternalBlob;
  };

  public type ProviderProfile = {
    principal : Principal;
    name : Text;
    rate : Nat;
    businessType : BusinessType;
    location : Location;
    verificationStatus : VerificationStatus;
    ratings : List.List<Nat>;
    profilePicture : ?ProfilePicture;
    phoneNumber : Text;
    description : Text;
    academicDocuments : List.List<Document>;
    goodConductCert : ?Document;
    isEngaged : Bool;
    engagementEndTime : ?Int;
    category : ?BusinessType;
  };

  public type ProviderProfileView = {
    principal : Principal;
    name : Text;
    rate : Nat;
    businessType : BusinessType;
    location : Location;
    verificationStatus : VerificationStatus;
    ratings : [Nat];
    profilePicture : ?ProfilePicture;
    phoneNumber : Text;
    description : Text;
    academicDocuments : [Document];
    goodConductCert : ?Document;
    isEngaged : Bool;
    engagementEndTime : ?Int;
    category : ?BusinessType;
  };

  public type ClientProfile = {
    principal : Principal;
    phoneNumber : Text;
    pinnedLocation : ?Location;
    isVerified : Bool;
  };

  public type UserProfile = {
    role : UserRole;
    providerProfile : ?ProviderProfile;
    clientProfile : ?ClientProfile;
  };

  public type UserProfileView = {
    role : UserRole;
    providerProfile : ?ProviderProfileView;
    clientProfile : ?ClientProfile;
  };

  public type Job = {
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

  public type PlatformStats = {
    totalClients : Nat;
    totalProviders : Nat;
  };

  public type ProviderPreview = {
    provider : ProviderProfileView;
    isEngaged : Bool;
  };

  public type MPesaConfig = {
    consumerKey : Text;
    consumerSecret : Text;
    shortCode : Text;
    passkey : Text;
    callbackUrl : Text;
  };

  public type OtpRole = { #client; #provider };
  public type PendingOtp = {
    phoneNumber : Text;
    role : OtpRole;
    code : Text;
    expiresAt : Time.Time;
  };

  public type ProviderProfileUpdate = {
    rate : Nat;
    businessType : BusinessType;
    location : Location;
    profilePicture : ?ProfilePicture;
    description : Text;
    category : BusinessType;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  let userRoles = Map.empty<Principal, UserRole>();
  let providerProfiles = Map.empty<Principal, ProviderProfile>();
  let clientProfiles = Map.empty<Principal, ClientProfile>();
  let jobs = Map.empty<Text, Job>();
  let otpState = Map.empty<Principal, PendingOtp>();
  var mpesaConfig : ?MPesaConfig = null;

  let documentStorage = Map.empty<Text, Document>();
  let profilePictures = Map.empty<Text, ProfilePicture>();

  func convertProviderProfileToView(profile : ProviderProfile) : ProviderProfileView {
    let ratingsArray = profile.ratings.toArray();
    let academicDocsArray = profile.academicDocuments.toArray();
    {
      profile with
      ratings = ratingsArray;
      academicDocuments = academicDocsArray;
    };
  };

  func convertProviderProfileOptionToView(profile : ?ProviderProfile) : ?ProviderProfileView {
    switch (profile) {
      case (null) { null };
      case (?p) { ?convertProviderProfileToView(p) };
    };
  };

  func convertProviderProfileListToView(profiles : List.List<ProviderProfile>) : List.List<ProviderProfileView> {
    profiles.map<ProviderProfile, ProviderProfileView>(
      func(profile) { convertProviderProfileToView(profile) }
    );
  };

  func convertUserProfileToView(profile : UserProfile) : UserProfileView {
    {
      profile with providerProfile = convertProviderProfileOptionToView(profile.providerProfile)
    };
  };

  func convertUserProfileOptionToView(profile : ?UserProfile) : ?UserProfileView {
    switch (profile) {
      case (null) { null };
      case (?p) { ?convertUserProfileToView(p) };
    };
  };

  public shared ({ caller }) func initiateOtp(phoneNumber : Text, role : OtpRole) : async {
    expiresAt : Time.Time; code : Text;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can initiate OTP");
    };

    let code = "1234";
    let expiresAt = Time.now() + 600_000_000_000;

    let pendingOtp : PendingOtp = {
      phoneNumber;
      code;
      role;
      expiresAt;
    };

    otpState.add(caller, pendingOtp);
    { code; expiresAt };
  };

  public shared ({ caller }) func verifyOtp(code : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can verify OTP");
    };

    let pending = switch (otpState.get(caller)) {
      case (?otp) {
        if (Time.now() > otp.expiresAt) {
          otpState.remove(caller);
          Runtime.trap("OTP expired");
        };
        otp;
      };
      case (null) { Runtime.trap("No pending OTP for caller") };
    };

    if (code != pending.code) {
      Runtime.trap("Invalid OTP code");
    };

    switch (pending.role) {
      case (#client) {
        switch (clientProfiles.get(caller)) {
          case (null) { Runtime.trap("Client profile not found") };
          case (?profile) {
            let updatedProfile = { profile with isVerified = true };
            clientProfiles.add(caller, updatedProfile);
          };
        };
      };
      case (#provider) {
        switch (providerProfiles.get(caller)) {
          case (null) { Runtime.trap("Provider profile not found") };
          case (?profile) {
            let updatedProfile = { profile with phoneNumber = pending.phoneNumber };
            providerProfiles.add(caller, updatedProfile);
          };
        };
      };
    };

    otpState.remove(caller);
    true;
  };

  func ensureVerifiedClient(caller : Principal) {
    switch (clientProfiles.get(caller)) {
      case (null) { Runtime.trap("Client profile not found") };
      case (?profile) {
        if (not profile.isVerified) {
          Runtime.trap("Client phone number not verified");
        };
      };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfileView {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    let profile = buildUserProfile(caller);
    convertUserProfileOptionToView(profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfileView {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    let profile = buildUserProfile(user);
    convertUserProfileOptionToView(profile);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : {
    role : UserRole;
    providerProfile : ?{
      name : Text;
      businessType : BusinessType;
      location : Location;
      verificationStatus : VerificationStatus;
      ratings : [Nat];
      profilePicture : ?ProfilePicture;
      phoneNumber : Text;
      description : Text;
      academicDocuments : [Document];
      goodConductCert : ?Document;
      isEngaged : Bool;
      engagementEndTime : ?Int;
      category : BusinessType;
    };
    clientProfile : ?{
      phoneNumber : Text;
      pinnedLocation : ?Location;
    };
  }) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    let existingRole = userRoles.get(caller);
    switch (existingRole) {
      case (?_) {
        Runtime.trap("Profile already exists. Use updateProviderProfile() to modify editable fields. Bio-data (name, phoneNumber) cannot be changed.");
      };
      case (null) {};
    };

    userRoles.add(caller, profile.role);

    switch (profile.providerProfile) {
      case (?pp) {
        providerProfiles.add(
          caller,
          {
            principal = caller;
            name = pp.name;
            rate = 0;
            businessType = pp.businessType;
            location = pp.location;
            verificationStatus = pp.verificationStatus;
            ratings = List.empty<Nat>();
            profilePicture = pp.profilePicture;
            phoneNumber = pp.phoneNumber;
            description = pp.description;
            academicDocuments = List.empty<Document>();
            goodConductCert = pp.goodConductCert;
            isEngaged = pp.isEngaged;
            engagementEndTime = pp.engagementEndTime;
            category = ?pp.category;
          },
        );
      };
      case (null) {};
    };

    switch (profile.clientProfile) {
      case (?cp) {
        clientProfiles.add(caller, {
          principal = caller;
          phoneNumber = cp.phoneNumber;
          pinnedLocation = cp.pinnedLocation;
          isVerified = false;
        });
      };
      case (null) {};
    };
  };

  public shared ({ caller }) func updateProviderProfile(update : ProviderProfileUpdate) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update profiles");
    };

    ensureIsProvider(caller);
    let existingProfile = getProviderInternal(caller);

    let updatedProfile = {
      existingProfile with
      rate = update.rate;
      businessType = update.businessType;
      location = update.location;
      profilePicture = update.profilePicture;
      description = update.description;
      category = ?update.category;
    };

    providerProfiles.add(caller, updatedProfile);
  };

  func buildUserProfile(user : Principal) : ?UserProfile {
    let role = userRoles.get(user);
    let providerProfile = providerProfiles.get(user);
    let clientProfile = clientProfiles.get(user);

    switch (role) {
      case (?r) {
        ?{
          role = r;
          providerProfile;
          clientProfile;
        };
      };
      case (null) { null };
    };
  };

  public shared ({ caller }) func updateProviderLocation(
    latitude : Float,
    longitude : Float,
    address : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update location");
    };
    ensureIsProvider(caller);
    let profile = getProviderInternal(caller);
    let newLocation = { latitude; longitude; address };
    providerProfiles.add(caller, { profile with location = newLocation });
  };

  public shared ({ caller }) func updateClientPinnedLocation(
    latitude : Float,
    longitude : Float,
    address : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update location");
    };
    let profile = getClientInternal(caller);
    let newLocation = { latitude; longitude; address };
    let updatedProfile = { profile with pinnedLocation = ?newLocation };
    clientProfiles.add(caller, updatedProfile);
  };

  func ensureIsProvider(principal : Principal) {
    let userRole = userRoles.get(principal);
    switch (userRole) {
      case (?#provider) {};
      case (null) { Runtime.trap("User is not a provider") };
      case (_) { Runtime.trap("User is not a provider") };
    };
  };

  func getProviderInternal(provider : Principal) : ProviderProfile {
    switch (providerProfiles.get(provider)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("Provider not found") };
    };
  };

  func getClientInternal(client : Principal) : ClientProfile {
    switch (clientProfiles.get(client)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("Client not found") };
    };
  };

  func getJobInternal(jobId : Text) : Job {
    switch (jobs.get(jobId)) {
      case (?job) { job };
      case (null) { Runtime.trap("Job not found") };
    };
  };

  public shared ({ caller }) func setEngaged(hours : Nat) : async {
    engagementEndTime : ?Int;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can set engagement");
    };
    ensureIsProvider(caller);
    let profile = getProviderInternal(caller);

    let newEndTime : Int = Time.now() + (hours * 60 * 60 * 1_000_000_000);
    let updatedProfile = {
      profile with
      isEngaged = true;
      engagementEndTime = ?newEndTime;
    };

    providerProfiles.add(caller, updatedProfile);
    { engagementEndTime = updatedProfile.engagementEndTime };
  };

  public shared ({ caller }) func disengage() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can disengage");
    };
    ensureIsProvider(caller);
    let profile = getProviderInternal(caller);
    let updatedProfile = {
      profile with
      isEngaged = false;
      engagementEndTime = null;
    };
    providerProfiles.add(caller, updatedProfile);
  };

  public query ({ caller }) func getProvider(provider : Principal) : async ?ProviderProfileView {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view provider profiles");
    };
    convertProviderProfileOptionToView(updateProviderEngagementState(provider));
  };

  public query ({ caller }) func getClient(client : Principal) : async ?ClientProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view client profiles");
    };

    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    if (caller != client and not isAdmin) {
      Runtime.trap("Unauthorized: Can only view your own client profile");
    };

    clientProfiles.get(client);
  };

  public query ({ caller }) func getJob(jobId : Text) : async ?Job {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view jobs");
    };

    let job = jobs.get(jobId);
    switch (job) {
      case (?j) {
        let isAdmin = AccessControl.isAdmin(accessControlState, caller);
        if (caller != j.client and caller != j.provider and not isAdmin) {
          Runtime.trap("Unauthorized: Can only view your own jobs");
        };
        job;
      };
      case (null) { null };
    };
  };

  func updateProviderEngagementState(principal : Principal) : ?ProviderProfile {
    switch (providerProfiles.get(principal)) {
      case (?profile) {
        switch (profile.engagementEndTime) {
          case (?endTime) {
            if (Time.now() > endTime) {
              let updatedProfile = {
                profile with isEngaged = false;
                engagementEndTime = null;
              };
              providerProfiles.add(principal, updatedProfile);
              ?updatedProfile;
            } else {
              ?profile;
            };
          };
          case (null) { ?profile };
        };
      };
      case (null) { null };
    };
  };

  public query ({ caller }) func getProviderResults(category : ?BusinessType) : async [ProviderProfileView] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can fetch providers");
    };

    let filteredProviders = List.empty<ProviderProfileView>();

    for ((_, profile) in providerProfiles.entries()) {
      switch (profile.category, category) {
        case (null, _) { () };
        case (?storedCategory, ?filterCat) {
          if (storedCategory == filterCat) {
            filteredProviders.add(convertProviderProfileToView(profile));
          };
        };
        case (?_, null) {
          filteredProviders.add(convertProviderProfileToView(profile));
        };
      };
    };

    filteredProviders.values().toArray();
  };

  public query ({ caller }) func getAllProviders() : async [ProviderProfileView] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can fetch providers");
    };
    let allViews = List.empty<ProviderProfileView>();
    for ((_, profile) in providerProfiles.entries()) {
      allViews.add(convertProviderProfileToView(profile));
    };
    allViews.values().toArray();
  };

  public query func getPlatformStats() : async PlatformStats {
    {
      totalClients = clientProfiles.size();
      totalProviders = providerProfiles.size();
    };
  };

  public shared ({ caller }) func setMPesaConfig(config : MPesaConfig) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin users can set M-Pesa config");
    };
    mpesaConfig := ?config;
  };

  public query ({ caller }) func getMpesaConfig() : async ?MPesaConfig {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin users can view M-Pesa config");
    };
    mpesaConfig;
  };

  // Admin operation: Remove all service providers
  public func removeAllProviders() : async () {
    for ((provider, _) in providerProfiles.entries()) {
      let existingRole = userRoles.get(provider);
      switch (existingRole) {
        case (?role) {
          switch (role) {
            case (#provider) { userRoles.remove(provider) };
            case (_) {};
          };
        };
        case (null) {};
      };
    };
    providerProfiles.clear();
  };

  // Admin operation: Seed new set of providers tied to categories
  public shared ({ caller }) func seedProviders(providers : [(Principal, ProviderProfileView)]) : async () {
    for ((principal, profileView) in providers.values()) {
      userRoles.add(principal, #provider);
      providerProfiles.add(principal, {
        principal = profileView.principal;
        name = profileView.name;
        rate = profileView.rate;
        businessType = profileView.businessType;
        location = profileView.location;
        verificationStatus = profileView.verificationStatus;
        ratings = List.empty<Nat>();
        profilePicture = profileView.profilePicture;
        phoneNumber = profileView.phoneNumber;
        description = profileView.description;
        academicDocuments = List.empty<Document>();
        goodConductCert = profileView.goodConductCert;
        isEngaged = profileView.isEngaged;
        engagementEndTime = profileView.engagementEndTime;
        category = profileView.category;
      });
    };
  };
};
