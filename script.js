(() => {
  const fileInput = document.getElementById("file-input");
  const uploadArea = document.getElementById("upload-area");
  const uploadPrompt = document.getElementById("upload-prompt");
  const preview = document.getElementById("preview");
  const difficultySection = document.getElementById("difficulty");
  const startBtn = document.getElementById("start-btn");
  const changeImgBtn = document.getElementById("change-img-btn");
  const gameSection = document.getElementById("game");
  const boardEl = document.getElementById("board");
  const piecesEl = document.getElementById("pieces");
  const timerEl = document.getElementById("timer");
  const movesEl = document.getElementById("moves");
  const shuffleBtn = document.getElementById("shuffle-btn");
  const backBtn = document.getElementById("back-btn");
  const toggleRefBtn = document.getElementById("toggle-ref");
  const refPanel = document.getElementById("reference-panel");
  const refImg = document.getElementById("reference-img");
  const completeModal = document.getElementById("complete-modal");
  const completionStats = document.getElementById("completion-stats");
  const playAgainBtn = document.getElementById("play-again-btn");
  const newPuzzleBtn = document.getElementById("new-puzzle-btn");

  let image = null;
  let cols = 4;
  let rows = 4;
  let pieces = [];
  let cells = [];
  let moveCount = 0;
  let timerInterval = null;
  let seconds = 0;
  let solvedCount = 0;
  let totalPieces = 0;
  let pieceSize = 80;

  // --- Upload ---
  uploadArea.addEventListener("click", () => fileInput.click());
  uploadArea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInput.click();
    }
  });

  uploadArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadArea.classList.add("drag-over");
  });

  uploadArea.addEventListener("dragleave", () => {
    uploadArea.classList.remove("drag-over");
  });

  uploadArea.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadArea.classList.remove("drag-over");
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      loadImage(file);
    }
  });

  fileInput.addEventListener("change", () => {
    if (fileInput.files[0]) {
      loadImage(fileInput.files[0]);
    }
  });

  function loadImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      image = new Image();
      image.onload = () => {
        preview.src = e.target.result;
        preview.hidden = false;
        uploadPrompt.hidden = true;
        difficultySection.hidden = false;

        refImg.src = e.target.result;
      };
      image.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  changeImgBtn.addEventListener("click", () => {
    fileInput.value = "";
    preview.hidden = true;
    uploadPrompt.hidden = false;
    difficultySection.hidden = true;
    image = null;
  });

  // --- Difficulty ---
  document.querySelectorAll(".difficulty-buttons button").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".difficulty-buttons button")
        .forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      cols = parseInt(btn.dataset.cols);
      rows = parseInt(btn.dataset.rows);
    });
  });

  // --- Start game ---
  startBtn.addEventListener("click", startGame);
  shuffleBtn.addEventListener("click", shufflePieces);
  backBtn.addEventListener("click", backToSetup);
  toggleRefBtn.addEventListener("click", () => {
    refPanel.classList.toggle("visible");
    toggleRefBtn.textContent = refPanel.classList.contains("visible")
      ? "Ocultar referencia"
      : "Mostrar referencia";
  });
  playAgainBtn.addEventListener("click", () => {
    completeModal.hidden = true;
    resetGame();
    startGame();
  });
  newPuzzleBtn.addEventListener("click", () => {
    completeModal.hidden = true;
    backToSetup();
  });

  function startGame() {
    setup.hidden = true;
    gameSection.hidden = false;
    createPuzzle();
    shufflePieces();
    startTimer();
  }

  function backToSetup() {
    stopTimer();
    gameSection.hidden = true;
    setup.hidden = false;
    resetGame();
  }

  function resetGame() {
    pieces = [];
    cells = [];
    moveCount = 0;
    seconds = 0;
    solvedCount = 0;
    timerEl.textContent = "00:00";
    movesEl.textContent = "0 movimientos";
    boardEl.innerHTML = "";
    piecesEl.innerHTML = "";
  }

  // --- Puzzle creation ---
  function createPuzzle() {
    totalPieces = cols * rows;
    boardEl.innerHTML = "";
    piecesEl.innerHTML = "";

    // Calculate piece size to fit in viewport
    const maxBoardWidth = Math.min(480, window.innerWidth - 80);
    pieceSize = Math.floor(maxBoardWidth / cols);

    boardEl.style.gridTemplateColumns = `repeat(${cols}, ${pieceSize}px)`;
    boardEl.style.gridTemplateRows = `repeat(${rows}, ${pieceSize}px)`;

    // Create canvas and draw image
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0);

    const cellW = image.naturalWidth / cols;
    const cellH = image.naturalHeight / rows;

    // Create cells
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.dataset.row = r;
        cell.dataset.col = c;
        boardEl.appendChild(cell);
        cells.push({ el: cell, row: r, col: c, piece: null });

        cell.addEventListener("dragover", onCellDragOver);
        cell.addEventListener("dragleave", onCellDragLeave);
        cell.addEventListener("drop", onCellDrop);
      }
    }

    // Create pieces
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const pieceCanvas = document.createElement("canvas");
        pieceCanvas.width = pieceSize;
        pieceCanvas.height = pieceSize;
        const pCtx = pieceCanvas.getContext("2d");

        // Draw the piece from the original image
        pCtx.drawImage(
          canvas,
          c * cellW,
          r * cellH,
          cellW,
          cellH,
          0,
          0,
          pieceSize,
          pieceSize
        );

        const pieceImg = document.createElement("img");
        pieceImg.src = pieceCanvas.toDataURL();
        pieceImg.className = "piece";
        pieceImg.draggable = true;
        pieceImg.dataset.correctRow = r;
        pieceImg.dataset.correctCol = c;
        pieceImg.style.width = pieceSize + "px";
        pieceImg.style.height = pieceSize + "px";
        pieceImg.alt = `Pieza ${r * cols + c + 1}`;

        pieceImg.addEventListener("dragstart", onPieceDragStart);
        pieceImg.addEventListener("dragend", onPieceDragEnd);

        // Touch support
        pieceImg.addEventListener("touchstart", onTouchStart, { passive: false });
        pieceImg.addEventListener("touchmove", onTouchMove, { passive: false });
        pieceImg.addEventListener("touchend", onTouchEnd);

        piecesEl.appendChild(pieceImg);
        pieces.push({
          el: pieceImg,
          correctRow: r,
          correctCol: c,
          placedIn: null,
        });
      }
    }
  }

  // --- Drag and Drop ---
  let draggedPiece = null;

  function onPieceDragStart(e) {
    draggedPiece = pieces.find((p) => p.el === e.target);
    e.target.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
  }

  function onPieceDragEnd(e) {
    e.target.classList.remove("dragging");
    cells.forEach((cell) => cell.el.classList.remove("highlight"));
    draggedPiece = null;
  }

  function onCellDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const cellEl = e.currentTarget;
    cellEl.classList.add("highlight");
  }

  function onCellDragLeave(e) {
    e.currentTarget.classList.remove("highlight");
  }

  function onCellDrop(e) {
    e.preventDefault();
    const cellEl = e.currentTarget;
    cellEl.classList.remove("highlight");

    if (!draggedPiece) return;

    const targetCell = cells.find(
      (c) => c.el === cellEl
    );

    // If cell already has a piece, return that piece to the tray
    if (targetCell.piece) {
      returnPieceToTray(targetCell.piece);
      targetCell.piece.placedIn = null;
      targetCell.piece = null;
      targetCell.el.classList.remove("occupied");
    }

    // If piece was in another cell, clear that cell
    if (draggedPiece.placedIn) {
      const oldCell = cells.find((c) => c.piece === draggedPiece);
      if (oldCell) {
        oldCell.piece = null;
        oldCell.el.classList.remove("occupied");
      }
    } else {
      // Removing from tray
      solvedCount--;
    }

    // Place piece in new cell
    placePieceInCell(draggedPiece, targetCell);
  }

  function placePieceInCell(piece, cell) {
    cell.piece = piece;
    cell.el.classList.add("occupied");
    cell.el.appendChild(piece.el);
    piece.placedIn = cell;
    piece.el.classList.add("placed");

    moveCount++;
    movesEl.textContent =
      moveCount === 1 ? "1 movimiento" : `${moveCount} movimientos`;

    checkCompletion();
  }

  function returnPieceToTray(piece) {
    piecesEl.appendChild(piece.el);
    piece.el.classList.remove("placed");
  }

  // Also allow dropping pieces back to the tray
  piecesEl.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  piecesEl.addEventListener("drop", (e) => {
    e.preventDefault();
    if (!draggedPiece) return;

    if (draggedPiece.placedIn) {
      const oldCell = cells.find((c) => c.piece === draggedPiece);
      if (oldCell) {
        oldCell.piece = null;
        oldCell.el.classList.remove("occupied");
      }
      returnPieceToTray(draggedPiece);
      draggedPiece.placedIn = null;
      solvedCount--;
    }
  });

  // --- Touch support ---
  let touchPiece = null;
  let touchClone = null;
  let touchOffset = { x: 0, y: 0 };

  function onTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const pieceEl = e.currentTarget;

    touchPiece = pieces.find((p) => p.el === pieceEl);
    if (!touchPiece) return;

    const rect = pieceEl.getBoundingClientRect();
    touchOffset.x = touch.clientX - rect.left;
    touchOffset.y = touch.clientY - rect.top;

    touchClone = pieceEl.cloneNode(true);
    touchClone.style.position = "fixed";
    touchClone.style.zIndex = "1000";
    touchClone.style.pointerEvents = "none";
    touchClone.style.opacity = "0.8";
    touchClone.style.left = touch.clientX - touchOffset.x + "px";
    touchClone.style.top = touch.clientY - touchOffset.y + "px";
    document.body.appendChild(touchClone);

    pieceEl.classList.add("dragging");
  }

  function onTouchMove(e) {
    e.preventDefault();
    if (!touchClone) return;

    const touch = e.touches[0];
    touchClone.style.left = touch.clientX - touchOffset.x + "px";
    touchClone.style.top = touch.clientY - touchOffset.y + "px";

    // Highlight cell under touch
    cells.forEach((cell) => {
      const rect = cell.el.getBoundingClientRect();
      if (
        touch.clientX >= rect.left &&
        touch.clientX <= rect.right &&
        touch.clientY >= rect.top &&
        touch.clientY <= rect.bottom
      ) {
        cell.el.classList.add("highlight");
      } else {
        cell.el.classList.remove("highlight");
      }
    });
  }

  function onTouchEnd(e) {
    if (!touchPiece || !touchClone) return;

    const touch = e.changedTouches[0];
    document.body.removeChild(touchClone);
    touchClone = null;

    touchPiece.el.classList.remove("dragging");

    // Find cell under touch
    const targetCell = cells.find((cell) => {
      const rect = cell.el.getBoundingClientRect();
      return (
        touch.clientX >= rect.left &&
        touch.clientX <= rect.right &&
        touch.clientY >= rect.top &&
        touch.clientY <= rect.bottom
      );
    });

    // Also check if dropped on tray
    const trayRect = piecesEl.getBoundingClientRect();
    const droppedOnTray =
      touch.clientX >= trayRect.left &&
      touch.clientX <= trayRect.right &&
      touch.clientY >= trayRect.top &&
      touch.clientY <= trayRect.bottom;

    cells.forEach((cell) => cell.el.classList.remove("highlight"));

    if (targetCell) {
      draggedPiece = touchPiece;
      onCellDrop({ preventDefault: () => {}, currentTarget: targetCell.el });
    } else if (droppedOnTray) {
      draggedPiece = touchPiece;
      piecesEl.dispatchEvent(
        new Event("drop", { bubbles: false })
      );
    }

    touchPiece = null;
  }

  // --- Shuffle ---
  function shufflePieces() {
    // Return all pieces to tray
    pieces.forEach((piece) => {
      if (piece.placedIn) {
        piece.placedIn.piece = null;
        piece.placedIn.el.classList.remove("occupied");
        piece.placedIn = null;
      }
      returnPieceToTray(piece);
      solvedCount = 0;
    });

    // Randomize order in tray
    const shuffled = [...piecesEl.children].sort(() => Math.random() - 0.5);
    shuffled.forEach((child) => piecesEl.appendChild(child));
  }

  // --- Timer ---
  function startTimer() {
    stopTimer();
    seconds = 0;
    timerEl.textContent = "00:00";
    timerInterval = setInterval(() => {
      seconds++;
      const m = String(Math.floor(seconds / 60)).padStart(2, "0");
      const s = String(seconds % 60).padStart(2, "0");
      timerEl.textContent = `${m}:${s}`;
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  // --- Completion check ---
  function checkCompletion() {
    const allCorrect = cells.every(
      (cell) =>
        cell.piece &&
        cell.piece.correctRow === cell.row &&
        cell.piece.correctCol === cell.col
    );

    if (allCorrect) {
      stopTimer();
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      completionStats.textContent = `${cols * rows} piezas · ${moveCount} movimientos · ${m > 0 ? m + " min " : ""}${s} seg`;
      completeModal.hidden = false;
    }
  }
})();
