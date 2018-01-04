$(document).ready(function () {

    // Initialize Firebase
    var config = {
      apiKey: "AIzaSyDX8FJuZm87sDV5rC1s49f7_TGrlobtg1g",
      authDomain: "groupproject1-aba5b.firebaseapp.com",
      databaseURL: "https://groupproject1-aba5b.firebaseio.com",
      projectId: "groupproject1-aba5b",
      storageBucket: "groupproject1-aba5b.appspot.com",
      messagingSenderId: "727018048572"
      };
      firebase.initializeApp(config);
    // Create a variable to reference the database
    var database = firebase.database();

    $("#volunteerSubmit").on('click', function (event) {
        event.preventDefault();

        // Grabs user input
        var inputName = $("#name").val().trim();
        var inputPhone = $("#phone").val().trim();

        // Creates local "temporary" object for holding volunteer data
        var volunteerValues = {
            name: inputName,
            phone: inputPhone
        };

        // Push new values to the database
        database.ref().push(volunteerValues);
        Materialize.toast('You have added a train', 3000) // 4000 is the duration of the toast

        // Clear out text fields after submit
        $("#name").val("");
        $("#phone").val("");

    });

    // Create a listener for value changes in the database
    database.ref().on("child_added", function (childSnapshot) {


        // User input data
        var inputName = childSnapshot.val().name;
        var inputPhone = childSnapshot.val().phone;

        // Append all the values to the table in the HTML
        $("#volunteerTable").append("<tr><td>" + inputName + "</td><td>" + inputPhone + "</td><td>" + "</td></tr>");
    });
});
