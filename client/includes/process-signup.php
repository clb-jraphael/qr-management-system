<?php
require 'DBQueries.php';


//assign submitted input from form to variables
$email = trim($_POST["email"]);
$password = $_POST["password"];
$confirmPassword = $_POST["confirm-password"];
$firstname = trim($_POST["firstname"]);
$lastname = trim($_POST["lastname"]);
$school = trim($_POST["school"]);

$existingEmail = getEmail($db, $email); //used to check if email exists in database
$errors = []; //array for errors


//error handlers
//store errors to the array with corresponding key and value
if (empty($email) || empty($password) || empty($confirmPassword) || empty($firstname) || empty($lastname) || empty($school)) {
    $errors["blank_field"] = "Please fill in all the fields.";
    session_start();
    $_SESSION["signup_errors"] = $errors;
    header("Location: ../signup.php");
    exit;
}

if ($existingEmail) {
    $errors["email_taken"] = "Email is already taken.";
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors["invalid_email"] = "Enter a valid email.";
}

if (strlen($password) < 8) {
    $errors["short_password"] = "Password must be at least 8 characters.";
}

if (!preg_match("/[a-z]/i", $password)) {
    $errors["require_letter"] = "Password must contain at least one letter (e.g. a-z, A-Z).";
}

if (!preg_match("/[0-9]/", $password)) {
    $errors["require_digit"] = "Password must contain at least one number (e.g. 0, 1, 2, ... 9).";
}

if (preg_match("/[\s| ]/", $password)) {
    $errors["whitespace_pwd"] = "Password must not contain spaces (e.g. spacebar).";
}

if ($password !== $confirmPassword) {
    $errors["pwd_mismatch"] = "Passwords does not match.";
}

session_start();

//Insert user to db if there is no error
if ($errors) {
    $_SESSION["signup_errors"] = $errors; //store error array into a session
    header("Location: ../signup.php");
    exit;
} else {
    //hash the pwd before inserting to db
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    insertUserToDB($db, $email, $hashed_password, $firstname, $lastname, $school);
    header("Location: ../index.php");
    exit;
}