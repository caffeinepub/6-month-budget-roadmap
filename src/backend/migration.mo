import Map "mo:core/Map";
import Text "mo:core/Text";
import Float "mo:core/Float";

module {
  type OldActor = {
    savingsAmount : Float;
    housingFund : Float;
    checkingBalance : Float;
    checklist : Map.Map<Text, Map.Map<Text, Bool>>;
    grocerySpending : Map.Map<Text, Float>;
    nonEssentialSpending : Map.Map<Text, Float>;
    notes : Map.Map<Text, Text>;
  };

  type Income = {
    id : Text;
    amount : Float;
    date : Text;
    category : Text;
    note : ?Text;
  };

  type Receipt = {
    id : Text;
    amount : Float;
    date : Text;
    mainCategory : Text;
    subCategory : Text;
    note : ?Text;
  };

  type NewActor = {
    savingsAmount : Float;
    housingFund : Float;
    checkingBalance : Float;
    checklist : Map.Map<Text, Map.Map<Text, Bool>>;
    grocerySpending : Map.Map<Text, Float>;
    nonEssentialSpending : Map.Map<Text, Float>;
    notes : Map.Map<Text, Text>;
    incomeEntries : Map.Map<Text, Income>;
    receiptEntries : Map.Map<Text, Receipt>;
    nextId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    // Initialize without new entries
    {
      old with
      incomeEntries = Map.empty<Text, Income>();
      receiptEntries = Map.empty<Text, Receipt>();
      nextId = 0;
    };
  };
};
