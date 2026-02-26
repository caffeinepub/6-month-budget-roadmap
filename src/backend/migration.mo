import Map "mo:core/Map";
import Text "mo:core/Text";
import Float "mo:core/Float";

module {
  type OldIncome = {
    id : Text;
    amount : Float;
    date : Text;
    category : Text;
    note : ?Text;
    user : Text;
  };

  type OldReceipt = {
    id : Text;
    amount : Float;
    date : Text;
    mainCategory : Text;
    subCategory : Text;
    note : ?Text;
    user : Text;
  };

  type OldActor = {
    savingsAmount : Float;
    housingFund : Float;
    checkingBalance : Float;
    checklist : Map.Map<Text, Map.Map<Text, Bool>>;
    grocerySpending : Map.Map<Text, Float>;
    nonEssentialSpending : Map.Map<Text, Float>;
    notes : Map.Map<Text, Text>;
    incomeEntries : Map.Map<Text, OldIncome>;
    receiptEntries : Map.Map<Text, OldReceipt>;
    nextId : Nat;
  };

  type Account = {
    id : Text;
    name : Text;
    accountType : Text;
    balance : Float;
  };

  type Income = {
    id : Text;
    amount : Float;
    date : Text;
    category : Text;
    note : ?Text;
    user : Text;
    accountId : Text;
  };

  type Receipt = {
    id : Text;
    amount : Float;
    date : Text;
    mainCategory : Text;
    subCategory : Text;
    note : ?Text;
    user : Text;
    accountId : Text;
  };

  type NewActor = {
    savingsAmount : Float;
    housingFund : Float;
    checklist : Map.Map<Text, Map.Map<Text, Bool>>;
    grocerySpending : Map.Map<Text, Float>;
    nonEssentialSpending : Map.Map<Text, Float>;
    notes : Map.Map<Text, Text>;
    accounts : Map.Map<Text, Account>;
    incomeEntries : Map.Map<Text, Income>;
    receiptEntries : Map.Map<Text, Receipt>;
    nextId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let accounts = Map.singleton<Text, Account>(
      "",
      {
        id = "";
        name = "Old Checking Balance";
        accountType = "Checking";
        balance = old.checkingBalance;
      },
    );

    let incomeEntries = old.incomeEntries.map<Text, OldIncome, Income>(
      func(_id, oldIncome) {
        { oldIncome with accountId = "" };
      }
    );

    let receiptEntries = old.receiptEntries.map<Text, OldReceipt, Receipt>(
      func(_id, oldReceipt) {
        { oldReceipt with accountId = "" };
      }
    );

    {
      old with
      accounts;
      incomeEntries;
      receiptEntries;
    };
  };
};
