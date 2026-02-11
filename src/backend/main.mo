import Map "mo:core/Map";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import OutCall "http-outcalls/outcall";
import Migration "migration";

// New migration clause
(with migration = Migration.run)
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
    isEngaged : Bool; // New field for engagement status
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
  };

  public type ClientProfile = {
    principal : Principal;
    phoneNumber : Text;
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

  // New type for stats
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

  // Component initialization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // State
  let userRoles = Map.empty<Principal, UserRole>();
  let providerProfiles = Map.empty<Principal, ProviderProfile>();
  let clientProfiles = Map.empty<Principal, ClientProfile>();
  let jobs = Map.empty<Text, Job>();
  var mpesaConfig : ?MPesaConfig = null;

  // Document storage
  let documentStorage = Map.empty<Text, Document>();
  let profilePictures = Map.empty<Text, ProfilePicture>();

  // Internal helpers for view conversion
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

  // Internet Identity/Role management
  public shared ({ caller }) func setUserRole(role : UserRole) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can set roles");
    };
    userRoles.add(caller, role);
  };

  // Required profile functions
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

  // Enforce only public immutable API
  public shared ({ caller }) func saveCallerUserProfile(profile : {
    role : UserRole;
    providerProfile : ?{
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
    };
    clientProfile : ?{
      principal : Principal;
      phoneNumber : Text;
    };
  }) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    userRoles.add(caller, profile.role);

    switch (profile.providerProfile) {
      case (?pp) {
        providerProfiles.add(caller, {
          pp with
          ratings = List.empty<Nat>();
          academicDocuments = List.empty<Document>();
        });
      };
      case (null) {};
    };

    switch (profile.clientProfile) {
      case (?cp) { clientProfiles.add(caller, cp) };
      case (null) {};
    };
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

  // Profile management functions
  public shared ({ caller }) func createOrUpdateProviderProfile(
    name : Text,
    rate : Nat,
    businessType : BusinessType,
    location : Location,
    phoneNumber : Text,
    description : Text,
    isEngaged : Bool, // New parameter for engagement status
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create profiles");
    };

    let userRole = userRoles.get(caller);
    if (userRole != ?#provider) {
      Runtime.trap("Unauthorized: Only providers can create provider profiles");
    };

    let existingRatings = switch (providerProfiles.get(caller)) {
      case (?existing) { existing.ratings };
      case (null) { List.empty<Nat>() };
    };

    let existingVerificationStatus = switch (providerProfiles.get(caller)) {
      case (?existing) { existing.verificationStatus };
      case (null) { #unverified };
    };

    let existingAcademicDocs = switch (providerProfiles.get(caller)) {
      case (?existing) { existing.academicDocuments };
      case (null) { List.empty<Document>() };
    };

    let existingGoodConductCert = switch (providerProfiles.get(caller)) {
      case (?existing) { existing.goodConductCert };
      case (null) { null };
    };

    let profile : ProviderProfile = {
      principal = caller;
      name;
      rate;
      businessType;
      location;
      verificationStatus = existingVerificationStatus;
      ratings = existingRatings;
      profilePicture = null;
      phoneNumber;
      description;
      academicDocuments = existingAcademicDocs;
      goodConductCert = existingGoodConductCert;
      isEngaged;
    };

    providerProfiles.add(caller, profile);
  };

  public shared ({ caller }) func createOrUpdateClientProfile(
    phoneNumber : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create profiles");
    };

    let userRole = userRoles.get(caller);
    if (userRole != ?#client) {
      Runtime.trap("Unauthorized: Only clients can create client profiles");
    };

    let profile : ClientProfile = {
      principal = caller;
      phoneNumber;
    };

    clientProfiles.add(caller, profile);
  };

  // Document upload functions
  public shared ({ caller }) func uploadDocument(
    docType : DocumentType,
    filename : Text,
    blob : Storage.ExternalBlob,
  ) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can upload documents");
    };

    let document : Document = {
      docType;
      filename;
      blob;
    };

    let docId = filename;
    documentStorage.add(docId, document);
    docId;
  };

  public shared ({ caller }) func addDocumentToProvider(docId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add documents to profiles");
    };

    let providerProfile = getProviderInternal(caller);

    let document = switch (documentStorage.get(docId)) {
      case (?doc) { doc };
      case (null) { Runtime.trap("Document not found") };
    };

    switch (document.docType) {
      case (#academicQualification) {
        let newAcademicDocs = providerProfile.academicDocuments.clone();
        newAcademicDocs.add(document);
        let updatedProfile = {
          providerProfile with academicDocuments = newAcademicDocs;
        };
        providerProfiles.add(caller, updatedProfile);
      };
      case (#goodConductCertificate) {
        let updatedProfile = {
          providerProfile with goodConductCert = ?document;
        };
        providerProfiles.add(caller, updatedProfile);
      };
    };
  };

  public shared ({ caller }) func uploadProfilePicture(
    id : Text,
    blob : Storage.ExternalBlob,
  ) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can upload profile pictures");
    };

    let picture : ProfilePicture = {
      id;
      blob;
    };

    profilePictures.add(id, picture);
    id;
  };

  public shared ({ caller }) func addProfilePictureToProvider(pictureId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add profile pictures to profiles");
    };

    let providerProfile = getProviderInternal(caller);

    let picture = switch (profilePictures.get(pictureId)) {
      case (?pic) { pic };
      case (null) { Runtime.trap("Profile picture not found") };
    };

    let updatedProfile = {
      providerProfile with profilePicture = ?picture;
    };
    providerProfiles.add(caller, updatedProfile);
  };

  // Provider search - Public access for marketplace discovery
  public query func searchProviders(
    filterBusinessType : ?BusinessType,
    _userLocation : Location,
    _maxDistance : ?Nat
  ) : async [ProviderProfileView] {
    let filtered = providerProfiles.values().filter(
      func(profile) {
        let businessTypeMatches = switch (filterBusinessType, profile.businessType) {
          case (?filter, actual) { filter == actual };
          case (null, _) { true };
        };
        businessTypeMatches;
      }
    );
    filtered.map<ProviderProfile, ProviderProfileView>(convertProviderProfileToView).toArray();
  };

  // Provider preview - Public access for marketplace discovery
  public query func getProviderPreview(provider : Principal) : async ?ProviderPreview {
    let profile = providerProfiles.get(provider);
    switch (profile) {
      case (null) { null };
      case (?p) {
        ?{
          provider = convertProviderProfileToView(p);
          isEngaged = p.isEngaged;
        };
      };
    };
  };

  // Job functions
  public shared ({ caller }) func requestLink(
    provider : Principal,
    payment : Nat,
    jobDescription : Text
  ) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can request jobs");
    };

    let userRole = userRoles.get(caller);
    if (userRole != ?#client) {
      Runtime.trap("Unauthorized: Only clients can request jobs");
    };

    switch (providerProfiles.get(provider)) {
      case (null) { Runtime.trap("Provider not found") };
      case (?_) {};
    };

    let jobId = provider.toText() # caller.toText() # jobDescription # payment.toText();

    let job : Job = {
      id = jobId;
      client = caller;
      provider;
      payment;
      description = jobDescription;
      status = #requested;
    };

    jobs.add(jobId, job);
    jobId;
  };

  // Public query for engagement status - needed for UI display
  public query func providerHasEngagedJob(provider : Principal) : async Bool {
    switch (providerProfiles.get(provider)) {
      case (?profile) { profile.isEngaged };
      case (null) { false };
    };
  };

  public shared ({ caller }) func markJobInProgress(jobId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update jobs");
    };

    let job = getJobInternal(jobId);

    if (caller != job.provider) {
      Runtime.trap("Unauthorized: Only the assigned provider can mark job in progress");
    };

    jobs.add(jobId, { job with status = #inProgress });
  };

  public shared ({ caller }) func markJobCompleted(jobId : Text, rating : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can complete jobs");
    };

    if (rating < 1 or rating > 5) {
      Runtime.trap("Invalid rating: Must be between 1 and 5");
    };

    let job = getJobInternal(jobId);

    if (caller != job.client) {
      Runtime.trap("Unauthorized: Only the client can mark job as completed");
    };

    jobs.add(jobId, { job with status = #completed({ rating }) });

    let provider = getProviderInternal(job.provider);
    provider.ratings.add(rating);
  };

  public shared ({ caller }) func cancelJob(jobId : Text, reason : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can cancel jobs");
    };

    let job = getJobInternal(jobId);

    if (caller != job.client and caller != job.provider) {
      Runtime.trap("Unauthorized: Only the client or provider can cancel this job");
    };

    jobs.add(jobId, { job with status = #cancelled(reason) });
  };

  // Verification workflow
  public shared ({ caller }) func updateVerificationStatus(
    provider : Principal,
    status : VerificationStatus
  ) : async () {
    let userRole = userRoles.get(caller);
    let isBackOffice = userRole == ?#backOffice;
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);

    if (not isBackOffice and not isAdmin) {
      Runtime.trap(
        "Unauthorized: Only back-office staff or admins can update verification status"
      );
    };

    let providerProfile = getProviderInternal(provider);
    providerProfiles.add(
      provider,
      { providerProfile with verificationStatus = status },
    );
  };

  // Engagement status workflow - FIXED: Only allow providers to update their own status
  public shared ({ caller }) func updateEngagementStatus(isEngaged : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update engagement status");
    };

    // Verify the caller is a provider
    let userRole = userRoles.get(caller);
    if (userRole != ?#provider) {
      Runtime.trap("Unauthorized: Only providers can update engagement status");
    };

    // Get the caller's own provider profile (this ensures they can only update their own status)
    let providerProfile = getProviderInternal(caller);
    
    // Update only the caller's engagement status
    providerProfiles.add(
      caller,
      { providerProfile with isEngaged },
    );
  };

  // Internal helpers
  func getProviderInternal(provider : Principal) : ProviderProfile {
    switch (providerProfiles.get(provider)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("Provider not found") };
    };
  };

  func getJobInternal(jobId : Text) : Job {
    switch (jobs.get(jobId)) {
      case (?job) { job };
      case (null) { Runtime.trap("Job not found") };
    };
  };

  // Public data access functions
  public query ({ caller }) func getProvider(provider : Principal) : async ?ProviderProfileView {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return null;
    };
    let profile = providerProfiles.get(provider);
    convertProviderProfileOptionToView(profile);
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

  // Public stats for landing page - no authentication required
  public query func getPlatformStats() : async PlatformStats {
    {
      totalClients = clientProfiles.size();
      totalProviders = providerProfiles.size();
    };
  };

  // M-Pesa Payment integration (config)
  public shared ({ caller }) func setMPesaConfig(config : MPesaConfig) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin users can set M-Pesa config");
    };
    mpesaConfig := ?config;
  };

  public query ({ caller }) func getMpesaConfig() : async ?MPesaConfig {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      return null;
    };
    mpesaConfig;
  };
};
