<?php
require 'DBQueries.php';


if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $email = $_POST["email"];
    $existingEmail = getEmail($db, $email);
    
    if ($existingEmail) {
        if (password_verify($_POST["password"], $existingEmail["password"])) {
            session_start();
            $_SESSION['email'] = $email;
            header("Location: home.php");
            exit;
        } else {
            redirectWithError("Email and Password does not match.");
        }
    } else {
        redirectWithError("Email is not registered.");
    }
}

function redirectWithError($errorMsg) {
    session_start();
    $_SESSION["login_error"] = $errorMsg;
    header("Location: index.php");
    exit;
}