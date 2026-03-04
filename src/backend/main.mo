import Map "mo:core/Map";
import Set "mo:core/Set";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Types
  public type StudentId = Nat;
  public type TeacherId = Nat;
  public type ClassId = Nat;
  public type AnnouncementId = Nat;
  public type FeePaymentId = Nat;

  public type Student = {
    id : StudentId;
    registrationNo : Text;
    name : Text;
    gradeLevel : Nat;
    guardianContact : Text;
    guardianName : Text;
    className : Text;
  };

  public type Teacher = {
    id : TeacherId;
    name : Text;
    department : Text;
  };

  public type Class = {
    id : ClassId;
    name : Text;
    gradeLevel : Nat;
    teacherId : TeacherId;
    studentIds : Set.Set<StudentId>;
  };

  public type ClassView = {
    id : ClassId;
    name : Text;
    gradeLevel : Nat;
    teacherId : TeacherId;
    studentIds : [StudentId];
  };

  func toClassView(classRecord : Class) : ClassView {
    {
      id = classRecord.id;
      name = classRecord.name;
      gradeLevel = classRecord.gradeLevel;
      teacherId = classRecord.teacherId;
      studentIds = classRecord.studentIds.values().toArray();
    };
  };

  public type Announcement = {
    id : AnnouncementId;
    title : Text;
    message : Text;
    date : Time.Time;
  };

  public type FeePayment = {
    id : FeePaymentId;
    studentId : StudentId;
    feesTerm : Text;
    date : Text;
    termlyFee : Nat;
    admissionFee : Nat;
    registrationFee : Nat;
    artMaterial : Nat;
    transport : Nat;
    books : Nat;
    uniform : Nat;
    fine : Nat;
    others : Nat;
    previousBalance : Nat;
    discountInFee : Nat;
    total : Nat;
    deposit : Nat;
    dueableBalance : Nat;
    createdAt : Time.Time;
  };

  public type SchoolStats = {
    studentCount : Nat;
    teacherCount : Nat;
    classCount : Nat;
    announcementCount : Nat;
    totalFeeCollected : Nat;
  };

  public type UserProfile = {
    name : Text;
  };

  // State
  var studentIdCounter = 0;
  var teacherIdCounter = 0;
  var classIdCounter = 0;
  var announcementIdCounter = 0;
  var feePaymentIdCounter = 0;

  let students = Map.empty<StudentId, Student>();
  let teachers = Map.empty<TeacherId, Teacher>();
  let classes = Map.empty<ClassId, Class>();
  let announcements = Map.empty<AnnouncementId, Announcement>();
  let feePayments = Map.empty<FeePaymentId, FeePayment>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Claim Admin logic
  public shared ({ caller }) func claimAdmin() : async Bool {
    if (caller.isAnonymous()) {
      return false;
    };

    let hasAdmin = accessControlState.userRoles.values().any(
      func(role) { role == #admin }
    );

    if (hasAdmin) {
      return false;
    };

    accessControlState.userRoles.add(caller, #admin);

    true;
  };

  public shared ({ caller }) func forceClaimAdmin() : async Bool {
    if (caller.isAnonymous()) {
      return false;
    };

    accessControlState.userRoles.clear();
    accessControlState.userRoles.add(caller, #admin);

    true;
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Student CRUD
  public shared ({ caller }) func createStudent(
    registrationNo : Text,
    name : Text,
    gradeLevel : Nat,
    guardianContact : Text,
    guardianName : Text,
    className : Text,
  ) : async StudentId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create students");
    };
    let id = studentIdCounter;
    studentIdCounter += 1;

    let student : Student = {
      id;
      registrationNo;
      name;
      gradeLevel;
      guardianContact;
      guardianName;
      className;
    };
    students.add(id, student);
    id;
  };

  public query ({ caller }) func getStudent(id : StudentId) : async ?Student {
    students.get(id);
  };

  public shared ({ caller }) func updateStudent(
    id : StudentId,
    registrationNo : Text,
    name : Text,
    gradeLevel : Nat,
    guardianContact : Text,
    guardianName : Text,
    className : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update students");
    };
    switch (students.get(id)) {
      case (null) { Runtime.trap("Student not found") };
      case (?student) {
        let updatedStudent : Student = {
          student with
          registrationNo;
          name;
          gradeLevel;
          guardianContact;
          guardianName;
          className;
        };
        students.add(id, updatedStudent);
      };
    };
  };

  public shared ({ caller }) func deleteStudent(id : StudentId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete students");
    };
    if (not students.containsKey(id)) {
      Runtime.trap("Student not found");
    };
    students.remove(id);
  };

  public query ({ caller }) func getAllStudents() : async [Student] {
    students.values().toArray();
  };

  // Teacher CRUD
  public shared ({ caller }) func createTeacher(name : Text, department : Text) : async TeacherId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create teachers");
    };
    let id = teacherIdCounter;
    teacherIdCounter += 1;

    let teacher : Teacher = {
      id;
      name;
      department;
    };
    teachers.add(id, teacher);
    id;
  };

  public query ({ caller }) func getTeacher(id : TeacherId) : async ?Teacher {
    teachers.get(id);
  };

  public shared ({ caller }) func updateTeacher(id : TeacherId, name : Text, department : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update teachers");
    };
    switch (teachers.get(id)) {
      case (null) { Runtime.trap("Teacher not found") };
      case (?teacher) {
        let updatedTeacher : Teacher = {
          teacher with
          name;
          department;
        };
        teachers.add(id, updatedTeacher);
      };
    };
  };

  public shared ({ caller }) func deleteTeacher(id : TeacherId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete teachers");
    };
    if (not teachers.containsKey(id)) {
      Runtime.trap("Teacher not found");
    };
    teachers.remove(id);
  };

  public query ({ caller }) func getAllTeachers() : async [Teacher] {
    teachers.values().toArray();
  };

  // Class CRUD
  public shared ({ caller }) func createClass(name : Text, gradeLevel : Nat, teacherId : TeacherId) : async ClassId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create classes");
    };
    if (not teachers.containsKey(teacherId)) {
      Runtime.trap("Teacher not found");
    };

    let id = classIdCounter;
    classIdCounter += 1;

    let classRecord : Class = {
      id;
      name;
      gradeLevel;
      teacherId;
      studentIds = Set.empty<StudentId>();
    };
    classes.add(id, classRecord);
    id;
  };

  public query ({ caller }) func getClass(id : ClassId) : async ?ClassView {
    switch (classes.get(id)) {
      case (null) { null };
      case (?classRecord) { ?toClassView(classRecord) };
    };
  };

  public shared ({ caller }) func updateClass(id : ClassId, name : Text, gradeLevel : Nat, teacherId : TeacherId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update classes");
    };
    if (not teachers.containsKey(teacherId)) {
      Runtime.trap("Teacher not found");
    };

    switch (classes.get(id)) {
      case (null) { Runtime.trap("Class not found") };
      case (?classRecord) {
        let updatedClass : Class = {
          classRecord with
          name;
          gradeLevel;
          teacherId;
        };
        classes.add(id, updatedClass);
      };
    };
  };

  public shared ({ caller }) func deleteClass(id : ClassId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete classes");
    };
    if (not classes.containsKey(id)) {
      Runtime.trap("Class not found");
    };
    classes.remove(id);
  };

  public query ({ caller }) func getAllClasses() : async [ClassView] {
    classes.values().toArray().map(func(classRecord) { toClassView(classRecord) });
  };

  // Class enrollment
  public shared ({ caller }) func addStudentToClass(classId : ClassId, studentId : StudentId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can modify class enrollment");
    };
    if (not students.containsKey(studentId)) {
      Runtime.trap("Student not found");
    };
    switch (classes.get(classId)) {
      case (null) { Runtime.trap("Class not found") };
      case (?classRecord) {
        if (classRecord.studentIds.contains(studentId)) {
          Runtime.trap("Student already enrolled in class");
        };
        classRecord.studentIds.add(studentId);
      };
    };
  };

  public shared ({ caller }) func removeStudentFromClass(classId : ClassId, studentId : StudentId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can modify class enrollment");
    };
    switch (classes.get(classId)) {
      case (null) { Runtime.trap("Class not found") };
      case (?classRecord) {
        classRecord.studentIds.remove(studentId);
      };
    };
  };

  // Announcement CRUD
  public shared ({ caller }) func createAnnouncement(title : Text, message : Text) : async AnnouncementId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create announcements");
    };
    let id = announcementIdCounter;
    announcementIdCounter += 1;

    let announcement : Announcement = {
      id;
      title;
      message;
      date = Time.now();
    };
    announcements.add(id, announcement);
    id;
  };

  public query ({ caller }) func getAnnouncement(id : AnnouncementId) : async ?Announcement {
    announcements.get(id);
  };

  public query ({ caller }) func getAllAnnouncements() : async [Announcement] {
    announcements.values().toArray();
  };

  public shared ({ caller }) func deleteAnnouncement(id : AnnouncementId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete announcements");
    };
    if (not announcements.containsKey(id)) {
      Runtime.trap("Announcement not found");
    };
    announcements.remove(id);
  };

  // Fee Payments CRUD
  public shared ({ caller }) func createFeePayment(
    studentId : StudentId,
    feesTerm : Text,
    date : Text,
    termlyFee : Nat,
    admissionFee : Nat,
    registrationFee : Nat,
    artMaterial : Nat,
    transport : Nat,
    books : Nat,
    uniform : Nat,
    fine : Nat,
    others : Nat,
    previousBalance : Nat,
    discountInFee : Nat,
    deposit : Nat,
  ) : async FeePaymentId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create fee payments");
    };
    if (not students.containsKey(studentId)) {
      Runtime.trap("Student not found");
    };

    let id = feePaymentIdCounter;
    feePaymentIdCounter += 1;

    let total = termlyFee + admissionFee + registrationFee + artMaterial + transport + books + uniform + fine + others;
    let newTotal = if (total < discountInFee) { 0 } else {
      total - discountInFee;
    };
    let dueableBalance : Nat = if (newTotal + previousBalance < deposit) {
      0;
    } else { (newTotal + previousBalance) - deposit };

    let feePayment : FeePayment = {
      id;
      studentId;
      feesTerm;
      date;
      termlyFee;
      admissionFee;
      registrationFee;
      artMaterial;
      transport;
      books;
      uniform;
      fine;
      others;
      previousBalance;
      discountInFee;
      total = newTotal;
      deposit;
      dueableBalance;
      createdAt = Time.now();
    };
    feePayments.add(id, feePayment);
    id;
  };

  public query ({ caller }) func getFeePaymentsByStudent(studentId : StudentId) : async [FeePayment] {
    // Admin required.
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Only admins can fetch student fee payments");
    };
    feePayments.values().toArray().filter(
      func(fp) { fp.studentId == studentId }
    );
  };

  public query ({ caller }) func getAllFeePayments() : async [FeePayment] {
    // Admin required.
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Only admins can fetch all fee payments");
    };
    feePayments.values().toArray();
  };

  public shared ({ caller }) func deleteFeePayment(id : FeePaymentId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete fee payments");
    };
    if (not feePayments.containsKey(id)) {
      Runtime.trap("Fee payment not found");
    };
    feePayments.remove(id);
  };

  // Dashboard stats
  public query ({ caller }) func getSchoolStats() : async SchoolStats {
    // No access check needed -- public read
    let studentCount = students.size();
    let teacherCount = teachers.size();
    let classCount = classes.size();
    let announcementCount = announcements.size();

    var totalFeeCollected = 0;
    for (fp in feePayments.values()) {
      totalFeeCollected += fp.deposit;
    };

    {
      studentCount;
      teacherCount;
      classCount;
      announcementCount;
      totalFeeCollected;
    };
  };
};
