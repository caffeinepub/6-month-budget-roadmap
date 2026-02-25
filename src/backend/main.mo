import Map "mo:core/Map";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Float "mo:core/Float";
import Time "mo:core/Time";
import List "mo:core/List";
import Migration "migration";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Nat "mo:core/Nat";

(with migration = Migration.run)
actor {
  type Income = {
    id : Text;
    amount : Float;
    date : Text;
    category : Text; // "Social Security" | "Tamara Job Income" | "Other Income"
    note : ?Text;
  };

  type Receipt = {
    id : Text;
    amount : Float;
    date : Text;
    mainCategory : Text; // "Bills" | "Household Goods"
    subCategory : Text; // Bills: "Credit Card", "Auto Insurance", "Utilities", "Loans", "Other"
    note : ?Text;
  };

  var savingsAmount : Float = 10563.0;
  var housingFund : Float = 0.0;
  var checkingBalance : Float = 0.0;

  let checklist = Map.empty<Text, Map.Map<Text, Bool>>();
  let grocerySpending = Map.empty<Text, Float>();
  let nonEssentialSpending = Map.empty<Text, Float>();
  let notes = Map.empty<Text, Text>();

  let incomeEntries = Map.empty<Text, Income>();
  let receiptEntries = Map.empty<Text, Receipt>();

  var nextId = 0;

  public shared ({ caller }) func toggleChecklistItem(group : Text, item : Text) : async Bool {
    if (group == "") { Runtime.trap("Group label cannot be empty") };
    if (item == "") { Runtime.trap("Item label cannot be empty") };

    let currentState = switch (checklist.get(group)) {
      case (null) { false };
      case (?weekMap) {
        switch (weekMap.get(item)) {
          case (null) { false };
          case (?state) { state };
        };
      };
    };

    let newState = not currentState;
    let groupMap = switch (checklist.get(group)) {
      case (null) { Map.empty<Text, Bool>() };
      case (?map) { map };
    };
    groupMap.add(item, newState);
    checklist.add(group, groupMap);
    newState;
  };

  public query ({ caller }) func getAllChecklistStates() : async [(Text, [(Text, Bool)])] {
    checklist.toArray().map(func((group, weekMap)) { (group, weekMap.toArray()) });
  };

  public shared ({ caller }) func updateSavingsAmount(amount : Float) : async () {
    savingsAmount := amount;
  };

  public query ({ caller }) func getSavingsAmount() : async Float {
    savingsAmount;
  };

  public shared ({ caller }) func updateHousingFund(amount : Float) : async () {
    housingFund := amount;
  };

  public query ({ caller }) func getHousingFund() : async Float {
    housingFund;
  };

  public shared ({ caller }) func updateCheckingBalance(amount : Float) : async () {
    checkingBalance := amount;
  };

  public query ({ caller }) func getCheckingBalance() : async Float {
    checkingBalance;
  };

  public shared ({ caller }) func updateGrocerySpending(week : Text, amount : Float) : async () {
    if (week == "") { Runtime.trap("Week label cannot be empty") };
    grocerySpending.add(week, amount);
  };

  public query ({ caller }) func getGrocerySpending(week : Text) : async Float {
    switch (grocerySpending.get(week)) {
      case (null) { 0.0 };
      case (?amount) { amount };
    };
  };

  public shared ({ caller }) func updateNonEssentialSpending(week : Text, amount : Float) : async () {
    if (week == "") { Runtime.trap("Week label cannot be empty") };
    nonEssentialSpending.add(week, amount);
  };

  public query ({ caller }) func getNonEssentialSpending(week : Text) : async Float {
    switch (nonEssentialSpending.get(week)) {
      case (null) { 0.0 };
      case (?amount) { amount };
    };
  };

  public shared ({ caller }) func addNote(week : Text, note : Text) : async () {
    if (week == "") { Runtime.trap("Week label cannot be empty") };
    notes.add(week, note);
  };

  public query ({ caller }) func getNote(week : Text) : async ?Text {
    notes.get(week);
  };

  public query ({ caller }) func getAllNotes() : async [(Text, Text)] {
    notes.toArray();
  };

  public query ({ caller }) func getFinancialOverview() : async {
    savingsAmount : Float;
    housingFund : Float;
    checkingBalance : Float;
  } {
    {
      savingsAmount;
      housingFund;
      checkingBalance;
    };
  };

  public shared ({ caller }) func addIncomeEntry(amount : Float, date : Text, category : Text, note : ?Text) : async Text {
    validateIncomeCategory(category);
    let id = nextId.toText();
    let entry : Income = {
      id;
      amount;
      date;
      category;
      note;
    };
    incomeEntries.add(id, entry);
    nextId += 1;
    id;
  };

  public shared ({ caller }) func deleteIncomeEntry(id : Text) : async () {
    if (not incomeEntries.containsKey(id)) {
      Runtime.trap("Income entry not found");
    };
    incomeEntries.remove(id);
  };

  public query ({ caller }) func getAllIncomeEntries() : async [Income] {
    incomeEntries.values().toArray();
  };

  public query ({ caller }) func getMonthlyIncomeTotal(month : Text) : async Float {
    var total : Float = 0.0;
    incomeEntries.values().forEach(
      func(e) {
        if (e.date.contains(#text month)) {
          total += e.amount;
        };
      }
    );
    total;
  };

  public query ({ caller }) func getTotalIncome() : async Float {
    var total : Float = 0.0;
    incomeEntries.values().forEach(func(e) { total += e.amount });
    total;
  };

  public shared ({ caller }) func addReceiptEntry(amount : Float, date : Text, mainCategory : Text, subCategory : Text, note : ?Text) : async Text {
    validateReceiptCategory(mainCategory, subCategory);
    let id = nextId.toText();
    let entry : Receipt = {
      id;
      amount;
      date;
      mainCategory;
      subCategory;
      note;
    };
    receiptEntries.add(id, entry);
    nextId += 1;
    id;
  };

  public shared ({ caller }) func deleteReceiptEntry(id : Text) : async () {
    if (not receiptEntries.containsKey(id)) {
      Runtime.trap("Receipt entry not found");
    };
    receiptEntries.remove(id);
  };

  public shared ({ caller }) func updateReceiptCategory(id : Text, mainCategory : Text, subCategory : Text) : async () {
    if (not receiptEntries.containsKey(id)) {
      Runtime.trap("Receipt entry not found");
    };
    validateReceiptCategory(mainCategory, subCategory);
    switch (receiptEntries.get(id)) {
      case (?entry) {
        let updatedEntry = {
          entry with
          mainCategory;
          subCategory;
        };
        receiptEntries.add(id, updatedEntry);
      };
      case (null) {};
    };
  };

  public query ({ caller }) func getAllReceiptEntries() : async [Receipt] {
    receiptEntries.values().toArray();
  };

  public query ({ caller }) func getWeeklyReceiptTotal(week : Text) : async Float {
    var total : Float = 0.0;
    receiptEntries.values().forEach(
      func(e) {
        if (e.date.contains(#text week)) {
          total += e.amount;
        };
      }
    );
    total;
  };

  public query ({ caller }) func getMonthlyReceiptTotal(month : Text) : async Float {
    var total : Float = 0.0;
    receiptEntries.values().forEach(
      func(e) {
        if (e.date.contains(#text month)) {
          total += e.amount;
        };
      }
    );
    total;
  };

  public query ({ caller }) func getTotalBills() : async Float {
    var total : Float = 0.0;
    receiptEntries.values().forEach(
      func(e) {
        if (e.mainCategory == "Bills") {
          total += e.amount;
        };
      }
    );
    total;
  };

  public query ({ caller }) func getTotalHouseholdGoods() : async Float {
    var total : Float = 0.0;
    receiptEntries.values().forEach(
      func(e) {
        if (e.mainCategory == "Household Goods") {
          total += e.amount;
        };
      }
    );
    total;
  };

  public query ({ caller }) func getFinancialSummary() : async {
    savingsAmount : Float;
    housingFund : Float;
    checkingBalance : Float;
    totalIncome : Float;
    totalBills : Float;
    totalHouseholdGoods : Float;
  } {
    let totalIncome = getTotalIncomeHelper();
    let totalBills = getTotalBillsHelper();
    let totalHouseholdGoods = getTotalHouseholdGoodsHelper();

    {
      savingsAmount;
      housingFund;
      checkingBalance;
      totalIncome;
      totalBills;
      totalHouseholdGoods;
    };
  };

  // Helper function to calculate total income without await
  func getTotalIncomeHelper() : Float {
    var total : Float = 0.0;
    incomeEntries.values().forEach(func(e) { total += e.amount });
    total;
  };

  // Helper function to calculate total bills without await
  func getTotalBillsHelper() : Float {
    var total : Float = 0.0;
    receiptEntries.values().forEach(
      func(e) {
        if (e.mainCategory == "Bills") {
          total += e.amount;
        };
      }
    );
    total;
  };

  // Helper function to calculate total household goods without await
  func getTotalHouseholdGoodsHelper() : Float {
    var total : Float = 0.0;
    receiptEntries.values().forEach(
      func(e) {
        if (e.mainCategory == "Household Goods") {
          total += e.amount;
        };
      }
    );
    total;
  };

  func validateIncomeCategory(category : Text) {
    switch (category) {
      case ("Social Security") {};
      case ("Tamara Job Income") {};
      case ("Other Income") {};
      case (_) { Runtime.trap("Invalid income category") };
    };
  };

  func validateReceiptCategory(mainCategory : Text, subCategory : Text) {
    switch (mainCategory) {
      case ("Bills") {
        switch (subCategory) {
          case ("Credit Card") {};
          case ("Auto Insurance") {};
          case ("Utilities") {};
          case ("Loans") {};
          case ("Other") {};
          case (_) { Runtime.trap("Invalid bills subcategory") };
        };
      };
      case ("Household Goods") {
        switch (subCategory) {
          case ("Groceries") {};
          case ("Clothing") {};
          case ("Healthcare Goods") {};
          case ("Gas") {};
          case ("Fast Food") {};
          case (_) { Runtime.trap("Invalid household goods subcategory") };
        };
      };
      case (_) { Runtime.trap("Invalid main category") };
    };
  };
};
