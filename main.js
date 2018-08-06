$(document).ready(initializeApp);



function initializeApp(){
      addClickHandlersToElements();
      if (student_array = []) {
            $('#mainTable').append(`<tr class="noData"><td><h1>User Info Unavailable</h1></td></tr>`);
      }
      handleGetDataClick();
      $('#updateModal').modal();
      $('#deleteModal').modal();
      if(!navigator.onLine){
            $('.offline').removeClass('displayNone');
      }
      window.addEventListener("offline", function () {
            $('.offline').removeClass('displayNone');
            console.log("Online status: " + navigator.onLine);
        }, false);
        
        window.addEventListener("online", function () {
            $('.offline').addClass('displayNone');
            console.log("Online status: " + navigator.onLine);
        }, false);
      
}

//----------------------------------------->
// Student Object Handling
var student_array = [];
var sortedSwitch = {
      "name": 0,
      "subject": 0,
      "grade": 0
}
function Student(name, subject, grade, id, timestamp) {
      this.name = name;
      this.subject = subject;
      this.grade = grade;
      this.id = id;
      this.timestamp = timestamp;
};
function addStudent(){
      var name = $('#studentName').val();
      var subject = $('#subject').val();
      var grade = parseInt($('#studentGrade').val());
      var student_id = null;
      var timestamp = null;
      var addedStudent = new Student(name, subject, grade, student_id, timestamp);
      clearAddStudentFormInputs();
      firestore.collection('students').add({
            name: name,
            subject: subject,
            grade: grade,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
      }).then(function(docRef) {
            student_id = docRef.id;
            addedStudent.id = docRef.id;
            student_array.push(addedStudent);
            renderStudentOnDom(addedStudent);
            calculateGradeAverage(student_array);
            M.toast({html: `Student ${name} added`, classes: 'teal darken-1'});
      }).catch(function(error) {
            M.toast({html: `"Error adding student: ", ${error}`, classes: 'red darken-1'});
      });
}
function addExternalDataStudent(students){
      $('tbody tr').replaceWith();
      student_array=[];
    for(studentIndex = 0; studentIndex < students.length; studentIndex++ ){
          var name = students[studentIndex].name;
          var subject = students[studentIndex].subject;
          var grade = students[studentIndex].grade;
          var student_id = students[studentIndex].id;
          var addedStudent = new Student(name, subject, grade, student_id);
          student_array.push(addedStudent);
          renderStudentOnDom(addedStudent);

    }
    calculateGradeAverage(student_array);
}
function renderStudentOnDom(studentObj){
    $('#mainTable').append(`<tr></tr>`);
    $('#mainTable tr:last-child').append(`<td>${studentObj.name}</td><td>${studentObj.subject}</td><td>${studentObj.grade}</td>`);
    var updateData = $('<td>');
    var updateButton = $('<button><i class="small material-icons prefix">edit</i></button>').addClass('btn btn-small update blue lighten-1').attr('studentID', studentObj.id);
    updateButton.on('click', function(){
        $('#updateModal').modal('open');  
        $('#studentNameUpdate').val(studentObj.name).addClass('active');
        $('#subjectUpdate').val(studentObj.subject).addClass('active');
        $('#studentGradeUpdate').val(studentObj.grade).addClass('active');
        $('.modal-content label').addClass('active');
        $('.updateStudent').attr('studentID', studentObj.id);
    });
    updateData.append(updateButton);
    var deleteData = $('<td>');
    var deleteButton = $('<button><i class="small material-icons prefix">delete</i></button>').addClass('btn btn-small delete red darken-1');
    deleteButton.on('click', function(){
      $('.deleteStudent').attr('studentID', studentObj.id);
      handleDeleteModal(studentObj)});
    deleteData.append(deleteButton);
    $('#mainTable tr:last-child').append(updateData);
    $('#mainTable tr:last-child').append(deleteData);
}
function handleDeleteModal(student){
      $('#deleteModal').modal('open');
      $('.deleteConfirm').on('click', function(){
            deleteStudentData(student)
      });
}
function deleteStudentData(student){
      //TODO: Resolve triggering sequence
      $('#deleteModal').modal('close');
      firestore.collection('students').doc(student.id).delete().then(function() {
            M.toast({html: `Student deleted`, classes: 'red darken-1'});
            var arrayPosition = student_array.indexOf(student);
            student_array.splice(arrayPosition, 1);
            $(this).parents('tr').remove();
            calculateGradeAverage(student_array);
            handleGetDataClick();
            if(student_array.length === 0){
                renderGradeAverage(0);
                $('#mainTable').append(`<tr class="noData"><td><h5>User Info Unavailable</h5></td></tr>`);
            }
      }).catch(function(error) {
            M.toast({html: `"Error removing student: ", ${error}`, classes: 'red darken-1'});
      });
}
function updateButtonSubmit(){
      var name = $('#studentNameUpdate').val();
      var subject = $('#subjectUpdate').val();
      var grade = parseInt($('#studentGradeUpdate').val());
      var id = $('.updateStudent').attr('studentID');
      if (name === "" || subject === "" ||  isNaN(grade)) {
            M.toast({html: `Form must be filled out`, classes: 'red darken-1'});
            return false;
      }
      var updatedStudent = {
            name: name,
            subject: subject,
            grade: grade,
            id: id
      }
      updateStudentData(updatedStudent);
      $('#updateModal').modal('close');
}
function updateStudentData(studentObj){
    var student = firestore.collection('students').doc(`${studentObj.id}`);
    var name = studentObj.name;
    var subject = studentObj.subject;
    var grade = studentObj.grade;
    var id = studentObj.id;
    return student.update({
        name: name,
        subject: subject,
        grade: grade,
        id: id
    }
    ).then(function() {
      handleGetDataClick();
      M.toast({html: `Student ${name} updated`, classes: 'blue lighten-1'});

    }).catch(function(error) {
        M.toast({html: `"Error updating student: ", ${error}`, classes: 'red darken-1'})
    });
}

//----------------------------------------->
// Click Handling Functions
function addClickHandlersToElements(){
      $('.addStudent').click(handleFormInputs);
      $('.cancel').click(handleCancelClick);
      $('.getData').click(handleGetDataClick);
}
function sortStudents(column){
      var sortedStudents = [];
      $('tbody tr').replaceWith();
      function sortStudentsAsc(sortField){
            var students = firestore.collection("students");
            students.orderBy(sortField, "asc").get().then((querySnapshot) => {
                  querySnapshot.forEach((doc) => {
                        var student = {
                              'id': doc.id,
                              'name': doc.data().name,
                              'grade': doc.data().grade,
                              'subject': doc.data().subject,
                              'timestamp': doc.data().timestamp
                        };
                        sortedStudents.push(student);
                  });
                  addExternalDataStudent(sortedStudents);
            });
      }
      function sortStudentsDesc(sortField){
            var students = firestore.collection("students");
            students.orderBy(sortField, "desc").get().then((querySnapshot) => {
                  querySnapshot.forEach((doc) => {
                        var student = {
                              'id': doc.id,
                              'name': doc.data().name,
                              'grade': doc.data().grade,
                              'subject': doc.data().subject,
                              'timestamp': doc.data().timestamp
                        };
                        sortedStudents.push(student);
                  });
                  addExternalDataStudent(sortedStudents);
            });
      }
      switch (column) {
            case "name":
                  if(sortedSwitch.name === 0){
                        sortStudentsAsc("name");
                        sortedSwitch.name = 1;
                        return;
                  }
                  sortStudentsDesc("name");
                  sortedSwitch.name = 0;
                  break;
            case "subject":
                  if(sortedSwitch.subject === 0){
                        sortStudentsAsc("subject");
                        sortedSwitch.subject = 1;
                        return;
                  }
                  sortStudentsDesc("subject");
                  sortedSwitch.subject = 0;
                  break;
            case "grade":
                  if(sortedSwitch.grade === 0){
                        sortStudentsAsc("grade");
                        sortedSwitch.grade = 1;
                        return;
                  }
                  sortStudentsDesc("grade");
                  sortedSwitch.grade = 0;
                  break;
            default:
                  break;
      }
}
function handleGetDataClick(){
      var importedStudents = [];
      $('tbody tr').replaceWith();
      var students = firestore.collection("students")
      students.orderBy("name").onSnapshot(function(querySnapshot){
                  querySnapshot.forEach(function(doc) {
                        var fbStudent = {
                              'id': doc.id,
                              'name': doc.data().name,
                              'grade': doc.data().grade,
                              'subject': doc.data().subject,
                              'timestamp': doc.data().timestamp
                        }
                        importedStudents.push(fbStudent);
                  });
                  addExternalDataStudent(importedStudents);
                  importedStudents = [];
              });
      if(student_array.length === 0){
            renderGradeAverage(0);
            $('#mainTable').append(`<tr class="noData"><td><h5>User Info Unavailable</h5></td></tr>`);
      }
}
function handleAddClicked(){
      addStudent();
      $('.noData').remove();
}
function handleCancelClick(){
      clearAddStudentFormInputs();
      $('label, input').removeClass('active valid');
}
function clearAddStudentFormInputs(){
    $('#studentName, #studentNameUpdate').val('').removeClass('valid');
    $('#subject, #subjectUpdate').val('').removeClass('valid');
    $('#studentGrade, #studentGradeUpdate').val('').removeClass('valid');
    $('label').removeClass('active');
}
function handleFormInputs(){
      var name = $('#studentName').val();
      var subject = $('#subject').val();
      var grade = $('#studentGrade').val();
      validateForm();
      function validateForm() {
            if (name === "" || subject === "" || grade === "") {
                  M.toast({html: `Form must be filled out`, classes: 'red darken-1'});
                  return false;
            } else {
                  handleAddClicked();
            }
      }
}
function handleUpdateInputs(){
      var name = $('#studentNameUpdate').val();
      var subject = $('#subjectUpdate').val();
      var grade = $('#studentGradeUpdate').val();
      validateForm();
      function validateForm() {
            if (name === "" || subject === "" || grade === "") {
                  M.toast({html: `Form must be filled out`, classes: 'red darken-1'});
                  return false;
            } else {
                  handleAddClicked();
            }
      }
}
//----------------------------------------->
//Student List Change Functions
function calculateGradeAverage(students){
      if(student_array.length === 0){
            renderGradeAverage(0);
            $('#mainTable').append(`<tr class="noData"><td><h1>User Info Unavailable</h1></td></tr>`);
      } else {
            $('.noData').remove();
            var grade = students.reduce((prev,next) => prev + next.grade,0);
            var average = Math.round(grade/students.length);
            renderGradeAverage(average);
            return average;
      }
}
function renderGradeAverage(gradeAverage){
      $('.avgGrade').text(gradeAverage)
}