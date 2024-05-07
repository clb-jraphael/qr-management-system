document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById("search-event");
    searchInput.addEventListener("input", function() {
        const keyword = searchInput.value.toLowerCase().trim(); 
    
        const QRCards = document.querySelectorAll("#QRCard");
    
        QRCards.forEach(function(qrcard) {
            const eventTitle = qrcard.querySelector(".event-title"); //selects all movie-title class
            const movieTitle = eventTitle.textContent.toLowerCase();
    
            if (movieTitle.includes(keyword)) {
                qrcard.style.display = "flex";
            } else {
                qrcard.style.display = "none";
            }
        });
    });
});