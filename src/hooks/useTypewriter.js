import { useState, useEffect } from "react";

export const useTypewriter = (
  words,
  typingSpeed = 150,
  deletingSpeed = 75,
  pauseTime = 2000
) => {
  const [typedText, setTypedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(typingSpeed);

  useEffect(() => {
    const handleTyping = () => {
      const i = loopNum % words.length;
      const fullText = words[i];

      setTypedText(
        isDeleting
          ? fullText.substring(0, typedText.length - 1)
          : fullText.substring(0, typedText.length + 1)
      );

      setCurrentSpeed(isDeleting ? deletingSpeed : typingSpeed);

      if (!isDeleting && typedText === fullText) {
        setTimeout(() => setIsDeleting(true), pauseTime);
      } else if (isDeleting && typedText === "") {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    const timer = setTimeout(handleTyping, currentSpeed);
    return () => clearTimeout(timer);
  }, [
    typedText,
    isDeleting,
    loopNum,
    currentSpeed,
    words,
    typingSpeed,
    deletingSpeed,
    pauseTime,
  ]);

  return typedText;
};
