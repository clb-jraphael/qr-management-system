<?php
    session_start();
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="stylesheet" href="css/signup.css">

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" 
    integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous">

    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register</title>

</head>

<body>
     <!-- Nav Bar -->
     <nav class="navbar navbar-expand-lg fixed-top">
        <div class="container-fluid">
          <a class="navbar-brand" href="index.php">Event Management System</a>
        </div>
    </nav>

   
    <div class="container mt-5 pt-5">
        <form class="form-signup" action="includes/process-signup.php" method="post" novalidate>
            <h3 class="text-center">SIGN UP</h3>

            <div class="form-group">
                <div class="row">
                    <div class="col-md-6">
                        <input type="text" class="form-control" name="firstname" placeholder="First Name">
                    </div>

                    <div class="col-md-6">
                        <input type="text" class="form-control" name="lastname" placeholder="Last Name">
                    </div>
                </div>
            </div>

            <div class="form-group">
                <input type="email" name="email" class="form-control" placeholder="Email Address">
            </div>

            <div class="form-group">
                <input type="text" name="school" class="form-control" placeholder="School/University">
            </div>

            <div class="form-group">
                <input type="password" name="password" class="form-control" placeholder="Password">
            </div>

            <div class="form-group">
                <input type="password" name="confirm-password" class="form-control" placeholder="Confirm Password">
            </div>
            <?php
                if (isset($_SESSION["signup_errors"])) {
                    $errors = $_SESSION["signup_errors"];

                    echo "<br>";

                    foreach ($errors as $error) {
                        echo "<p>" . $error . "</p>";
                    }

                    unset($_SESSION["signup_errors"]);
                }
            ?>
            <input type="submit" class="btn btn-success btn-block" name="" value="Register">

            <p class="text-center">Already have an account? <a href="index.php">Login</a></p>
        </form>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL" crossorigin="anonymous"></script>
</body>

</html>