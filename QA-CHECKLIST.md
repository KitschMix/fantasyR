# QA Checklist

This checklist is for quick manual play QA plus automated score checks after changing cards, layout, or multiplayer flow.

## Run Before Testing

```powershell
C:\Users\T8G-2401-PC-001\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe --check script.js
C:\Users\T8G-2401-PC-001\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe tools\qa-score-check.js
```

## 1. Actual Play QA

| Area | Case | Expected result |
| --- | --- | --- |
| Start screen | Nickname is empty or 1 character | Game cannot start. Message asks for at least 2 characters. |
| Start screen | Original only | Original deck is used. Expansion cards are not in deck/dictionary. |
| Start screen | Expansion checked | Building, outsider, undead, and replaced expansion cards are included. Cursed items stay excluded. |
| Start screen | Difficulty normal/hard/very hard/random | AI profiles appear correctly, and names do not reveal hidden random difficulty. |
| Start screen | Beomrye appears | Name displays as `Gang Beomrye (Final Boss)` style in the configured Korean UI, and AI uses strongest difficulty. |
| Card dictionary | Open "all cards" | Cards use one fixed vertical card shape and one modal scrollbar. No clipped card art. |
| Card dictionary | Original/expansion switch | Count and included cards match the selected deck mode. |
| Turn flow | Draw from deck, draw from discard, discard from hand | Card motion plays and hand/discard/deck counts stay correct. |
| Turn flow | Discard pile reaches 10 | The 10-card count is highly visible and game-end trigger works. |
| End game | Opponent cards reveal | All enemy hands are visible on result screen. |
| End game | Required choices exist | Game does not finalize until required Island/Angel/wild/Necromancer/Genie/Leprechaun choices are confirmed. |
| End game | No required choices | End alert/result appears immediately. |
| End game | Retry and leave | Retry starts fresh; leave returns to first screen and does not auto-enter an old room. |
| Hall of fame | Player beats Beomrye | Hall of fame submission runs once and status appears. |
| Ranking | Player wins original | Original rank submits only if won. |
| Ranking | Player wins expansion | Expansion rank submits separately from original. |
| Ranking | Multiplayer | Online multiplayer score is not submitted to ranking. |
| Dialogue | Start/end | All opponents can speak at start and final result. |
| Dialogue | During turn | At most one character speaks at once; normal event speech is roughly 30%. |
| Dialogue | Waiting | During player turn, idle line can appear about every 10 seconds. Bubble space stays fixed. |

## 2. Multiplayer QA

| Area | Case | Expected result |
| --- | --- | --- |
| Lobby | Create room | Room code appears, copy button works, host badge appears. |
| Lobby | Join room | Seat list updates for both browsers. |
| Lobby | Not enough players | Start button explains why it cannot start. |
| Lobby | Enough players | Host can start; non-host cannot force start. |
| Sync | Host plays a turn | Other browser sees the same deck, discard, hand count, turn count, and current player. |
| Sync | Guest plays a turn | Host sees the same update. |
| Timer | 30 seconds expires | Current player's turn is skipped or unresolved end choice is passed according to current rules. |
| Reconnect | Refresh one browser | Same room, seat, hand, and turn state restore. |
| Leave | Leave room | User returns to first screen and local room memory is cleared. |

## 3. Score Calculation QA

Automated checks in `tools/qa-score-check.js` currently cover:

| Rule | Covered by |
| --- | --- |
| Smoke blanking without flame | `Smoke is blanked when no flame exists` |
| Smoke surviving with flame | `Smoke scores normally when a flame exists` |
| Great Flood blanking and Mountain exception | `Great Flood blanks Forest but not Mountain` |
| Island penalty removal | `Island clears the selected flood or flame penalty` |
| Rangers army penalty removal | `Rangers removes army from all penalties` |
| Warship flood army penalty removal | `Warship removes army from flood penalties` |
| Book of Changes suit change | `Book of Changes changes the selected card suit before scoring` |
| Shapeshifter copy | `Shapeshifter copies allowed deck card name and suit` |
| Mirage copy | `Mirage copies allowed deck card name and suit` |
| Doppelganger copy | `Doppelganger copies an in-hand card's strength and suit` |
| Expansion Great Flood building blanking | `Expansion Great Flood blanks building cards` |
| Angel anti-blanking protection | `Angel protects the selected magic card from blanking` |
| Expansion Necromancer undead protection | `Expansion Necromancer protects undead from blanking` |

Manual score cases still worth checking after UI changes:

| Card | Manual check |
| --- | --- |
| Necromancer | End-game selected discard card appears in hand scoring before final result. |
| Leprechaun | Can only execute after game end; adds the proper extra drawn card after confirm. |
| Genie | Cannot execute before Leprechaun when both exist; selected remaining deck card counts in preview score before final confirmation. |
| Optional actions | `No selection` is accepted for optional cards but blocked for required Genie/Leprechaun flow. |
| Penalty removal display | Penalty text strike-through appears when cleared, is thin enough to read, and tooltip appears immediately on card hover. |
| Partial penalty removal display | Only `Army`/`군대` is struck through when Rangers or Warship removes army from a penalty, and card hover explains the source. |
| Blanked cards display | Title strike-through appears on cards made invalid/blanked by rules like Smoke without flame or Wildfire/Great Flood effects. |
