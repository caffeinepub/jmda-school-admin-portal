import Map "mo:core/Map";
import Set "mo:core/Set";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Types
  public type StudentId = Nat;
  public type TeacherId = Nat;
  public type ClassId = Nat;
  public type AnnouncementId = Nat;

  public type Student = {
    id : StudentId;
    name : Text;
    gradeLevel : Nat;
    guardianContact : Text;
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

  public type SchoolStats = {
    studentCount : Nat;
    teacherCount : Nat;
    classCount : Nat;
    announcementCount : Nat;
  };

  public type UserProfile = {
    name : Text;
  };

  // State
  var studentIdCounter = 0;
  var teacherIdCounter = 0;
  var classIdCounter = 0;
  var announcementIdCounter = 0;

  let students = Map.empty<StudentId, Student>();
  let teachers = Map.empty<TeacherId, Teacher>();
  let classes = Map.empty<ClassId, Class>();
  let announcements = Map.empty<AnnouncementId, Announcement>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Access control
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Claim Admin logic
  public shared ({ caller }) func claimAdmin() : async Bool {
    // Check if caller is anonymous
    if (caller.isAnonymous()) {
      return false;
    };

    // Check if any admin exists by scanning userRoles map
    let hasAdmin = accessControlState.userRoles.values().any(
      func(role) { role == #admin }
    );

    if (hasAdmin) {
      return false;
    };

    // Directly add caller to userRoles map as admin
    accessControlState.userRoles.add(caller, #admin);

    true;
  };

  // SECURITY CRITICAL: This function allows ANY non-anonymous user to become admin
  // This is a severe security vulnerability but implemented as requested
  // WARNING: This function should be removed or heavily restricted in production
  public shared ({ caller }) func forceClaimAdmin() : async Bool {
    // Check if caller is anonymous
    if (caller.isAnonymous()) {
      return false;
    };

    // SECURITY ISSUE: No authorization check here means anyone can take over
    // Clear all user roles and set caller as only admin
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
  public shared ({ caller }) func createStudent(name : Text, gradeLevel : Nat, guardianContact : Text) : async StudentId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create students");
    };
    let id = studentIdCounter;
    studentIdCounter += 1;

    let student : Student = {
      id;
      name;
      gradeLevel;
      guardianContact;
    };
    students.add(id, student);
    id;
  };

  public query ({ caller }) func getStudent(id : StudentId) : async ?Student {
    students.get(id);
  };

  public shared ({ caller }) func updateStudent(id : StudentId, name : Text, gradeLevel : Nat, guardianContact : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update students");
    };
    switch (students.get(id)) {
      case (null) { Runtime.trap("Student not found") };
      case (?student) {
        let updatedStudent : Student = {
          student with
          name;
          gradeLevel;
          guardianContact;
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

  // Dashboard stats
  public query ({ caller }) func getSchoolStats() : async SchoolStats {
    let studentCount = students.size();
    let teacherCount = teachers.size();
    let classCount = classes.size();
    let announcementCount = announcements.size();

    {
      studentCount;
      teacherCount;
      classCount;
      announcementCount;
    };
  };
};
