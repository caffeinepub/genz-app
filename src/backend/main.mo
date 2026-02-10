import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

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
    #education;
    #finance;
    #healthcare;
    #hospitality;
    #it;
    #maintenance;
    #manufacturing;
    #marketing;
    #realEstate;
    #retail;
    #transportation;
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

  // Component initialization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // State
  let userRoles = Map.empty<Principal, UserRole>();
  let providerProfiles = Map.empty<Principal, ProviderProfile>();
  let clientProfiles = Map.empty<Principal, ClientProfile>();
  let jobs = Map.empty<Text, Job>();

  // Internal helpers for view conversion
  func convertProviderProfileToView(profile : ProviderProfile) : ProviderProfileView {
    let ratingsArray = profile.ratings.toArray();
    {
      profile with ratings = ratingsArray
    };
  };

  func convertProviderProfileOptionToView(profile : ?ProviderProfile) : ?ProviderProfileView {
    switch (profile) {
      case (null) { null };
      case (?p) { ?convertProviderProfileToView(p) };
    };
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
          pp with ratings = List.empty<Nat>()
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

  // Provider search
  public query ({ caller }) func searchProviders(
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

    let jobId = provider.toText() # caller.toText() # jobDescription # Nat.toText(payment);

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
};
