import Map "mo:core/Map";
import List "mo:core/List";
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
import Migration "migration";

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
    surname : Text;
    middleName : Text;
    lastName : Text;
    yearOfBirth : Text;
    idNumber : Text;
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
    surname : Text;
    middleName : Text;
    lastName : Text;
    yearOfBirth : Text;
    idNumber : Text;
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

  public type BioData = {
    fullName : Text;
    email : Text;
    address : Text;
    nationalId : Text;
  };

  public type ClientProfile = {
    principal : Principal;
    mobileNumber : Text;
    surname : Text;
    middleName : Text;
    lastName : Text;
    yearOfBirth : Text;
    idNumber : Text;
    phoneNumber : Text;
    pinnedLocation : ?Location;
    isVerified : Bool;
    bioData : ?BioData;
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

  public type WhatsAppConfig = {
    providerBaseUrl : Text;
    senderPhoneNumber : Text;
    authToken : Text;
  };

  public type OtpRole = { #client; #provider };
  public type PendingOtp = {
    phoneNumber : Text;
    role : OtpRole;
    code : Text;
    expiresAt : Time.Time;
  };

  public type ProviderProfileUpdate = {
    surname : Text;
    yearOfBirth : Text;
    rate : Nat;
    businessType : BusinessType;
    location : Location;
    profilePicture : ?ProfilePicture;
    description : Text;
    category : BusinessType;
  };

  // New ClientProfileUpdate type for updating required fields
  public type ClientProfileUpdate = {
    mobileNumber : Text;
    surname : Text;
    middleName : Text;
    lastName : Text;
    yearOfBirth : Text;
    idNumber : Text;
    phoneNumber : Text;
    pinnedLocation : Location;
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
  var whatsAppConfig : ?WhatsAppConfig = null;

  let documentStorage = Map.empty<Text, Document>();
  let profilePictures = Map.empty<Text, ProfilePicture>();

  // Validation helper functions
  func isValidText(text : Text) : Bool {
    let trimmed = text.trim(#text " ");
    trimmed.size() > 0 and trimmed != "UNKNOWN" and trimmed != "0";
  };

  func isValidIdNumber(idNumber : Text) : Bool {
    let trimmed = idNumber.trim(#text " ");
    trimmed.size() > 0 and trimmed != "0" and trimmed != "UNKNOWN";
  };

  func isValidPhoneNumber(phone : Text) : Bool {
    let trimmed = phone.trim(#text " ");
    trimmed.size() > 0 and trimmed != "UNKNOWN";
  };

  func isValidLocation(location : Location) : Bool {
    location.latitude != 0.0 and location.longitude != 0.0 and isValidText(location.address);
  };

  func validateProviderProfile(pp : {
    surname : Text;
    middleName : Text;
    lastName : Text;
    yearOfBirth : Text;
    idNumber : Text;
    name : Text;
    phoneNumber : Text;
    location : Location;
  }) {
    if (not isValidText(pp.surname)) {
      Runtime.trap("Invalid surname: must be provided and cannot be empty or placeholder");
    };
    if (not isValidText(pp.middleName)) {
      Runtime.trap("Invalid middle name: must be provided and cannot be empty or placeholder");
    };
    if (not isValidText(pp.lastName)) {
      Runtime.trap("Invalid last name: must be provided and cannot be empty or placeholder");
    };
    if (not isValidText(pp.yearOfBirth)) {
      Runtime.trap("Invalid year of birth: must be provided and cannot be empty or placeholder");
    };
    if (not isValidIdNumber(pp.idNumber)) {
      Runtime.trap("Invalid ID number: must be provided and cannot be empty or placeholder");
    };
    if (not isValidText(pp.name)) {
      Runtime.trap("Invalid name: must be provided and cannot be empty or placeholder");
    };
    if (not isValidPhoneNumber(pp.phoneNumber)) {
      Runtime.trap("Invalid phone number: must be provided and cannot be empty or placeholder");
    };
    if (not isValidLocation(pp.location)) {
      Runtime.trap("Invalid location: must provide valid coordinates and address");
    };
  };

  func validateClientProfile(cp : {
    surname : Text;
    middleName : Text;
    lastName : Text;
    yearOfBirth : Text;
    idNumber : Text;
    mobileNumber : Text;
    phoneNumber : Text;
    pinnedLocation : ?Location;
  }) {
    if (not isValidText(cp.surname)) {
      Runtime.trap("Invalid surname: must be provided and cannot be empty or placeholder");
    };
    if (not isValidText(cp.middleName)) {
      Runtime.trap("Invalid middle name: must be provided and cannot be empty or placeholder");
    };
    if (not isValidText(cp.lastName)) {
      Runtime.trap("Invalid last name: must be provided and cannot be empty or placeholder");
    };
    if (not isValidText(cp.yearOfBirth)) {
      Runtime.trap("Invalid year of birth: must be provided and cannot be empty or placeholder");
    };
    if (not isValidIdNumber(cp.idNumber)) {
      Runtime.trap("Invalid ID number: must be provided and cannot be empty or placeholder");
    };
    if (not isValidPhoneNumber(cp.mobileNumber)) {
      Runtime.trap("Invalid mobile number: must be provided and cannot be empty or placeholder");
    };
    if (not isValidPhoneNumber(cp.phoneNumber)) {
      Runtime.trap("Invalid phone number: must be provided and cannot be empty or placeholder");
    };
    switch (cp.pinnedLocation) {
      case (?loc) {
        if (not isValidLocation(loc)) {
          Runtime.trap("Invalid pinned location: must provide valid coordinates and address");
        };
      };
      case (null) {
        Runtime.trap("Pinned location is required for client profiles");
      };
    };
  };

  // Function to convert ProviderProfile to ProviderProfileView
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
      surname : Text;
      middleName : Text;
      lastName : Text;
      yearOfBirth : Text;
      idNumber : Text;
      name : Text;
      rate : ?Nat;
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
      id : Text;
    };
    clientProfile : ?{
      surname : Text;
      middleName : Text;
      lastName : Text;
      yearOfBirth : Text;
      idNumber : Text;
      mobileNumber : Text;
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

    // Validate mandatory fields based on role
    switch (profile.role) {
      case (#provider) {
        switch (profile.providerProfile) {
          case (?pp) {
            validateProviderProfile({
              surname = pp.surname;
              middleName = pp.middleName;
              lastName = pp.lastName;
              yearOfBirth = pp.yearOfBirth;
              idNumber = pp.idNumber;
              name = pp.name;
              phoneNumber = pp.phoneNumber;
              location = pp.location;
            });
          };
          case (null) {
            Runtime.trap("Provider profile is required for provider role");
          };
        };
      };
      case (#client) {
        switch (profile.clientProfile) {
          case (?cp) {
            validateClientProfile({
              surname = cp.surname;
              middleName = cp.middleName;
              lastName = cp.lastName;
              yearOfBirth = cp.yearOfBirth;
              idNumber = cp.idNumber;
              mobileNumber = cp.mobileNumber;
              phoneNumber = cp.phoneNumber;
              pinnedLocation = cp.pinnedLocation;
            });
          };
          case (null) {
            Runtime.trap("Client profile is required for client role");
          };
        };
      };
      case (#backOffice) {
        // Back office users may have different requirements
      };
    };

    userRoles.add(caller, profile.role);

    switch (profile.providerProfile) {
      case (?pp) {
        providerProfiles.add(
          caller,
          {
            principal = caller;
            surname = pp.surname;
            middleName = pp.middleName;
            lastName = pp.lastName;
            yearOfBirth = pp.yearOfBirth;
            idNumber = pp.idNumber;
            name = pp.name;
            rate = switch (pp.rate) {
              case (?r) { r };
              case (null) { 0 };
            };
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
          surname = cp.surname;
          middleName = cp.middleName;
          lastName = cp.lastName;
          yearOfBirth = cp.yearOfBirth;
          mobileNumber = cp.mobileNumber;
          idNumber = cp.idNumber;
          phoneNumber = cp.phoneNumber;
          pinnedLocation = cp.pinnedLocation;
          isVerified = false;
          bioData = null;
        });
      };
      case (null) {};
    };
  };

  // New updateClientProfile method for updating required fields
  public shared ({ caller }) func updateClientProfile(update : ClientProfileUpdate) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update client profiles");
    };

    let userRole = userRoles.get(caller);
    switch (userRole) {
      case (?#client) {};
      case (null) { Runtime.trap("User is not registered as a client") };
      case (_) { Runtime.trap("Only Clients can update client profile") };
    };

    let existingProfile = getClientInternal(caller);

    // Validate all required fields are provided and valid
    if (not isValidText(update.surname)) {
      Runtime.trap("Surname must be provided and cannot be empty or placeholder");
    };
    if (not isValidText(update.middleName)) {
      Runtime.trap("Middle name must be provided and cannot be empty or placeholder");
    };
    if (not isValidText(update.lastName)) {
      Runtime.trap("Last name must be provided and cannot be empty or placeholder");
    };
    if (not isValidText(update.yearOfBirth)) {
      Runtime.trap("Year of birth must be provided and cannot be empty or placeholder");
    };
    if (not isValidIdNumber(update.idNumber)) {
      Runtime.trap("ID number must be provided and cannot be empty or placeholder");
    };
    if (not isValidPhoneNumber(update.mobileNumber)) {
      Runtime.trap("Mobile number must be provided and cannot be empty or placeholder");
    };
    if (not isValidPhoneNumber(update.phoneNumber)) {
      Runtime.trap("Phone number must be provided and cannot be empty or placeholder");
    };
    if (not isValidLocation(update.pinnedLocation)) {
      Runtime.trap("Pinned location must provide valid coordinates and address");
    };

    let updatedProfile = {
      existingProfile with
      surname = update.surname;
      middleName = update.middleName;
      lastName = update.lastName;
      yearOfBirth = update.yearOfBirth;
      mobileNumber = update.mobileNumber;
      idNumber = update.idNumber;
      phoneNumber = update.phoneNumber;
      pinnedLocation = ?update.pinnedLocation;
    };

    clientProfiles.add(caller, updatedProfile);
  };

  public shared ({ caller }) func saveClientBioData(bioData : BioData) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can save bio-data");
    };

    // Verify caller is a client
    let userRole = userRoles.get(caller);
    switch (userRole) {
      case (?#client) {};
      case (null) { Runtime.trap("User profile not found") };
      case (_) { Runtime.trap("Only clients can save bio-data") };
    };

    switch (clientProfiles.get(caller)) {
      case (?profile) {
        let updatedProfile = { profile with bioData = ?bioData };
        clientProfiles.add(caller, updatedProfile);
      };
      case (null) {
        Runtime.trap("Client profile does not exist");
      };
    };
  };

  public shared ({ caller }) func updateProviderProfile(update : ProviderProfileUpdate) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update profiles");
    };

    ensureIsProvider(caller);
    let existingProfile = getProviderInternal(caller);

    // Validate updated fields
    if (not isValidText(update.surname)) {
      Runtime.trap("Invalid surname: must be provided and cannot be empty or placeholder");
    };
    if (not isValidText(update.yearOfBirth)) {
      Runtime.trap("Invalid year of birth: must be provided and cannot be empty or placeholder");
    };
    if (not isValidLocation(update.location)) {
      Runtime.trap("Invalid location: must provide valid coordinates and address");
    };

    let updatedProfile = {
      existingProfile with
      surname = update.surname;
      yearOfBirth = update.yearOfBirth;
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

    if (not isValidLocation(newLocation)) {
      Runtime.trap("Invalid location: must provide valid coordinates and address");
    };

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

    if (not isValidLocation(newLocation)) {
      Runtime.trap("Invalid location: must provide valid coordinates and address");
    };

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

  public shared ({ caller }) func setWhatsAppConfig(config : WhatsAppConfig) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin users can set WhatsApp config");
    };
    whatsAppConfig := ?config;
  };

  public query ({ caller }) func getWhatsAppConfig() : async ?WhatsAppConfig {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin users can view WhatsApp config");
    };
    whatsAppConfig;
  };

  public shared ({ caller }) func removeAllProviders() : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin users can remove all providers");
    };
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

  public shared ({ caller }) func seedProviders(providers : [(Principal, ProviderProfileView)]) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin users can seed providers");
    };
    for ((principal, profileView) in providers.values()) {
      userRoles.add(principal, #provider);
      providerProfiles.add(principal, {
        principal = profileView.principal;
        surname = profileView.surname;
        middleName = profileView.middleName;
        lastName = profileView.lastName;
        yearOfBirth = profileView.yearOfBirth;
        idNumber = profileView.idNumber;
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

  public query ({ caller }) func getClientBioData(client : Principal) : async ?BioData {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view bio-data");
    };

    // Only allow viewing own bio-data or admin access
    if (caller != client and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own bio-data");
    };

    switch (clientProfiles.get(client)) {
      case (?profile) { profile.bioData };
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
};
