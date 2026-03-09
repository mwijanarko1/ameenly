"use client";

/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
  type TouchEvent,
  type MouseEvent,
  type KeyboardEvent,
} from "react";

type SwipeCardDeckProps = {
  children: ReactNode[];
  onSwipe?: (direction: "left" | "right", index: number) => void;
  onCardChange?: (index: number) => void;
};

type SwipeDirection = "left" | "right";

const SWIPE_THRESHOLD = 80;
const VELOCITY_THRESHOLD = 0.5;
const SPRING_DURATION = 400;
const SPRING_EASING = "cubic-bezier(0.32, 0.72, 0, 1)";
const SPRING_TRANSITION = `transform ${SPRING_DURATION}ms ${SPRING_EASING}`;

export function SwipeCardDeck({
  children,
  onSwipe,
  onCardChange,
}: SwipeCardDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(
    null
  );

  const startXRef = useRef(0);
  const startTimeRef = useRef(0);
  const currentXRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const totalCards = children.length;

  const goToCard = useCallback(
    (index: number) => {
      if (index >= 0 && index < totalCards && !isAnimating) {
        setCurrentIndex(index);
        onCardChange?.(index);
      }
    },
    [totalCards, isAnimating, onCardChange]
  );

  const animateSwipe = useCallback(
    (direction: SwipeDirection, targetIndex: number) => {
      setIsAnimating(true);
      setExitDirection(direction);
      onSwipe?.(direction, currentIndex);

      setTimeout(() => {
        setCurrentIndex(targetIndex);
        setExitDirection(null);
        setDragX(0);
        setIsAnimating(false);
        onCardChange?.(targetIndex);
      }, SPRING_DURATION);
    },
    [currentIndex, onSwipe, onCardChange]
  );

  const snapBack = useCallback(() => {
    setIsAnimating(true);
    setDragX(0);
    setTimeout(() => {
      setIsAnimating(false);
    }, SPRING_DURATION);
  }, []);

  const handleDragStart = useCallback(
    (clientX: number) => {
      if (isAnimating) return;
      setIsDragging(true);
      startXRef.current = clientX;
      startTimeRef.current = Date.now();
      currentXRef.current = 0;
    },
    [isAnimating]
  );

  const handleDragMove = useCallback(
    (clientX: number) => {
      if (!isDragging) return;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        const dx = clientX - startXRef.current;
        currentXRef.current = dx;
        setDragX(dx);
      });
    },
    [isDragging]
  );

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    const elapsed = Math.max(Date.now() - startTimeRef.current, 1);
    const velocity = Math.abs(currentXRef.current) / elapsed;

    if (
      Math.abs(currentXRef.current) > SWIPE_THRESHOLD ||
      velocity > VELOCITY_THRESHOLD
    ) {
      const direction = currentXRef.current > 0 ? "right" : "left";

      if (direction === "left" && currentIndex < totalCards - 1) {
        animateSwipe("left", Math.min(currentIndex + 1, totalCards - 1));
      } else if (direction === "right" && currentIndex > 0) {
        animateSwipe("right", Math.max(currentIndex - 1, 0));
      } else {
        snapBack();
      }
    } else {
      snapBack();
    }
  }, [
    isDragging,
    currentIndex,
    totalCards,
    animateSwipe,
    snapBack,
  ]);

  /* Touch events */
  const onTouchStart = useCallback(
    (e: TouchEvent) => handleDragStart(e.touches[0].clientX),
    [handleDragStart]
  );
  const onTouchMove = useCallback(
    (e: TouchEvent) => handleDragMove(e.touches[0].clientX),
    [handleDragMove]
  );
  const onTouchEnd = useCallback(() => handleDragEnd(), [handleDragEnd]);

  /* Mouse events */
  const onMouseDown = useCallback(
    (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t?.closest?.(".swipe-nav-arrow") || t?.closest?.(".swipe-dot")) {
        return;
      }
      e.preventDefault();
      handleDragStart(e.clientX);
    },
    [handleDragStart]
  );

  useEffect(() => {
    function onMouseMoveGlobal(e: globalThis.MouseEvent) {
      handleDragMove(e.clientX);
    }
    function onMouseUpGlobal() {
      handleDragEnd();
    }

    if (isDragging) {
      window.addEventListener("mousemove", onMouseMoveGlobal);
      window.addEventListener("mouseup", onMouseUpGlobal);
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMoveGlobal);
      window.removeEventListener("mouseup", onMouseUpGlobal);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  /* Cleanup raf on unmount */
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  /* Keyboard navigation */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && currentIndex > 0) {
        goToCard(currentIndex - 1);
      } else if (e.key === "ArrowRight" && currentIndex < totalCards - 1) {
        goToCard(currentIndex + 1);
      }
    },
    [currentIndex, totalCards, goToCard]
  );

  function getCardStyle(index: number) {
    const offset = index - currentIndex;
    const isActive = offset === 0;
    const nextCardProgress =
      exitDirection === "left"
        ? 1
        : dragX < 0
          ? Math.min(Math.abs(dragX) / 200, 1)
          : 0;
    const previousCardProgress =
      exitDirection === "right"
        ? 1
        : dragX > 0
          ? Math.min(dragX / 200, 1)
          : 0;

    if (offset === -1) {
      const translateX = -32 + previousCardProgress * 32;

      return {
        transform: `translateX(${translateX}px)`,
        transition: isDragging
          ? "none"
          : SPRING_TRANSITION,
        zIndex: 9,
        opacity: previousCardProgress === 0 ? 0 : 0.7 + previousCardProgress * 0.3,
        pointerEvents: "none" as const,
      };
    }

    if (isActive) {
      const rotation = (dragX / 20) * (isDragging ? 1 : 0);
      const exitX =
        exitDirection === "left"
          ? -window.innerWidth * 1.5
          : exitDirection === "right"
            ? window.innerWidth * 1.5
            : 0;
      const x = exitDirection ? exitX : dragX;
      const exitRotation = exitDirection === "left" ? -15 : exitDirection === "right" ? 15 : 0;
      const r = exitDirection ? exitRotation : rotation;

      return {
        transform: `translateX(${x}px) rotate(${r}deg)`,
        transition:
          isAnimating && !isDragging
            ? SPRING_TRANSITION
            : "none",
        zIndex: 10,
        opacity: 1,
      };
    }

    if (offset === 1) {
      const scale = 0.92 + nextCardProgress * 0.08;
      const translateY = 20 - nextCardProgress * 20;

      return {
        transform: `scale(${scale}) translateY(${translateY}px)`,
        transition: isDragging
          ? "none"
          : SPRING_TRANSITION,
        zIndex: 5,
        opacity: 0.7 + nextCardProgress * 0.3,
      };
    }

    if (offset === 2) {
      return {
        transform: "scale(0.84) translateY(40px)",
        transition: SPRING_TRANSITION,
        zIndex: 1,
        opacity: 0.4,
      };
    }

    /* Cards not visible yet */
    if (offset > 2) {
      return {
        transform: "scale(0.8) translateY(60px)",
        zIndex: 0,
        opacity: 0,
        pointerEvents: "none" as const,
      };
    }

    /* Cards already swiped */
    return {
      transform: "scale(0.8) translateX(-200%)",
      zIndex: 0,
      opacity: 0,
      pointerEvents: "none" as const,
    };
  }

  /* Only render nearby cards for performance */
  const visibleRange = {
    start: Math.max(currentIndex - 1, 0),
    end: Math.min(currentIndex + 3, totalCards),
  };

  return (
    <div
      ref={containerRef}
      className="swipe-deck-container"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Swipeable dua cards"
      aria-roledescription="carousel"
    >
      <div className="swipe-deck-stack">
        {Array.from(
          { length: visibleRange.end - visibleRange.start },
          (_, i) => {
            const actualIndex = visibleRange.end - 1 - i;
            return (
              <div
                key={actualIndex}
                className="swipe-card"
                style={getCardStyle(actualIndex)}
                aria-hidden={actualIndex !== currentIndex}
                aria-label={`Card ${actualIndex + 1} of ${totalCards}`}
              >
                {children[actualIndex]}
              </div>
            );
          }
        )}
      </div>

      {/* Dot indicators */}
      <div className="swipe-dots" role="tablist" aria-label="Card navigation">
        {Array.from({ length: Math.min(totalCards, 12) }, (_, i) => {
          const dotIndex =
            totalCards <= 12
              ? i
              : Math.round((i / 11) * (totalCards - 1));
          const activeDotIndex =
            totalCards <= 12
              ? currentIndex
              : Math.round((currentIndex * 11) / Math.max(totalCards - 1, 1));
          const isActive = i === activeDotIndex;
          return (
            <button
              key={dotIndex}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`Go to card ${dotIndex + 1}`}
              className={`swipe-dot ${isActive ? "active" : ""}`}
              onClick={() => goToCard(dotIndex)}
            />
          );
        })}
      </div>

      {/* Desktop navigation arrows */}
      <div className="swipe-nav-arrows">
        <button
          type="button"
          className="swipe-nav-arrow prev"
          onClick={() => goToCard(currentIndex - 1)}
          disabled={currentIndex === 0}
          aria-label="Previous card"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button
          type="button"
          className="swipe-nav-arrow next"
          onClick={() => goToCard(currentIndex + 1)}
          disabled={currentIndex === totalCards - 1}
          aria-label="Next card"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 6 15 12 9 18" />
          </svg>
        </button>
      </div>

      <p className="swipe-counter">
        {currentIndex + 1} / {totalCards}
      </p>
    </div>
  );
}
