import { useState, useEffect } from "react";

// Import the images from the same folder
import face1 from "./face1.jpg";
import face2 from "./face2.jpg";
import face3 from "./face3.jpg";
import face4 from "./face4.jpg";
import face5 from "./face5.jpg";
import face6 from "./face6.jpg";

const FaceMatchingGame = () => {
  // Define name-face pairs with imported images
  const nameFacePairs = [
    { name: "Alice", image: face1 },
    { name: "Ben", image: face2 },
    { name: "Clara", image: face3 },
    { name: "Daniel", image: face4 },
    { name: "Eva", image: face5 },
    { name: "Frank", image: face6 },
  ];

  // Shuffle function
  const shuffleArray = (array: any[]) => {
    return array.sort(() => Math.random() - 0.5);
  };

  const [cards, setCards] = useState(shuffleArray([...nameFacePairs, ...nameFacePairs]));
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  useEffect(() => {
    if (matchedPairs.length === nameFacePairs.length) {
      setGameOver(true);
      speak("Great job! You matched all the faces!");
      setFeedbackMessage("Great job! You matched all the faces!");
    }
  }, [matchedPairs]);

  const handleClick = (index: number) => {
    if (flippedCards.length === 2 || flippedCards.includes(index) || gameOver) return;

    const newFlippedCards = [...flippedCards, index];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      const [firstCardIndex, secondCardIndex] = newFlippedCards;
      if (cards[firstCardIndex].name === cards[secondCardIndex].name) {
        setMatchedPairs((prev) => [...prev, cards[firstCardIndex].name]);
        setFeedbackMessage("You matched a pair!");
        speak("Keep going!");
        setFlippedCards([]); // Reset flippedCards to allow further clicks
      } else {
        setTimeout(() => {
          setFlippedCards([]);
          setFeedbackMessage("Try again! Keep going!");
          speak("Try again! Keep going!");
        }, 1000);
      }
    }
  };

  const resetGame = () => {
    setCards(shuffleArray([...nameFacePairs, ...nameFacePairs]));
    setFlippedCards([]);
    setMatchedPairs([]);
    setGameOver(false);
    setFeedbackMessage("");
  };

  const speak = (text: string) => {
    if ("speechSynthesis" in window) {
      const synth = window.speechSynthesis;
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "en-US";
      synth.speak(utter);
    } else {
      console.warn("Speech synthesis not supported in this browser.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-semibold text-black mb-4 text-center">Face Matching Game</h1>
      <div className="grid grid-cols-3 gap-4 mb-4">
        {cards.map((card: any, index: number) => (
          <div
            key={index}
            onClick={() => handleClick(index)}
            aria-label={`Select card with ${card.name}`}
            className={`relative p-4 bg-[#DBDBC8] rounded-lg shadow-md cursor-pointer transition-all duration-300 h-32 hover:bg-[#b1b199] ${
              flippedCards.includes(index) || matchedPairs.includes(card.name)
                ? "bg-white"
                : ""
            }`}
          >
            {flippedCards.includes(index) || matchedPairs.includes(card.name) ? (
              <img
                src={card.image}
                alt={card.name}
                className="w-full h-20 object-cover rounded-lg"
                role="img"
                aria-label={`Face of ${card.name}`}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg text-black">
                <span>{card.name}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {feedbackMessage && (
        <div className="text-center text-lg text-black mt-4">
          <p>{feedbackMessage}</p>
        </div>
      )}

      {gameOver && (
        <div className="text-center mt-6">
          <h2 className="text-xl font-semibold text-black">
            Congratulations! You've completed the game!
          </h2>
          <button
            onClick={resetGame}
            className="mt-4 bg-[#DBDBC8] text-black hover:bg-[#b1b199] rounded-lg px-4 py-2"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default FaceMatchingGame;