<?php
include 'includes/process-events-display.php';
include 'includes/require_session.php';
?>

<!DOCTYPE html>

<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>Event Management System</title>


  <link rel="stylesheet" href="css/home.css">

  <!-- Bootstrap CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet"
    integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous">

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"
    integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL" crossorigin="anonymous"
    defer></script>
  <script src="js/search-title-script.js" defer></script>
</head>

<body>
  <nav class="navbar navbar-expand-lg fixed-top">
    <div class="container-fluid">
      <a class="navbar-brand" href="home.php">Event Management System</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar"
        aria-controls="offcanvasNavbar" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
        <div class="offcanvas-header">
          <h5 class="offcanvas-title" id="offcanvasNavbarLabel">Event Management System</h5>
          <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body d-flex flex-column flex-lg-row p-4
                p-lg-0">
          <ul class="navbar-nav justify-content-center flex-grow-1 pe-3
                align-items-center fs-5">

            <li class="nav-item">
              <a class="nav-link active" aria-current="page" href="home.php">Home</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="view-events.php">Events</a>

            </li>
            <li class="nav-item">
              <a class="nav-link" href="view-qrcodes.php">QR Codes</a>
            </li>

          </ul>

          <div class="d-flex flex-column flex-lg-row
              align-items-center gap-3">
              <p><?php
                $user = getEmail($db, $_SESSION['email']);
                echo '<p id="greeting"> Welcome, ' . $user['firstname'] . ' ' . $user['lastname'] . '!</p>';
              ?></p>
            <a href="includes/process-logout.php" class="text-white text-decoration-none px-3 py-1 rounded-4"
              style="background-color: #27374D;">Logout</a>
          </div>
        </div>
      </div>
    </div>
  </nav>

  <h2>Attendance</h2>

  <div id="search-container" class="d-flex justify-content-center">
    <input type="search" id="search-event" placeholder="Search Event Title">
  </div>

  <?php
    displayAttendance($db, $_SESSION['email']);
  ?>
</script>
</body>
</html>