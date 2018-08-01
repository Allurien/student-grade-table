$(document).ready(initializeApp);
const firestore = firebase.firestore();
const settings = {timestampsInSnapshots: true};
firestore.settings(settings);

function initializeApp(){
    addClickHandlersToElements();
    if (student_array = []) {
          $('#mainTable').append(`<tr class="noData"><td><h1>User Info Unavailable</h1></td></tr>`);
    }
    handleGetDataClick();
}

//----------------------------------------->
// Student Object Handling
var student_array = [];
function Student(name, course, grade, id) {
      this.name = name;
      this.course = course;
      this.grade = grade;
      this.id = id;Object 
};
function addStudent(){
    var name = $('#studentName').val();
    var course = $('#course').val();
    var grade = parseInt($('#studentGrade').val());
    var student_id = null;
    var addedStudent = new Student(name, course, grade, student_id);
    firestore.collection('students').add({
          name: name,
          subject: course,
          grade: grade
    }).then(function(docRef) {
          console.log("Document written with ID: ", docRef.id);
          student_id = docRef.id;
          console.log(student_id);
          addedStudent.id = docRef.id;
          console.log(addedStudent.id);
          console.log(addedStudent);
          student_array.push(addedStudent);
          renderStudentOnDom(addedStudent);
          clearAddStudentFormInputs();
          updateStudentList(student_array);
      }).catch(function(error) {
          console.error("Error adding document: ", error);
      });
}
function addExternalDataStudent(students){
    for(studentIndex = 0; studentIndex < students.length; studentIndex++ ){
          var name = students[studentIndex].name;
          var course = students[studentIndex].course;
          var grade = students[studentIndex].grade;
          var student_id = students[studentIndex].id;
          var addedStudent = new Student(name, course, grade, student_id);
          student_array.push(addedStudent);
          renderStudentOnDom(addedStudent);
          updateStudentList(student_array);
    }
}
function renderStudentOnDom(studentObj){
    $('#mainTable').append(`<tr></tr>`);
    $('#mainTable tr:last-child').append(`<td>${studentObj.name}</td><td>${studentObj.course}</td><td>${studentObj.grade}</td>`);
    var updateData = $('<td>');
    var updateButton = $('<button>').addClass('btn btn-primary update').text('Update');
    updateButton.on('click', function(){
          var arrayPosition = student_array.indexOf(studentObj);
          student_array.splice(arrayPosition, 1);
          $(this).parents('tr').remove();
          calculateGradeAverage(student_array);
          deleteStudentData(studentObj);
    });
    updateData.append(updateButton);
    var deleteData = $('<td>');
    var deleteButton = $('<button>').addClass('btn btn-danger delete').text('Delete');
    deleteButton.on('click', function(){
          var arrayPosition = student_array.indexOf(studentObj);
          student_array.splice(arrayPosition, 1);
          $(this).parents('tr').remove();
          calculateGradeAverage(student_array);
          console.log(studentObj);
          deleteStudentData(studentObj.id);
    });
    deleteData.append(deleteButton);
    $('#mainTable tr:last-child').append(updateData);
    $('#mainTable tr:last-child').append(deleteData);
}
function deleteStudentData(student){
    firestore.collection('students').doc(student).delete().then(function() {
          console.log("Document successfully deleted!");
      }).catch(function(error) {
          console.error("Error removing document: ", error);
      });
}

//----------------------------------------->
// Click Handling Functions
function addClickHandlersToElements(){
      $('.addStudent').click(handleAddClicked);
      $('.cancel').click(handleCancelClick);
      $('.getData').click(handleGetDataClick);
}
function handleGetDataClick(){
      var importedStudents = [];
      $('tr').replaceWith();
      firestore.collection("students").get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                console.log(doc.id, "=>", doc.data());
                var fbStudent = {
                      'id': doc.id,
                      'name': doc.data().name,
                      'grade': doc.data().grade,
                      'course': doc.data().subject
                }
                console.log(fbStudent);
                importedStudents.push(fbStudent);
                console.log(importedStudents); 
            });
            addExternalDataStudent(importedStudents)
        });
      $('.noData').remove();
}
function handleAddClicked(){
      addStudent();
      $('.noData').remove();
}
function handleCancelClick(){
      clearAddStudentFormInputs();
}
function clearAddStudentFormInputs(){
    $('#studentName').val('');
    $('#course').val('');
    $('#studentGrade').val('');
}

//----------------------------------------->
//Student List Change Functions
function updateStudentList(students){
      calculateGradeAverage(students);
}
function calculateGradeAverage(students){
      var grade = null;
      if(student_array.length === 0){
            renderGradeAverage(0);
            $('#mainTable').append(`<tr class="noData"><td><h1>User Info Unavailable</h1></td></tr>`);
      }
      for(var studentAverage=0; studentAverage < students.length; studentAverage++){
            grade += parseInt(students[studentAverage].grade);
            if(student_array.length >= 2) {
                  var average = Math.round(grade/students.length);
            } else {
                  var average = (grade/students.length);
            }
      }
      renderGradeAverage(average);
      return average;

}
function renderGradeAverage(gradeAverage){
      $('.avgGrade').text(gradeAverage)
}