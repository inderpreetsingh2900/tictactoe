#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_MOVES 100
#define INF 10000
// #define MAX_DEPTH 3  // Adjust as needed

int MAX_DEPTH = 8;
int nodes = 0;

// Global variables for players
char huPlayer = 'O';
char aiPlayer = 'X';

int n;
char board[MAX_MOVES];
int winCombos[2 * MAX_MOVES + 2][MAX_MOVES];

// Function prototypes
void readInput();
void fillWinCombos();
int emptySquares(int *availableMoves, char *boardState);
int checkWin(char *boardState, char player);
int minimax(char *boardState, char player, int alpha, int beta, int depth, int *bestMove);

int main()
{
    readInput();
    fillWinCombos();                                   // Fill winning combinations
    int bestMove = -1;                                 // Initialize bestMove variable
    minimax(board, aiPlayer, -INF, INF, 0, &bestMove); // Pass address of bestMove
    FILE *outputFile = fopen("output.txt", "w");
    if (outputFile == NULL)
    {
        printf("Error opening output file.\n");
        return 1;
    }
    fprintf(outputFile, "%d\n", bestMove);
    fprintf(outputFile, "%d\n", nodes);
    fprintf(outputFile, "%d\n", MAX_DEPTH);
    fclose(outputFile);
    return 0;
}

// Function to read board from input.txt
void readInput()
{
    FILE *inputFile = fopen("input.txt", "r");
    if (inputFile == NULL)
    {
        printf("Error opening input file.\n");
        exit(1);
    }

    fscanf(inputFile, "%d\n", &n);
    if (n == 4)
    {
        MAX_DEPTH = 6;
    }
    else if (n > 4 && n <= 7)
    {
        MAX_DEPTH = 5;
    }
    else if (n > 8 && n <= 10)
    {
        MAX_DEPTH = 4;
    }
    else if(n > 10 && n < 15){
        MAX_DEPTH = 2;
    }
    else{
        MAX_DEPTH = 1;
    }

    for (int i = 0; i < n * n; i++)
    {
        fscanf(inputFile, " %c,", &board[i]);
    }

    fclose(inputFile);
}

// Fill winning combinations
void fillWinCombos()
{
    int index = 0;

    // Rows
    for (int i = 0; i < n; i++)
    {
        for (int j = 0; j < n; j++)
        {
            winCombos[index][j] = i * n + j;
        }
        index++;
    }

    // Columns
    for (int i = 0; i < n; i++)
    {
        for (int j = 0; j < n; j++)
        {
            winCombos[index][j] = j * n + i;
        }
        index++;
    }

    // Diagonals
    for (int i = 0; i < n; i++)
    {
        winCombos[index][i] = i * n + i;               // Major diagonal
        winCombos[index + 1][i] = i * n + (n - 1 - i); // Minor diagonal
    }
}

// Check if the player has won
int checkWin(char *boardState, char player)
{
    for (int i = 0; i < 2 * n + 2; i++)
    {
        int win = 1;
        for (int j = 0; j < n; j++)
        {
            if (boardState[winCombos[i][j]] != player)
            {
                win = 0;
                break;
            }
        }
        if (win)
            return 1; // Return 1 if the player has won
    }
    return 0; // Return 0 if the player has not won
}

// Collect available moves
int emptySquares(int *availableMoves, char *boardState)
{
    int count = 0;
    for (int i = 0; i < n * n; i++)
    {
        if (boardState[i] != huPlayer && boardState[i] != aiPlayer)
        {
            availableMoves[count++] = i; // Store empty squares
        }
    }
    return count; // Return the count of available moves
}

int minimax(char *boardState, char player, int alpha, int beta, int depth, int *bestMove) {
    nodes++;
    int availableMoves[MAX_MOVES];
    int moveCount = emptySquares(availableMoves, boardState);

    // Check for terminal states
    if (checkWin(boardState, huPlayer)) return -10;  // Human player win
    if (checkWin(boardState, aiPlayer)) return 10;   // AI player win
    if (moveCount == 0) return 0;                    // Draw

    // Limit search depth
    if (depth >= MAX_DEPTH) {
        return 0; // If max depth reached, return neutral score
    }

    int bestScore = (player == aiPlayer) ? -INF : INF;

    // Sort available moves based on some basic criteria (like prefer corners or center)
    // This is a very simple ordering, but you can expand it based on your strategy
    for (int i = 0; i < moveCount; i++) {
        for (int j = i + 1; j < moveCount; j++) {
            // Simple ordering: prioritize center (if it exists) or corners
            int move1 = availableMoves[i];
            int move2 = availableMoves[j];
            if ((move1 == (n * n - 1) / 2) && (move2 != (n * n - 1) / 2)) {
                // Move1 is center; it should come first
                availableMoves[i] = move2;
                availableMoves[j] = move1;
            }
        }
    }

    for (int i = 0; i < moveCount; i++) {
        int move = availableMoves[i];

        // Create a copy of the board for this move
        char tempBoard[MAX_MOVES];
        memcpy(tempBoard, boardState, n * n * sizeof(char));

        tempBoard[move] = player; // Apply the move

        // Call minimax for the next depth with the opponent's player
        int score = minimax(tempBoard, (player == aiPlayer) ? huPlayer : aiPlayer, alpha, beta, depth + 1, bestMove);

        // Update best score based on the player
        if (player == aiPlayer) {
            if (score > bestScore) {
                bestScore = score; // Maximize AI score
                if (depth == 0) *bestMove = move; // Store best move at the top level
            }
            alpha = (alpha > bestScore) ? alpha : bestScore; // Update alpha
        } else {
            if (score < bestScore) {
                bestScore = score; // Minimize Human score
            }
            beta = (beta < bestScore) ? beta : bestScore; // Update beta
        }

        // Alpha-beta pruning
        if (beta <= alpha) break; // Stop if beta is less than or equal to alpha
    }

    // Return best score
    return bestScore; // Return the best score
}
