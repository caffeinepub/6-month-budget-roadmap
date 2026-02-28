import List "mo:core/List";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Float "mo:core/Float";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";

actor {
  type Account = {
    id : Text;
    name : Text;
    accountType : Text; // "Checking" | "Savings" | "Credit Card" | "Other"
    balance : Float;
  };

  type Income = {
    id : Text;
    amount : Float;
    date : Text;
    category : Text; // "Social Security" | "Tamara Job Income" | "Other Income"
    note : ?Text;
    user : Text; // "Christopher" | "Tamara"
    accountId : Text;
  };

  type Receipt = {
    id : Text;
    amount : Float;
    date : Text;
    mainCategory : Text; // "Bills" | "Household Goods"
    subCategory : Text; // Bills: "Credit Card", "Auto Insurance", "Utilities", "Loans", "Other"
    note : ?Text;
    user : Text; // "Christopher" | "Tamara"
    accountId : Text;
  };

  var savingsAmount : Float = 10563.0;
  var housingFund : Float = 0.0;

  let checklist = Map.empty<Text, Map.Map<Text, Bool>>();
  let grocerySpending = Map.empty<Text, Float>();
  let nonEssentialSpending = Map.empty<Text, Float>();
  let notes = Map.empty<Text, Text>();

  let accounts = Map.empty<Text, Account>();
  let incomeEntries = Map.empty<Text, Income>();
  let receiptEntries = Map.empty<Text, Receipt>();

  var nextId = 0;

  // Account Management
  public shared ({ caller }) func addAccount(name : Text, accountType : Text, initialBalance : Float) : async Text {
    validateAccountType(accountType);
    if (name == "") { Runtime.trap("Account name cannot be empty") };

    let id = nextId.toText();
    let account : Account = {
      id;
      name;
      accountType;
      balance = initialBalance;
    };
    accounts.add(id, account);
    nextId += 1;
    id;
  };

  public shared ({ caller }) func updateAccount(id : Text, name : Text, accountType : Text, balance : Float) : async () {
    validateAccountType(accountType);
    if (name == "") { Runtime.trap("Account name cannot be empty") };

    switch (accounts.get(id)) {
      case (null) { Runtime.trap("Account not found") };
      case (?_) {
        let updatedAccount : Account = {
          id;
          name;
          accountType;
          balance;
        };
        accounts.add(id, updatedAccount);
      };
    };
  };

  public shared ({ caller }) func deleteAccount(id : Text) : async () {
    if (not accounts.containsKey(id)) {
      Runtime.trap("Account not found");
    };
    accounts.remove(id);
  };

  public query ({ caller }) func getAllAccounts() : async [Account] {
    accounts.values().toArray();
  };

  public query ({ caller }) func getAccount(id : Text) : async ?Account {
    accounts.get(id);
  };

  // Checklist Functions
  public shared ({ caller }) func toggleChecklistItem(group : Text, item : Text) : async Bool {
    if (group == "") { Runtime.trap("Group label cannot be empty") };
    if (item == "") { Runtime.trap("Item label cannot be empty") };

    let currentState = switch (checklist.get(group)) {
      case (null) { false };
      case (?groupMap) {
        switch (groupMap.get(item)) {
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
    checklist.toArray().map(func((group, groupMap)) { (group, groupMap.toArray()) });
  };

  // Financial Amount Functions
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
  } {
    {
      savingsAmount;
      housingFund;
    };
  };

  // Income Management
  public shared ({ caller }) func addIncomeEntry(amount : Float, date : Text, category : Text, note : ?Text, user : Text, accountId : Text) : async Text {
    validateIncomeCategory(category);
    validateUser(user);

    switch (accounts.get(accountId)) {
      case (null) { Runtime.trap("Account not found") };
      case (?_) {
        let id = nextId.toText();
        let entry : Income = {
          id;
          amount;
          date;
          category;
          note;
          user;
          accountId;
        };
        incomeEntries.add(id, entry);

        updateAccountBalance(accountId, amount);
        nextId += 1;
        id;
      };
    };
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

  // Receipt Management
  public shared ({ caller }) func addReceiptEntry(amount : Float, date : Text, mainCategory : Text, subCategory : Text, note : ?Text, user : Text, accountId : Text) : async Text {
    validateReceiptCategory(mainCategory, subCategory);
    validateUser(user);

    switch (accounts.get(accountId)) {
      case (null) { Runtime.trap("Account not found") };
      case (?_) {
        let id = nextId.toText();
        let entry : Receipt = {
          id;
          amount;
          date;
          mainCategory;
          subCategory;
          note;
          user;
          accountId;
        };
        receiptEntries.add(id, entry);

        updateAccountBalance(accountId, -amount);
        nextId += 1;
        id;
      };
    };
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
      totalIncome;
      totalBills;
      totalHouseholdGoods;
    };
  };

  // Helper functions for calculations
  func getTotalIncomeHelper() : Float {
    var total : Float = 0.0;
    incomeEntries.values().forEach(func(e) { total += e.amount });
    total;
  };

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

  func getTotalIncomeByUser(user : Text) : Float {
    var total : Float = 0.0;
    incomeEntries.values().forEach(
      func(e) {
        if (e.user == user) {
          total += e.amount;
        };
      }
    );
    total;
  };

  func getTotalBillsByUser(user : Text) : Float {
    var total : Float = 0.0;
    receiptEntries.values().forEach(
      func(e) {
        if (e.user == user and e.mainCategory == "Bills") {
          total += e.amount;
        };
      }
    );
    total;
  };

  func getTotalHouseholdGoodsByUser(user : Text) : Float {
    var total : Float = 0.0;
    receiptEntries.values().forEach(
      func(e) {
        if (e.user == user and e.mainCategory == "Household Goods") {
          total += e.amount;
        };
      }
    );
    total;
  };

  // New User-Specific Queries
  public query ({ caller }) func getIncomeEntriesByUser(user : Text) : async [Income] {
    let filtered = List.empty<Income>();
    incomeEntries.values().forEach(
      func(entry) {
        if (entry.user == user) {
          filtered.add(entry);
        };
      }
    );
    filtered.toArray();
  };

  public query ({ caller }) func getReceiptEntriesByUser(user : Text) : async [Receipt] {
    let filtered = List.empty<Receipt>();
    receiptEntries.values().forEach(
      func(entry) {
        if (entry.user == user) {
          filtered.add(entry);
        };
      }
    );
    filtered.toArray();
  };

  public query ({ caller }) func getFinancialSummaryByUser(user : Text) : async {
    totalIncome : Float;
    totalBills : Float;
    totalHouseholdGoods : Float;
  } {
    {
      totalIncome = getTotalIncomeByUser(user);
      totalBills = getTotalBillsByUser(user);
      totalHouseholdGoods = getTotalHouseholdGoodsByUser(user);
    };
  };

  // Validation Functions
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

  func validateUser(user : Text) {
    switch (user) {
      case ("Christopher") {};
      case ("Tamara") {};
      case (_) { Runtime.trap("Invalid user") };
    };
  };

  func validateAccountType(accountType : Text) {
    switch (accountType) {
      case ("Checking") {};
      case ("Savings") {};
      case ("Credit Card") {};
      case ("Other") {};
      case (_) { Runtime.trap("Invalid account type") };
    };
  };

  func updateAccountBalance(accountId : Text, amount : Float) {
    switch (accounts.get(accountId)) {
      case (null) { Runtime.trap("Account not found") };
      case (?account) {
        let updatedAccount = {
          account with balance = account.balance + amount
        };
        accounts.add(accountId, updatedAccount);
      };
    };
  };
};
