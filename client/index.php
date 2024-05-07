<?php
session_start();
include 'includes/process-login.php';

    if (isset($_SESSION['email'])) {
        header ('Location: home.php');
        exit;
    }
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <link rel="stylesheet" href="css/style.css">

    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous">

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"
    integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL"
    crossorigin="anonymous" defer></script>
    
    
    <title>LOGIN</title>
</head>
<body>

     <!-- Nav Bar -->
    <nav class="navbar navbar-expand-lg fixed-top" >
        <div class="container-fluid">
          <a class="navbar-brand" href="index.php">Event Management System</a>
        </div>
    </nav>

    
    <section>
        <div class="container mt-5 pt-5">
        <h3 class="text-center">LOGIN</h3>

            <div class="row">
                <div class="col-12 col-sm-8 col-md-6 m-auto">
                    <div class="card-body">
                        <form method="post">
                            <div class="group my-4">
                                <label for="email">E-mail Address</label>
                                <input type="email" name="email" id="email" class="form-control my-2 py-2" placeholder="E-mail">
                            </div>
                           
                            <div class="group my-4">
                                <label for="password">Password</label>
                                <input type="password" name="password" id="password" class="form-control my-2 py-2" placeholder="Password">
                            </div>
                            <?php
                                if(isset($_SESSION["login_error"])) {
                                    $error = $_SESSION["login_error"];

                                    echo "<br>";

                                    echo "<p>" . $error . "</p>";

                                    unset($_SESSION["login_error"]);
                                }
                            ?>
                            <div class="text-center">
                                <button class="btn btn-primary">Login</button>
                                <p class="my-3">Don't have an account yet? <a href="signup.php">Register here</a></p>
                                <p><a href="#">Forgot Password</a></p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </section>
</body>
</html>

