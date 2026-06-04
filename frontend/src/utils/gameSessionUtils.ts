export const pieceSymbols: Record<string, string> = {
  p: "♟",
  n: "♞",
  b: "♝",
  r: "♜",
  q: "♛",
  P: "♟",
  N: "♞",
  B: "♝",
  R: "♜",
  Q: "♛",
};

export interface CapturedPiecesInfo {
  whiteCaptured: string[];
  blackCaptured: string[];
  whiteScore: number;
  blackScore: number;
  whiteLead: number;
  blackLead: number;
}

export const getCapturedPieces = (fen: string): CapturedPiecesInfo => {
  const defaultPieces = {
    white: { P: 8, N: 2, B: 2, R: 2, Q: 1 },
    black: { p: 8, n: 2, b: 2, r: 2, q: 1 },
  };

  const currentCounts = {
    P: 0,
    N: 0,
    B: 0,
    R: 0,
    Q: 0,
    p: 0,
    n: 0,
    b: 0,
    r: 0,
    q: 0,
  };

  const boardPart = fen.split(" ")[0];
  for (const char of boardPart) {
    if (char in currentCounts) {
      currentCounts[char as keyof typeof currentCounts]++;
    }
  }

  const whiteCaptured: string[] = [];
  const blackCaptured: string[] = [];

  // Pieces captured by White (Black pieces lost)
  const pCount = defaultPieces.black.p - currentCounts.p;
  for (let i = 0; i < pCount; i++) whiteCaptured.push("p");
  const nCount = defaultPieces.black.n - currentCounts.n;
  for (let i = 0; i < nCount; i++) whiteCaptured.push("n");
  const bCount = defaultPieces.black.b - currentCounts.b;
  for (let i = 0; i < bCount; i++) whiteCaptured.push("b");
  const rCount = defaultPieces.black.r - currentCounts.r;
  for (let i = 0; i < rCount; i++) whiteCaptured.push("r");
  const qCount = defaultPieces.black.q - currentCounts.q;
  for (let i = 0; i < qCount; i++) whiteCaptured.push("q");

  // Pieces captured by Black (White pieces lost)
  const PCount = defaultPieces.white.P - currentCounts.P;
  for (let i = 0; i < PCount; i++) blackCaptured.push("P");
  const NCount = defaultPieces.white.N - currentCounts.N;
  for (let i = 0; i < NCount; i++) blackCaptured.push("N");
  const BCount = defaultPieces.white.B - currentCounts.B;
  for (let i = 0; i < BCount; i++) blackCaptured.push("B");
  const RCount = defaultPieces.white.R - currentCounts.R;
  for (let i = 0; i < RCount; i++) blackCaptured.push("R");
  const QCount = defaultPieces.white.Q - currentCounts.Q;
  for (let i = 0; i < QCount; i++) blackCaptured.push("Q");

  const values: Record<string, number> = {
    P: 1,
    N: 3,
    B: 3,
    R: 5,
    Q: 9,
    p: 1,
    n: 3,
    b: 3,
    r: 5,
    q: 9,
  };

  const sortOrder: Record<string, number> = {
    q: 0,
    r: 1,
    b: 2,
    n: 3,
    p: 4,
    Q: 0,
    R: 1,
    B: 2,
    N: 3,
    P: 4,
  };

  whiteCaptured.sort((a, b) => sortOrder[a] - sortOrder[b]);
  blackCaptured.sort((a, b) => sortOrder[a] - sortOrder[b]);

  const whiteScore = whiteCaptured.reduce((sum, p) => sum + values[p], 0);
  const blackScore = blackCaptured.reduce((sum, p) => sum + values[p], 0);

  const whiteLead = Math.max(0, whiteScore - blackScore);
  const blackLead = Math.max(0, blackScore - whiteScore);

  return {
    whiteCaptured,
    blackCaptured,
    whiteScore,
    blackScore,
    whiteLead,
    blackLead,
  };
};
