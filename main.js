/* information about jsdocs: 
* param: http://usejsdoc.org/tags-param.html#examples
* returns: http://usejsdoc.org/tags-returns.html
* 
/**
 * Listen for the document to load and initialize the application
 */
$(document).ready(initializeApp);
const firestore = firebase.firestore();
const settings = {timestampsInSnapshots: true};
firestore.settings(settings);
/**
 * Define all global variables here.  
 */
var student_array = [];
function Student(name, course, grade, id) {
      this.name = name;
      this.course = course;
      this.grade = grade;
      this.id = id;
};
/***********************
 * student_array - global array to hold student objects
 * @type {Array}
 * example of student_array after input: 
 * student_array = [
 *  { name: 'Jake', course: 'Math', grade: 85 },
 *  { name: 'Jill', course: 'Comp Sci', grade: 85 }
 * ];
 */

/***************************************************************************************************
* initializeApp 
* @params {undefined} none
* @returns: {undefined} none
* initializes the application, including adding click handlers and pulling in any data from the server, in later versions
*/
function initializeApp(){
      addClickHandlersToElements();
      if (student_array = []) {
            $('#mainTable').append(`<tr class="noData"><td><h1>User Info Unavailable</h1></td></tr>`);
      }
      handleGetDataClick();
}

/***************************************************************************************************
* addClickHandlerstoElements
* @params {undefined} 
* @returns  {undefined}
*     
*/
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
/***************************************************************************************************
 * handleAddClicked - Event Handler when user clicks the add button
 * @param {object} event  The event object from the click
 * @return: 
       none
 */
function handleAddClicked(){
      addStudent();
      $('.noData').remove();
}
/***************************************************************************************************
 * handleCancelClicked - Event Handler when user clicks the cancel button, should clear out student form
 * @param: {undefined} none
 * @returns: {undefined} none
 * @calls: clearAddStudentFormInputs
 */
function handleCancelClick(){
      clearAddStudentFormInputs();
}
/***************************************************************************************************
 * addStudent - creates a student objects based on input fields in the form and adds the object to global student array
 * @param {undefined} none
 * @return undefined
 * @calls clearAddStudentFormInputs, updateStudentList
 */
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
/***************************************************************************************************
 * clearAddStudentForm - clears out the form values based on inputIds variable
 */
function clearAddStudentFormInputs(){
      $('#studentName').val('');
      $('#course').val('');
      $('#studentGrade').val('');
}
/***************************************************************************************************
 * renderStudentOnDom - take in a student object, create html elements from the values and then append the elements
 * into the .student_list tbody
 * @param {object} studentObj a single student object with course, name, and grade inside
 */
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



/***************************************************************************************************
 * updateStudentList - centralized function to update the average and call student list update
 * @param students {array} the array of student objects
 * @returns {undefined} none
 * @calls renderStudentOnDom, calculateGradeAverage, renderGradeAverage
 */
function updateStudentList(students){
      calculateGradeAverage(students);
}
/***************************************************************************************************
 * calculateGradeAverage - loop through the global student array and calculate average grade and return that value
 * @param: {array} students  the array of student objects
 * @returns {number}
 */
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
/***************************************************************************************************
 * renderGradeAverage - updates the on-page grade average
 * @param: {number} average    the grade average
 * @returns {undefined} none
 */
function renderGradeAverage(gradeAverage){
      $('.avgGrade').text(gradeAverage)
}

function deleteStudentData(student){
      firestore.collection('students').doc(student).delete().then(function() {
            console.log("Document successfully deleted!");
        }).catch(function(error) {
            console.error("Error removing document: ", error);
        });
}



