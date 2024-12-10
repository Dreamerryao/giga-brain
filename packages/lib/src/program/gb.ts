/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/gb.json`.
 */
export type Gb = {
  address: 'CzwhX7PRyfdk8xGw2Wo4G8e7JtwQcatd42Do7AW5Fk2c';
  metadata: {
    name: 'gb';
    version: '0.1.0';
    spec: '0.1.0';
    description: 'Created with Anchor';
  };
  docs: ['Main program module for the GB protocol'];
  instructions: [
    {
      name: 'adminClaimTimeout';
      docs: ['Allows admin to claim funds after timeout for SOL-based puzzles'];
      discriminator: [74, 162, 52, 10, 187, 59, 206, 131];
      accounts: [
        {
          name: 'game';
          docs: ['The global game configuration account'];
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [103, 97, 109, 101];
              },
            ];
          };
        },
        {
          name: 'puzzle';
          docs: ['The puzzle account being claimed'];
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 117, 122, 122, 108, 101];
              },
              {
                kind: 'account';
                path: 'creator';
              },
              {
                kind: 'arg';
                path: 'puzzleNonce';
              },
            ];
          };
        },
        {
          name: 'creator';
          docs: ['The creator of the puzzle'];
          writable: true;
        },
        {
          name: 'escrow';
          docs: ['The escrow account holding the puzzle funds'];
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  112,
                  117,
                  122,
                  122,
                  108,
                  101,
                  95,
                  101,
                  115,
                  99,
                  114,
                  111,
                  119,
                ];
              },
              {
                kind: 'account';
                path: 'creator';
              },
              {
                kind: 'arg';
                path: 'puzzleNonce';
              },
            ];
          };
        },
        {
          name: 'admin';
          docs: ['The admin claiming the timeout funds'];
          writable: true;
          signer: true;
          relations: ['game'];
        },
        {
          name: 'systemProgram';
          docs: ['The System Program'];
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'puzzleNonce';
          type: 'u64';
        },
      ];
    },
    {
      name: 'adminClaimTimeoutToken';
      docs: [
        'Allows admin to claim funds after timeout for token-based puzzles',
      ];
      discriminator: [65, 185, 240, 164, 191, 68, 150, 50];
      accounts: [
        {
          name: 'game';
          docs: ['The global game configuration account'];
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [103, 97, 109, 101];
              },
            ];
          };
        },
        {
          name: 'puzzle';
          docs: ['The puzzle account being claimed'];
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 117, 122, 122, 108, 101];
              },
              {
                kind: 'account';
                path: 'creator';
              },
              {
                kind: 'arg';
                path: 'puzzleNonce';
              },
            ];
          };
        },
        {
          name: 'puzzleCurrency';
          docs: ['The configuration for the puzzle currency'];
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  112,
                  117,
                  122,
                  122,
                  108,
                  101,
                  95,
                  99,
                  117,
                  114,
                  114,
                  101,
                  110,
                  99,
                  121,
                ];
              },
              {
                kind: 'account';
                path: 'mint';
              },
            ];
          };
        },
        {
          name: 'mint';
          docs: ['The mint of the token being claimed'];
        },
        {
          name: 'creator';
          docs: ['The creator of the puzzle'];
          writable: true;
        },
        {
          name: 'creatorToken';
          docs: ["The creator's token account to receive funds"];
          writable: true;
        },
        {
          name: 'adminToken';
          docs: ["The admin's token account to receive service fees"];
          writable: true;
        },
        {
          name: 'escrowToken';
          docs: ['The escrow token account holding the puzzle funds'];
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  112,
                  117,
                  122,
                  122,
                  108,
                  101,
                  95,
                  101,
                  115,
                  99,
                  114,
                  111,
                  119,
                ];
              },
              {
                kind: 'account';
                path: 'creator';
              },
              {
                kind: 'arg';
                path: 'puzzleNonce';
              },
            ];
          };
        },
        {
          name: 'admin';
          docs: ['The admin claiming the timeout funds'];
          signer: true;
          relations: ['game'];
        },
        {
          name: 'tokenProgram';
          docs: ['The Token Program'];
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
        {
          name: 'systemProgram';
          docs: ['The System Program'];
          address: '11111111111111111111111111111111';
        },
        {
          name: 'rent';
          docs: ['The Rent Sysvar'];
          address: 'SysvarRent111111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'puzzleNonce';
          type: 'u64';
        },
      ];
    },
    {
      name: 'approveTransfer';
      docs: [
        'Approves a solution and initiates prize transfer for SOL-based puzzles',
      ];
      discriminator: [198, 217, 247, 150, 208, 60, 169, 244];
      accounts: [
        {
          name: 'game';
          docs: ['The global game configuration account'];
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [103, 97, 109, 101];
              },
            ];
          };
        },
        {
          name: 'puzzle';
          docs: ['The puzzle account being approved for transfer'];
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 117, 122, 122, 108, 101];
              },
              {
                kind: 'account';
                path: 'creator';
              },
              {
                kind: 'arg';
                path: 'puzzleNonce';
              },
            ];
          };
        },
        {
          name: 'creator';
          docs: ['The creator of the puzzle'];
        },
        {
          name: 'escrow';
          docs: ['The escrow account holding the puzzle funds'];
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  112,
                  117,
                  122,
                  122,
                  108,
                  101,
                  95,
                  101,
                  115,
                  99,
                  114,
                  111,
                  119,
                ];
              },
              {
                kind: 'account';
                path: 'creator';
              },
              {
                kind: 'arg';
                path: 'puzzleNonce';
              },
            ];
          };
        },
        {
          name: 'admin';
          docs: ['The admin account that will receive service fees'];
          writable: true;
          relations: ['game'];
        },
        {
          name: 'puzzlesVerifier';
          docs: ['The verifier authorized to approve solutions'];
          signer: true;
          relations: ['game'];
        },
        {
          name: 'systemProgram';
          docs: ['The System Program'];
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'puzzleNonce';
          type: 'u64';
        },
        {
          name: 'responseHash';
          type: {
            array: ['u8', 32];
          };
        },
      ];
    },
    {
      name: 'approveTransferToken';
      docs: [
        'Approves a solution and initiates prize transfer for token-based puzzles',
      ];
      discriminator: [13, 77, 224, 20, 120, 129, 173, 184];
      accounts: [
        {
          name: 'game';
          docs: ['The global game configuration account'];
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [103, 97, 109, 101];
              },
            ];
          };
        },
        {
          name: 'puzzle';
          docs: ['The puzzle account being approved for transfer'];
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 117, 122, 122, 108, 101];
              },
              {
                kind: 'account';
                path: 'creator';
              },
              {
                kind: 'arg';
                path: 'puzzleNonce';
              },
            ];
          };
        },
        {
          name: 'creator';
          docs: ['The creator of the puzzle'];
        },
        {
          name: 'mint';
          docs: ['The mint of the token being used for prizes'];
        },
        {
          name: 'puzzleCurrency';
          docs: ['The configuration for the puzzle currency'];
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  112,
                  117,
                  122,
                  122,
                  108,
                  101,
                  95,
                  99,
                  117,
                  114,
                  114,
                  101,
                  110,
                  99,
                  121,
                ];
              },
              {
                kind: 'account';
                path: 'mint';
              },
            ];
          };
        },
        {
          name: 'escrowToken';
          docs: ['The escrow token account holding the prize funds'];
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  112,
                  117,
                  122,
                  122,
                  108,
                  101,
                  95,
                  101,
                  115,
                  99,
                  114,
                  111,
                  119,
                ];
              },
              {
                kind: 'account';
                path: 'creator';
              },
              {
                kind: 'arg';
                path: 'puzzleNonce';
              },
            ];
          };
        },
        {
          name: 'adminToken';
          docs: ["The admin's token account to receive service fees"];
          writable: true;
        },
        {
          name: 'admin';
          docs: ['The admin account'];
          relations: ['game'];
        },
        {
          name: 'tokenProgram';
          docs: ['The Token Program'];
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
        {
          name: 'puzzlesVerifier';
          docs: ['The verifier authorized to approve solutions'];
          signer: true;
          relations: ['game'];
        },
        {
          name: 'systemProgram';
          docs: ['The System Program'];
          address: '11111111111111111111111111111111';
        },
        {
          name: 'rent';
          docs: ['The Rent Sysvar'];
          address: 'SysvarRent111111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'puzzleNonce';
          type: 'u64';
        },
        {
          name: 'responseHash';
          type: {
            array: ['u8', 32];
          };
        },
      ];
    },
    {
      name: 'claimPrize';
      docs: ['Claims the prize for a solved SOL-based puzzle'];
      discriminator: [157, 233, 139, 121, 246, 62, 234, 235];
      accounts: [
        {
          name: 'game';
          docs: ['The global game configuration account'];
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [103, 97, 109, 101];
              },
            ];
          };
        },
        {
          name: 'puzzle';
          docs: ['The puzzle account containing prize information'];
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 117, 122, 122, 108, 101];
              },
              {
                kind: 'account';
                path: 'creator';
              },
              {
                kind: 'arg';
                path: 'puzzleNonce';
              },
            ];
          };
        },
        {
          name: 'solver';
          docs: [
            'The account claiming the prize (must be the verified solver)',
          ];
          writable: true;
          signer: true;
        },
        {
          name: 'creator';
          docs: ['The creator of the puzzle'];
        },
        {
          name: 'escrow';
          docs: ['The escrow account holding the prize funds'];
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  112,
                  117,
                  122,
                  122,
                  108,
                  101,
                  95,
                  101,
                  115,
                  99,
                  114,
                  111,
                  119,
                ];
              },
              {
                kind: 'account';
                path: 'creator';
              },
              {
                kind: 'arg';
                path: 'puzzleNonce';
              },
            ];
          };
        },
        {
          name: 'systemProgram';
          docs: ['The System Program'];
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'puzzleNonce';
          type: 'u64';
        },
      ];
    },
    {
      name: 'claimPrizeToken';
      docs: ['Claims the prize for a solved token-based puzzle'];
      discriminator: [172, 182, 11, 103, 227, 99, 4, 205];
      accounts: [
        {
          name: 'game';
          docs: ['The global game configuration account'];
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [103, 97, 109, 101];
              },
            ];
          };
        },
        {
          name: 'puzzle';
          docs: ['The puzzle account containing prize information'];
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 117, 122, 122, 108, 101];
              },
              {
                kind: 'account';
                path: 'creator';
              },
              {
                kind: 'arg';
                path: 'puzzleNonce';
              },
            ];
          };
        },
        {
          name: 'puzzleCurrency';
          docs: ['The configuration for the puzzle currency'];
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  112,
                  117,
                  122,
                  122,
                  108,
                  101,
                  95,
                  99,
                  117,
                  114,
                  114,
                  101,
                  110,
                  99,
                  121,
                ];
              },
              {
                kind: 'account';
                path: 'mint';
              },
            ];
          };
        },
        {
          name: 'mint';
          docs: ['The mint of the token being claimed'];
        },
        {
          name: 'solverToken';
          docs: ['The token account that will receive the prize'];
          writable: true;
        },
        {
          name: 'creator';
          docs: ['The creator of the puzzle'];
        },
        {
          name: 'escrowToken';
          docs: ['The escrow token account holding the prize funds'];
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  112,
                  117,
                  122,
                  122,
                  108,
                  101,
                  95,
                  101,
                  115,
                  99,
                  114,
                  111,
                  119,
                ];
              },
              {
                kind: 'account';
                path: 'creator';
              },
              {
                kind: 'arg';
                path: 'puzzleNonce';
              },
            ];
          };
        },
        {
          name: 'tokenProgram';
          docs: ['The Token Program'];
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
        {
          name: 'solver';
          docs: [
            'The account claiming the prize (must be the verified solver)',
          ];
          writable: true;
          signer: true;
        },
        {
          name: 'systemProgram';
          docs: ['The System Program'];
          address: '11111111111111111111111111111111';
        },
        {
          name: 'rent';
          docs: ['The Rent Sysvar'];
          address: 'SysvarRent111111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'puzzleNonce';
          type: 'u64';
        },
      ];
    },
    {
      name: 'createPuzzle';
      docs: [
        'Creates a new puzzle with native SOL as currency',
        '',
        '# Arguments',
        '* `puzzle_nonce` - Unique identifier for the puzzle',
        '* `prompt_hash` - Hash of the puzzle prompt',
        '* `prize_amount` - Amount of SOL to be awarded',
        '* `name` - Name of the puzzle',
        '* `avatar_url` - URL to puzzle avatar',
        '* `model` - Model identifier',
        '* `metadata_hash` - Hash of additional puzzle metadata',
        '* `max_attempts` - Maximum number of attempts allowed',
        '* `base_fee` - Initial fee for first attempt',
        '* `max_fee` - Maximum fee cap for attempts',
        '* `attempt_timeout_seconds` - Time window for regular attempts',
        '* `attempt_final_timeout_seconds` - Time window for final attempt resolution',
      ];
      discriminator: [91, 130, 248, 53, 212, 51, 227, 65];
      accounts: [
        {
          name: 'game';
          docs: ['The global game configuration account'];
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [103, 97, 109, 101];
              },
            ];
          };
        },
        {
          name: 'puzzle';
          docs: ['The puzzle account that will be initialized'];
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 117, 122, 122, 108, 101];
              },
              {
                kind: 'account';
                path: 'creator';
              },
              {
                kind: 'arg';
                path: 'puzzleNonce';
              },
            ];
          };
        },
        {
          name: 'puzzleCurrency';
          docs: ["Configuration for the puzzle's currency (SOL in this case)"];
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  112,
                  117,
                  122,
                  122,
                  108,
                  101,
                  95,
                  99,
                  117,
                  114,
                  114,
                  101,
                  110,
                  99,
                  121,
                ];
              },
              {
                kind: 'const';
                value: [
                  6,
                  155,
                  136,
                  87,
                  254,
                  171,
                  129,
                  132,
                  251,
                  104,
                  127,
                  99,
                  70,
                  24,
                  192,
                  53,
                  218,
                  196,
                  57,
                  220,
                  26,
                  235,
                  59,
                  85,
                  152,
                  160,
                  240,
                  0,
                  0,
                  0,
                  0,
                  1,
                ];
              },
            ];
          };
        },
        {
          name: 'creator';
          writable: true;
          signer: true;
        },
        {
          name: 'escrow';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  112,
                  117,
                  122,
                  122,
                  108,
                  101,
                  95,
                  101,
                  115,
                  99,
                  114,
                  111,
                  119,
                ];
              },
              {
                kind: 'account';
                path: 'creator';
              },
              {
                kind: 'arg';
                path: 'puzzleNonce';
              },
            ];
          };
        },
        {
          name: 'promptsVerifier';
          writable: true;
          signer: true;
          relations: ['game'];
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'puzzleNonce';
          type: 'u64';
        },
        {
          name: 'promptHash';
          type: {
            array: ['u8', 32];
          };
        },
        {
          name: 'prizeAmount';
          type: 'u64';
        },
        {
          name: 'name';
          type: 'string';
        },
        {
          name: 'avatarUrl';
          type: 'string';
        },
        {
          name: 'model';
          type: 'string';
        },
        {
          name: 'metadataHash';
          type: {
            array: ['u8', 32];
          };
        },
        {
          name: 'maxAttempts';
          type: 'u32';
        },
        {
          name: 'baseFee';
          type: 'u64';
        },
        {
          name: 'maxFee';
          type: 'u64';
        },
        {
          name: 'attemptTimeoutSeconds';
          type: 'u64';
        },
        {
          name: 'attemptFinalTimeoutSeconds';
          type: 'u64';
        },
      ];
    },
    {
      name: 'createPuzzleCurrencyConfig';
      docs: ['Creates a new puzzle currency configuration'];
      discriminator: [32, 54, 23, 201, 113, 232, 113, 220];
      accounts: [
        {
          name: 'puzzleCurrency';
          docs: [
            'PDA account that stores the currency configuration',
            "Seeds: ['puzzle-currency', mint_address]",
          ];
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  112,
                  117,
                  122,
                  122,
                  108,
                  101,
                  95,
                  99,
                  117,
                  114,
                  114,
                  101,
                  110,
                  99,
                  121,
                ];
              },
              {
                kind: 'account';
                path: 'mint';
              },
            ];
          };
        },
        {
          name: 'admin';
          docs: [
            'Admin account that pays for the initialization and must sign',
          ];
          writable: true;
          signer: true;
        },
        {
          name: 'mint';
          docs: ['The SPL token mint account this configuration is for'];
        },
        {
          name: 'systemProgram';
          docs: ['Required by Solana runtime'];
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'args';
          type: {
            defined: {
              name: 'puzzleCurrencyConfigArgs';
            };
          };
        },
      ];
    },
    {
      name: 'createPuzzleToken';
      docs: ['Creates a new puzzle with SPL tokens as currency'];
      discriminator: [19, 166, 41, 145, 129, 109, 63, 188];
      accounts: [
        {
          name: 'game';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [103, 97, 109, 101];
              },
            ];
          };
        },
        {
          name: 'puzzle';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 117, 122, 122, 108, 101];
              },
              {
                kind: 'account';
                path: 'creator';
              },
              {
                kind: 'arg';
                path: 'puzzleNonce';
              },
            ];
          };
        },
        {
          name: 'puzzleCurrency';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  112,
                  117,
                  122,
                  122,
                  108,
                  101,
                  95,
                  99,
                  117,
                  114,
                  114,
                  101,
                  110,
                  99,
                  121,
                ];
              },
              {
                kind: 'account';
                path: 'mint';
              },
            ];
          };
        },
        {
          name: 'mint';
        },
        {
          name: 'creator';
          writable: true;
          signer: true;
        },
        {
          name: 'creatorToken';
          writable: true;
        },
        {
          name: 'escrowToken';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  112,
                  117,
                  122,
                  122,
                  108,
                  101,
                  95,
                  101,
                  115,
                  99,
                  114,
                  111,
                  119,
                ];
              },
              {
                kind: 'account';
                path: 'creator';
              },
              {
                kind: 'arg';
                path: 'puzzleNonce';
              },
            ];
          };
        },
        {
          name: 'tokenProgram';
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
        {
          name: 'promptsVerifier';
          writable: true;
          signer: true;
          relations: ['game'];
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
        {
          name: 'rent';
          address: 'SysvarRent111111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'puzzleNonce';
          type: 'u64';
        },
        {
          name: 'promptHash';
          type: {
            array: ['u8', 32];
          };
        },
        {
          name: 'prizeAmount';
          type: 'u64';
        },
        {
          name: 'name';
          type: 'string';
        },
        {
          name: 'avatarUrl';
          type: 'string';
        },
        {
          name: 'model';
          type: 'string';
        },
        {
          name: 'metadataHash';
          type: {
            array: ['u8', 32];
          };
        },
        {
          name: 'maxAttempts';
          type: 'u32';
        },
        {
          name: 'baseFee';
          type: 'u64';
        },
        {
          name: 'maxFee';
          type: 'u64';
        },
        {
          name: 'attemptTimeoutSeconds';
          type: 'u64';
        },
        {
          name: 'attemptFinalTimeoutSeconds';
          type: 'u64';
        },
      ];
    },
    {
      name: 'creatorClaimTimeout';
      docs: [
        'Allows creator to claim funds after timeout for SOL-based puzzles',
      ];
      discriminator: [201, 61, 130, 79, 36, 182, 76, 25];
      accounts: [
        {
          name: 'game';
          docs: ['The global game configuration account'];
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [103, 97, 109, 101];
              },
            ];
          };
        },
        {
          name: 'puzzle';
          docs: ['The puzzle account being claimed'];
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 117, 122, 122, 108, 101];
              },
              {
                kind: 'account';
                path: 'creator';
              },
              {
                kind: 'arg';
                path: 'puzzleNonce';
              },
            ];
          };
        },
        {
          name: 'creator';
          docs: ['The creator claiming the timeout funds'];
          writable: true;
          signer: true;
        },
        {
          name: 'escrow';
          docs: ['The escrow account holding the puzzle funds'];
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  112,
                  117,
                  122,
                  122,
                  108,
                  101,
                  95,
                  101,
                  115,
                  99,
                  114,
                  111,
                  119,
                ];
              },
              {
                kind: 'account';
                path: 'creator';
              },
              {
                kind: 'arg';
                path: 'puzzleNonce';
              },
            ];
          };
        },
        {
          name: 'admin';
          docs: ['The admin account that will receive service fees'];
          writable: true;
          relations: ['game'];
        },
        {
          name: 'systemProgram';
          docs: ['The System Program'];
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'puzzleNonce';
          type: 'u64';
        },
      ];
    },
    {
      name: 'creatorClaimTimeoutToken';
      docs: [
        'Allows creator to claim funds after timeout for token-based puzzles',
      ];
      discriminator: [155, 9, 77, 84, 176, 115, 17, 178];
      accounts: [
        {
          name: 'game';
          docs: ['The global game configuration account'];
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [103, 97, 109, 101];
              },
            ];
          };
        },
        {
          name: 'puzzle';
          docs: ['The puzzle account being claimed'];
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 117, 122, 122, 108, 101];
              },
              {
                kind: 'account';
                path: 'creator';
              },
              {
                kind: 'arg';
                path: 'puzzleNonce';
              },
            ];
          };
        },
        {
          name: 'creator';
          docs: ['The creator claiming the timeout funds'];
          writable: true;
          signer: true;
        },
        {
          name: 'admin';
          docs: ['The admin account that will receive service fees'];
          relations: ['game'];
        },
        {
          name: 'creatorToken';
          docs: ["The creator's token account to receive funds"];
          writable: true;
        },
        {
          name: 'adminToken';
          docs: ["The admin's token account to receive service fees"];
          writable: true;
        },
        {
          name: 'escrowToken';
          docs: ['The escrow token account holding the puzzle funds'];
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  112,
                  117,
                  122,
                  122,
                  108,
                  101,
                  95,
                  101,
                  115,
                  99,
                  114,
                  111,
                  119,
                ];
              },
              {
                kind: 'account';
                path: 'creator';
              },
              {
                kind: 'arg';
                path: 'puzzleNonce';
              },
            ];
          };
        },
        {
          name: 'puzzleCurrency';
          docs: ['The configuration for the puzzle currency'];
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  112,
                  117,
                  122,
                  122,
                  108,
                  101,
                  95,
                  99,
                  117,
                  114,
                  114,
                  101,
                  110,
                  99,
                  121,
                ];
              },
              {
                kind: 'account';
                path: 'mint';
              },
            ];
          };
        },
        {
          name: 'mint';
          docs: ['The mint of the token being claimed'];
        },
        {
          name: 'tokenProgram';
          docs: ['The Token Program'];
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
        {
          name: 'systemProgram';
          docs: ['The System Program'];
          address: '11111111111111111111111111111111';
        },
        {
          name: 'rent';
          docs: ['The Rent Sysvar'];
          address: 'SysvarRent111111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'puzzleNonce';
          type: 'u64';
        },
      ];
    },
    {
      name: 'getCurrentFee';
      docs: ['Retrieves the current attempt fee for a puzzle'];
      discriminator: [142, 93, 192, 243, 25, 248, 76, 90];
      accounts: [
        {
          name: 'puzzle';
          docs: [
            'The puzzle account that stores attempt fee information',
            'Seeds: ["puzzle", creator, puzzle_nonce]',
          ];
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 117, 122, 122, 108, 101];
              },
              {
                kind: 'account';
                path: 'creator';
              },
              {
                kind: 'arg';
                path: 'puzzleNonce';
              },
            ];
          };
        },
        {
          name: 'creator';
          docs: ['The creator of the puzzle'];
        },
      ];
      args: [
        {
          name: 'puzzleNonce';
          type: 'u64';
        },
      ];
      returns: 'u64';
    },
    {
      name: 'initialize';
      docs: [
        'Initializes the game configuration with initial parameters',
        '',
        '# Arguments',
        '* `ctx` - The context of accounts required for initialization',
        '* `args` - Initial game configuration parameters',
      ];
      discriminator: [175, 175, 109, 31, 13, 152, 155, 237];
      accounts: [
        {
          name: 'game';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [103, 97, 109, 101];
              },
            ];
          };
        },
        {
          name: 'puzzlesVerifier';
        },
        {
          name: 'promptsVerifier';
        },
        {
          name: 'admin';
          writable: true;
          signer: true;
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'args';
          type: {
            defined: {
              name: 'gameConfigArgs';
            };
          };
        },
      ];
    },
    {
      name: 'recordAttempt';
      docs: ['Records an attempt for a SOL-based puzzle'];
      discriminator: [222, 110, 253, 15, 90, 43, 210, 13];
      accounts: [
        {
          name: 'puzzle';
          docs: ['The puzzle account being attempted'];
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 117, 122, 122, 108, 101];
              },
              {
                kind: 'account';
                path: 'creator';
              },
              {
                kind: 'arg';
                path: 'puzzleNonce';
              },
            ];
          };
        },
        {
          name: 'solver';
          docs: ['The account attempting to solve the puzzle'];
          writable: true;
          signer: true;
        },
        {
          name: 'escrow';
          docs: ['Escrow account that holds attempt fees'];
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  112,
                  117,
                  122,
                  122,
                  108,
                  101,
                  95,
                  101,
                  115,
                  99,
                  114,
                  111,
                  119,
                ];
              },
              {
                kind: 'account';
                path: 'creator';
              },
              {
                kind: 'arg';
                path: 'puzzleNonce';
              },
            ];
          };
        },
        {
          name: 'creator';
        },
        {
          name: 'promptsVerifier';
          writable: true;
          signer: true;
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'puzzleNonce';
          type: 'u64';
        },
        {
          name: 'promptHash';
          type: {
            array: ['u8', 32];
          };
        },
        {
          name: 'maxFee';
          type: 'u64';
        },
        {
          name: 'metadataHash';
          type: {
            array: ['u8', 32];
          };
        },
      ];
    },
    {
      name: 'recordAttemptToken';
      docs: ['Records an attempt for a token-based puzzle'];
      discriminator: [151, 72, 164, 86, 194, 151, 126, 182];
      accounts: [
        {
          name: 'puzzle';
          docs: ['The puzzle account being attempted'];
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 117, 122, 122, 108, 101];
              },
              {
                kind: 'account';
                path: 'creator';
              },
              {
                kind: 'arg';
                path: 'puzzleNonce';
              },
            ];
          };
        },
        {
          name: 'solver';
          docs: ['The account attempting to solve the puzzle'];
          writable: true;
          signer: true;
        },
        {
          name: 'creator';
          docs: ['The creator of the puzzle'];
        },
        {
          name: 'solverToken';
          docs: ['The token account of the solver containing the fee payment'];
          writable: true;
        },
        {
          name: 'escrowToken';
          docs: ['The escrow token account that holds attempt fees'];
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  112,
                  117,
                  122,
                  122,
                  108,
                  101,
                  95,
                  101,
                  115,
                  99,
                  114,
                  111,
                  119,
                ];
              },
              {
                kind: 'account';
                path: 'creator';
              },
              {
                kind: 'arg';
                path: 'puzzleNonce';
              },
            ];
          };
        },
        {
          name: 'puzzleCurrency';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  112,
                  117,
                  122,
                  122,
                  108,
                  101,
                  95,
                  99,
                  117,
                  114,
                  114,
                  101,
                  110,
                  99,
                  121,
                ];
              },
              {
                kind: 'account';
                path: 'mint';
              },
            ];
          };
        },
        {
          name: 'mint';
        },
        {
          name: 'tokenProgram';
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
        {
          name: 'promptsVerifier';
          writable: true;
          signer: true;
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
        {
          name: 'rent';
          address: 'SysvarRent111111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'puzzleNonce';
          type: 'u64';
        },
        {
          name: 'promptHash';
          type: {
            array: ['u8', 32];
          };
        },
        {
          name: 'maxFee';
          type: 'u64';
        },
        {
          name: 'metadataHash';
          type: {
            array: ['u8', 32];
          };
        },
      ];
    },
    {
      name: 'rejectTransfer';
      docs: ['Rejects an attempted solution'];
      discriminator: [250, 250, 180, 34, 151, 19, 110, 207];
      accounts: [
        {
          name: 'game';
          docs: [
            'The global game configuration account that stores the authorized puzzle verifier',
          ];
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [103, 97, 109, 101];
              },
            ];
          };
        },
        {
          name: 'puzzle';
          docs: [
            'The puzzle account being updated',
            "PDA derived from creator's address and puzzle nonce",
          ];
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 117, 122, 122, 108, 101];
              },
              {
                kind: 'account';
                path: 'creator';
              },
              {
                kind: 'arg';
                path: 'puzzleNonce';
              },
            ];
          };
        },
        {
          name: 'creator';
          docs: ['The original creator of the puzzle'];
        },
        {
          name: 'puzzlesVerifier';
          docs: [
            'The authorized verifier who can approve/reject puzzle attempts',
          ];
          signer: true;
          relations: ['game'];
        },
      ];
      args: [
        {
          name: 'puzzleNonce';
          type: 'u64';
        },
        {
          name: 'responseHash';
          type: {
            array: ['u8', 32];
          };
        },
      ];
    },
    {
      name: 'setGameConfig';
      docs: ['Updates the game configuration parameters'];
      discriminator: [219, 116, 201, 173, 246, 206, 170, 255];
      accounts: [
        {
          name: 'game';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [103, 97, 109, 101];
              },
            ];
          };
        },
        {
          name: 'puzzlesVerifier';
        },
        {
          name: 'promptsVerifier';
        },
        {
          name: 'admin';
          writable: true;
          signer: true;
          relations: ['game'];
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'args';
          type: {
            defined: {
              name: 'gameConfigArgs';
            };
          };
        },
      ];
    },
    {
      name: 'setPuzzleCurrencyConfig';
      docs: ['Updates an existing puzzle currency configuration'];
      discriminator: [185, 73, 53, 85, 119, 191, 69, 196];
      accounts: [
        {
          name: 'puzzleCurrency';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  112,
                  117,
                  122,
                  122,
                  108,
                  101,
                  95,
                  99,
                  117,
                  114,
                  114,
                  101,
                  110,
                  99,
                  121,
                ];
              },
              {
                kind: 'account';
                path: 'mint';
              },
            ];
          };
        },
        {
          name: 'mint';
        },
        {
          name: 'admin';
          writable: true;
          signer: true;
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'args';
          type: {
            defined: {
              name: 'puzzleCurrencyConfigArgs';
            };
          };
        },
      ];
    },
    {
      name: 'transferAdmin';
      docs: ['Transfers admin rights to a new account'];
      discriminator: [42, 242, 66, 106, 228, 10, 111, 156];
      accounts: [
        {
          name: 'game';
          docs: [
            'The global game state account',
            "This account holds the current admin's public key and other game configuration",
          ];
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [103, 97, 109, 101];
              },
            ];
          };
        },
        {
          name: 'admin';
          docs: ['The current admin who must sign this transaction'];
          signer: true;
          relations: ['game'];
        },
        {
          name: 'newAdmin';
          docs: [
            'The account that will become the new admin',
            'and to store its public key',
          ];
        },
      ];
      args: [];
    },
  ];
  accounts: [
    {
      name: 'game';
      discriminator: [27, 90, 166, 125, 74, 100, 121, 18];
    },
    {
      name: 'puzzle';
      discriminator: [6, 170, 88, 211, 218, 180, 90, 18];
    },
    {
      name: 'puzzleCurrency';
      discriminator: [118, 203, 247, 212, 41, 3, 255, 41];
    },
  ];
  events: [
    {
      name: 'puzzleAttemptRejected';
      discriminator: [27, 37, 199, 235, 96, 118, 131, 237];
    },
    {
      name: 'puzzleAttempted';
      discriminator: [218, 6, 120, 253, 10, 90, 244, 166];
    },
    {
      name: 'puzzleFinalTimerStarted';
      discriminator: [226, 115, 166, 75, 221, 151, 217, 50];
    },
    {
      name: 'puzzleSolved';
      discriminator: [173, 143, 124, 195, 155, 46, 3, 140];
    },
    {
      name: 'puzzleTimedOut';
      discriminator: [90, 237, 158, 0, 17, 211, 251, 237];
    },
  ];
  errors: [
    {
      code: 6000;
      name: 'insufficientFunds';
    },
    {
      code: 6001;
      name: 'insufficientPrize';
    },
    {
      code: 6002;
      name: 'maxFeeExceeded';
    },
    {
      code: 6003;
      name: 'puzzleNotActive';
    },
    {
      code: 6004;
      name: 'invalidPuzzleSolver';
    },
    {
      code: 6005;
      name: 'puzzleTimedOut';
    },
    {
      code: 6006;
      name: 'puzzleStillActive';
    },
    {
      code: 6007;
      name: 'noPuzzleAttempts';
    },
    {
      code: 6008;
      name: 'puzzleTransferNotApproved';
    },
    {
      code: 6009;
      name: 'invalidVerifier';
    },
    {
      code: 6010;
      name: 'invalidAdmin';
    },
    {
      code: 6011;
      name: 'invalidCreator';
    },
    {
      code: 6012;
      name: 'puzzleNotAttempted';
    },
    {
      code: 6013;
      name: 'invalidFeeCalculation';
    },
    {
      code: 6014;
      name: 'invalidSolver';
    },
    {
      code: 6015;
      name: 'puzzleNotTimedOut';
    },
    {
      code: 6016;
      name: 'puzzleStillInFinalTimer';
    },
    {
      code: 6017;
      name: 'invalidMint';
    },
    {
      code: 6018;
      name: 'invalidTokenOwner';
    },
    {
      code: 6019;
      name: 'invalidBaseFeeAndMaxFee';
    },
    {
      code: 6020;
      name: 'invalidMaxAttempts';
    },
    {
      code: 6021;
      name: 'invalidBaseFee';
    },
    {
      code: 6022;
      name: 'invalidMaxFee';
    },
    {
      code: 6023;
      name: 'invalidAttemptTimeoutSeconds';
    },
    {
      code: 6024;
      name: 'invalidAttemptFinalTimeoutSeconds';
    },
    {
      code: 6025;
      name: 'invalidServiceFeeBps';
    },
    {
      code: 6026;
      name: 'invalidEscrowTokenAccount';
    },
    {
      code: 6027;
      name: 'puzzleFinalTimerTimedOut';
    },
    {
      code: 6028;
      name: 'puzzleInAttemptedState';
    },
  ];
  types: [
    {
      name: 'game';
      docs: ['Represents the global game configuration'];
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'admin';
            docs: ['Authority that can update game parameters'];
            type: 'pubkey';
          },
          {
            name: 'puzzlesVerifier';
            docs: ['Authority that can verify puzzle solutions'];
            type: 'pubkey';
          },
          {
            name: 'promptsVerifier';
            docs: ['Authority that can verify agent system + user prompts'];
            type: 'pubkey';
          },
          {
            name: 'puzzleAttemptTimeoutSeconds';
            docs: ['Time window (in seconds) for regular puzzle attempts'];
            type: 'u64';
          },
          {
            name: 'puzzleAttemptFinalTimeoutSeconds';
            docs: [
              'Time window (in seconds) for final puzzle attempt resolution',
            ];
            type: 'u64';
          },
          {
            name: 'maxAttempts';
            docs: ['Maximum number of attempts allowed per puzzle'];
            type: 'u32';
          },
        ];
      };
    },
    {
      name: 'gameConfigArgs';
      docs: ['Configuration parameters for the game settings'];
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'puzzleAttemptTimeoutSeconds';
            docs: ['Time limit (in seconds) for regular puzzle attempts'];
            type: 'u64';
          },
          {
            name: 'puzzleAttemptFinalTimeoutSeconds';
            docs: ['Time limit (in seconds) for final puzzle attempts'];
            type: 'u64';
          },
          {
            name: 'maxAttempts';
            docs: ['Maximum number of attempts allowed per puzzle'];
            type: 'u32';
          },
        ];
      };
    },
    {
      name: 'puzzle';
      docs: ['Represents an individual puzzle instance'];
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'nonce';
            docs: ['Unique identifier for the puzzle'];
            type: 'u64';
          },
          {
            name: 'creator';
            docs: ['The account that created this puzzle'];
            type: 'pubkey';
          },
          {
            name: 'status';
            docs: ['Current status of the puzzle'];
            type: {
              defined: {
                name: 'puzzleStatus';
              };
            };
          },
          {
            name: 'initialPrize';
            docs: ['Initial prize amount'];
            type: 'u64';
          },
          {
            name: 'currencyMint';
            docs: ['Mint address of the currency used'];
            type: 'pubkey';
          },
          {
            name: 'currencyServiceFeeBps';
            docs: ['Service fee in basis points for this currency'];
            type: 'u16';
          },
          {
            name: 'currencyBaseFee';
            docs: ['Base fee for attempts in this currency'];
            type: 'u64';
          },
          {
            name: 'currencyMaxFee';
            docs: ['Maximum fee cap for attempts in this currency'];
            type: 'u64';
          },
          {
            name: 'maxAttempts';
            docs: ['Maximum number of attempts allowed'];
            type: 'u32';
          },
          {
            name: 'attemptTimeoutSeconds';
            docs: ['Time window for regular attempts'];
            type: 'u64';
          },
          {
            name: 'attemptFinalTimeoutSeconds';
            docs: ['Time window for final attempt resolution'];
            type: 'u64';
          },
          {
            name: 'totalAttemptsMade';
            docs: ['Total number of attempts made'];
            type: 'u64';
          },
          {
            name: 'promptHash';
            docs: ['Hash of the puzzle prompt'];
            type: {
              array: ['u8', 32];
            };
          },
          {
            name: 'metadataHash';
            docs: ['Hash of additional puzzle metadata'];
            type: {
              array: ['u8', 32];
            };
          },
          {
            name: 'finalTimerStartAt';
            docs: ['Timestamp when final timer started'];
            type: 'i64';
          },
        ];
      };
    },
    {
      name: 'puzzleAttemptRejected';
      docs: ['Event emitted when a puzzle attempt is rejected'];
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'puzzle';
            type: 'pubkey';
          },
          {
            name: 'timestamp';
            type: 'i64';
          },
        ];
      };
    },
    {
      name: 'puzzleAttempted';
      docs: ['Event emitted when a puzzle attempt is recorded'];
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'puzzle';
            docs: ['Public key of the puzzle being attempted'];
            type: 'pubkey';
          },
          {
            name: 'fee';
            docs: ['Fee paid for the attempt'];
            type: 'u64';
          },
          {
            name: 'timestamp';
            docs: ['Timestamp of the attempt'];
            type: 'i64';
          },
        ];
      };
    },
    {
      name: 'puzzleCurrency';
      docs: ['Configuration for a supported puzzle currency'];
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'mint';
            docs: ['The mint address of the token'];
            type: 'pubkey';
          },
          {
            name: 'serviceFeeBps';
            docs: ['Service fee in basis points (1/100th of a percent)'];
            type: 'u16';
          },
          {
            name: 'minimumInitialPrize';
            docs: ['Minimum amount required for initial puzzle prize'];
            type: 'u64';
          },
          {
            name: 'feeConfig';
            docs: ['Fee configuration for puzzle attempts'];
            type: {
              defined: {
                name: 'puzzleFeeConfig';
              };
            };
          },
        ];
      };
    },
    {
      name: 'puzzleCurrencyConfigArgs';
      docs: ['Configuration arguments for setting up a puzzle currency'];
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'mint';
            docs: [
              'The SPL token mint address for this currency configuration',
            ];
            type: 'pubkey';
          },
          {
            name: 'serviceFeeBps';
            docs: [
              'Service fee in basis points (1/100th of a percent). Max 10000 (100%)',
            ];
            type: 'u16';
          },
          {
            name: 'minimumInitialPrize';
            docs: ['Minimum amount required for initial prize pool creation'];
            type: 'u64';
          },
          {
            name: 'feeConfig';
            docs: ['Fee configuration structure for this currency'];
            type: {
              defined: {
                name: 'puzzleFeeConfig';
              };
            };
          },
        ];
      };
    },
    {
      name: 'puzzleFeeConfig';
      docs: ['Fee configuration for puzzle attempts'];
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'baseFee';
            docs: ['Base fee for the first attempt'];
            type: 'u64';
          },
          {
            name: 'maxFee';
            docs: ['Maximum fee cap for attempts'];
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'puzzleFinalTimerStarted';
      docs: [
        'Event emitted when the final timer starts after max attempts are reached',
      ];
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'puzzle';
            type: 'pubkey';
          },
          {
            name: 'timestamp';
            type: 'i64';
          },
        ];
      };
    },
    {
      name: 'puzzleSolved';
      docs: ['Event emitted when a puzzle is successfully solved'];
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'puzzle';
            docs: ['The public key of the solved puzzle'];
            type: 'pubkey';
          },
          {
            name: 'solvedAt';
            docs: ['Timestamp when the puzzle was solved'];
            type: 'i64';
          },
          {
            name: 'solverShare';
            docs: ['Amount awarded to the solver'];
            type: 'u64';
          },
          {
            name: 'serviceShare';
            docs: ['Amount taken as service fee'];
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'puzzleStatus';
      docs: ['Represents the different states a puzzle can be in'];
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'active';
            fields: [
              {
                name: 'lastResolvedAt';
                docs: ['Timestamp of last resolution'];
                type: 'i64';
              },
            ];
          },
          {
            name: 'attempted';
            fields: [
              {
                name: 'solver';
                docs: ['Account that made the attempt'];
                type: 'pubkey';
              },
              {
                name: 'promptHash';
                docs: ["Hash of the attempted solution's prompt"];
                type: {
                  array: ['u8', 32];
                };
              },
              {
                name: 'metadataHash';
                docs: ["Hash of the attempted solution's metadata"];
                type: {
                  array: ['u8', 32];
                };
              },
              {
                name: 'timestamp';
                docs: ['Timestamp of the attempt'];
                type: 'i64';
              },
            ];
          },
          {
            name: 'timedOut';
          },
          {
            name: 'approvedTransfer';
            fields: [
              {
                name: 'solver';
                docs: ['Account that solved the puzzle'];
                type: 'pubkey';
              },
              {
                name: 'solvedAt';
                docs: ['Timestamp when puzzle was solved'];
                type: 'i64';
              },
              {
                name: 'solverShare';
                docs: ['Amount to be transferred to solver'];
                type: 'u64';
              },
              {
                name: 'serviceShare';
                docs: ['Amount to be transferred as service fee'];
                type: 'u64';
              },
            ];
          },
          {
            name: 'completed';
          },
        ];
      };
    },
    {
      name: 'puzzleTimedOut';
      docs: ['Event emitted when a puzzle times out'];
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'puzzle';
            docs: ['The public key of the timed out puzzle'];
            type: 'pubkey';
          },
          {
            name: 'creatorShare';
            docs: ['Amount returned to the creator'];
            type: 'u64';
          },
          {
            name: 'serviceShare';
            docs: ['Amount taken as service fee'];
            type: 'u64';
          },
        ];
      };
    },
  ];
};
