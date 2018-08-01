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
    $('#updateModal').modal();
}

//----------------------------------------->
// Student Object Handling
var student_array = [];
function Student(name, subject, grade, id) {
      this.name = name;
      this.subject = subject;
      this.grade = grade;
      this.id = id;Object 
};
function addStudent(){
    var name = $('#studentName').val();
    var subject = $('#subject').val();
    var grade = parseInt($('#studentGrade').val());
    var student_id = null;
    var addedStudent = new Student(name, subject, grade, student_id);
    firestore.collection('students').add({
          name: name,
          subject: subject,
          grade: grade
    }).then(function(docRef) {
          console.log("Student added with ID: ", docRef.id);
          student_id = docRef.id;
          addedStudent.id = docRef.id;
          student_array.push(addedStudent);
          renderStudentOnDom(addedStudent);
          clearAddStudentFormInputs();
          updateStudentList(student_array);
      }).catch(function(error) {
          console.error("Error adding student: ", error);
      });
      $('label, input').removeClass('active valid');
}
function addExternalDataStudent(students){
    for(studentIndex = 0; studentIndex < students.length; studentIndex++ ){
          var name = students[studentIndex].name;
          var subject = students[studentIndex].subject;
          var grade = students[studentIndex].grade;
          var student_id = students[studentIndex].id;
          var addedStudent = new Student(name, subject, grade, student_id);
          student_array.push(addedStudent);
          renderStudentOnDom(addedStudent);
          updateStudentList(student_array);
    }
}
function renderStudentOnDom(studentObj){
    $('#mainTable').append(`<tr></tr>`);
    $('#mainTable tr:last-child').append(`<td>${studentObj.name}</td><td>${studentObj.subject}</td><td>${studentObj.grade}</td>`);
    var updateData = $('<td>');
    var updateButton = $('<button>').addClass('btn btn-small update blue lighten-1').text('Update').attr('studentID', studentObj.id);
    updateButton.on('click', function(){
        $('#updateModal').modal('open');  
        $('#studentNameUpdate').val(studentObj.name).addClass('active');
        $('#subjectUpdate').val(studentObj.subject).addClass('active');
        $('#studentGradeUpdate').val(studentObj.grade).addClass('active');
    });
    updateData.append(updateButton);
    var deleteData = $('<td>');
    var deleteButton = $('<button>').addClass('btn btn-small delete red darken-1').text('Delete');
    deleteButton.on('click', function(){
          var arrayPosition = student_array.indexOf(studentObj);
          student_array.splice(arrayPosition, 1);
          $(this).parents('tr').remove();
          calculateGradeAverage(student_array);
          deleteStudentData(studentObj.id);
    });
    deleteData.append(deleteButton);
    $('#mainTable tr:last-child').append(updateData);
    $('#mainTable tr:last-child').append(deleteData);
}
function deleteStudentData(student){
    firestore.collection('students').doc(student).delete().then(function() {
          console.log("Student successfully deleted!");
      }).catch(function(error) {
          console.error("Error removing student: ", error);
      });
}
function updateButton(){
    var name = $('#studentNameUpdate').val();
    var subject = $('#subjectUpdate').val();
    var grade = parseInt($('#studentGradeUpdate').val());
    var id = $('button.update').attr('studentID');
    var updatedStudent = {
        name: name,
        subject: subject,
        grade: grade,
        id: id
    }
    updateStudentData(updatedStudent);
    handleGetDataClick();
    $('#updateModal').modal('close');
    updateStudentList(student_array);
}
function updateStudentData(studentObj){
    var student = firestore.collection('students').doc(studentObj.id); 
    var name = student.name === studentObj.name ? student.name : studentObj.name;
    var subject = student.subject === studentObj.subject ? student.name : studentObj.subject;
    var grade = student.name === studentObj.grade ? student.grade : studentObj.grade;
    return student.update({
        name: name,
        subject: subject,
        grade: grade
    }
    ).then(function() {
        console.log("Student successfully updated!");
    }).catch(function(error) {
        console.error("Error updating student: ", error);
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
                var fbStudent = {
                      'id': doc.id,
                      'name': doc.data().name,
                      'grade': doc.data().grade,
                      'subject': doc.data().subject
                }
                importedStudents.push(fbStudent);
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
      $('label, input').removeClass('active valid');
}
function clearAddStudentFormInputs(){
    $('#studentName, #studentNameUpdate').val('');
    $('#subject, #subjectUpdate').val('');
    $('#studentGrade, #studentGradeUpdate').val('');
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