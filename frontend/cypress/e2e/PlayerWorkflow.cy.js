// Path 2: Player full workflow
// Setup (register admin, create game, start game) is done via cy.request() so
// this test only exercises the player-facing UI and is independent of path1.
describe('Path 2: Player full workflow', () => {
  const timestamp = Date.now();
  const adminEmail = `admin_player_${timestamp}@example.com`;
  const adminPassword = 'Password123!';
  const playerName = `Player_${timestamp}`;
  const gameId = (timestamp % 900000) + 100000; // 6-digit unique id
  const API = 'http://localhost:5005';

  it('completes the full player workflow end-to-end', () => {

    // ── Step 1: Register admin via API ────────────────────────────────────
    cy.request('POST', `${API}/admin/auth/register`, {
      email: adminEmail,
      password: adminPassword,
      name: 'Test Admin',
    })
      .its('body.token')
      .as('adminToken');

    // ── Step 2: Create game with 1 judgement question via API ─────────────
    // duration: 30 so the timer does not expire during the test
    cy.get('@adminToken').then((token) => {
      cy.request({
        method: 'PUT',
        url: `${API}/admin/games`,
        headers: { Authorization: `Bearer ${token}` },
        body: {
          games: [{
            id: gameId,
            owner: adminEmail,
            name: `PlayerTest_${timestamp}`,
            questions: [{
              id: 1,
              questionText: 'Is Cypress awesome?',
              questionType: 'judgement',
              answers: ['True', 'False'],
              correctAnswers: ['True'],
              duration: 30,
              points: 5,
              media: null,
              mediaType: null,
            }],
          }],
        },
      });
    });

    // ── Step 3: Start game via API → capture sessionId ────────────────────
    cy.get('@adminToken').then((token) => {
      cy.request({
        method: 'POST',
        url: `${API}/admin/game/${gameId}/mutate`,
        headers: { Authorization: `Bearer ${token}` },
        body: { mutationType: 'START' },
      })
        .its('body.data.sessionId')
        .as('sessionId');
    });

    // ── Step 4: Player visits join page ───────────────────────────────────
    cy.get('@sessionId').then((sessionId) => {
      cy.visit(`/session/join?sessionId=${sessionId}`);
    });

    cy.get('input[placeholder="Enter your name"]').type(playerName);
    cy.contains('button', 'Join Game').click();

    // After joining, player is at /play/:playerId
    cy.url().should('match', /\/play\/\d+/);
    cy.url().then((url) => {
      cy.wrap(url.split('/play/')[1]).as('playerId');
    });

    // ── Step 5: Waiting lobby ─────────────────────────────────────────────
    // Game hasn't advanced yet — player should see the waiting animation
    cy.contains('Waiting for the host').should('be.visible');

    // ── Step 6: Admin advances to first question via API ──────────────────
    cy.get('@adminToken').then((token) => {
      cy.request({
        method: 'POST',
        url: `${API}/admin/game/${gameId}/mutate`,
        headers: { Authorization: `Bearer ${token}` },
        body: { mutationType: 'ADVANCE' },
      });
    });

    // ── Step 7: Question appears (wait for polling to pick up the change) ──
    cy.contains('Is Cypress awesome?', { timeout: 5000 }).should('be.visible');
    cy.contains('button', 'True').should('be.visible');
    cy.contains('button', 'False').should('be.visible');
    // Timer should be visible
    cy.contains(/^\d+s$/, { timeout: 3000 }).should('be.visible');

    // ── Step 8: Player selects an answer ──────────────────────────────────
    cy.contains('button', 'True').click();
    // Selected answer gets indigo highlight
    cy.contains('button', 'True').should('have.class', 'bg-indigo-500/30');

    // ── Step 9: Admin ends game via API ───────────────────────────────────
    cy.get('@adminToken').then((token) => {
      cy.request({
        method: 'POST',
        url: `${API}/admin/game/${gameId}/mutate`,
        headers: { Authorization: `Bearer ${token}` },
        body: { mutationType: 'END' },
      });
    });

    // ── Step 10: Player is redirected to result page ──────────────────────
    // PlayGame polls /question every 500ms; after END it gets 400 and navigates
    cy.url({ timeout: 5000 }).should('match', /\/player\/\d+\/result/);

    // ── Step 11: Verify result page ───────────────────────────────────────
    cy.contains('Your Results').should('be.visible');

    // Summary cards — 1 question, 1 correct
    cy.get('p.text-2xl').eq(0).should('have.text', '1'); // Questions
    cy.get('p.text-2xl').eq(1).should('have.text', '1'); // Correct

    // Result table should show the submitted answer
    cy.contains('td', 'True').should('be.visible');

    // Score cell should show +5 (correct, 5 points)
    cy.contains('+5').should('be.visible');
  });
});
