document.addEventListener("DOMContentLoaded", () => {
    const flashcard = document.getElementById("flashcard");
    const front = document.getElementById("front");
    const back = document.getElementById("back");
    const prevButton = document.getElementById("prevButton");
    const nextButton = document.getElementById("nextButton");
    const currentIndexLabel = document.getElementById("currentIndex");
    const totalCardsLabel = document.getElementById("totalCards");

    let flashcards = JSON.parse(localStorage.getItem("flashcards")) || [];
    let currentIndex = 0;
    let isFlipped = false;

    totalCardsLabel.textContent = flashcards.length;

    function showFlashcard() {
        if (flashcards.length === 0) {
            front.textContent = "No flashcards available.";
            back.textContent = "";
            return;
        }

        front.textContent = flashcards[currentIndex].question;
        back.textContent = flashcards[currentIndex].answer;
        currentIndexLabel.textContent = currentIndex + 1;
    }

    flashcard.addEventListener("click", () => {
        isFlipped = !isFlipped;
        flashcard.classList.toggle("flipped", isFlipped);
    });

    nextButton.addEventListener("click", () => {
        currentIndex = (currentIndex + 1) % flashcards.length;
        isFlipped = false;
        flashcard.classList.remove("flipped");
        showFlashcard();
    });

    prevButton.addEventListener("click", () => {
        currentIndex = (currentIndex - 1 + flashcards.length) % flashcards.length;
        isFlipped = false;
        flashcard.classList.remove("flipped");
        showFlashcard();
    });

    showFlashcard();
});
