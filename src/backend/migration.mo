module {
  public type OldActor = {
    // Old state without the updateClientProfile function
  };

  public type NewActor = {
    // New state with updateClientProfile function
  };

  public func run(old : OldActor) : NewActor {
    // No state changes needed, just add the new method
    old;
  };
};
