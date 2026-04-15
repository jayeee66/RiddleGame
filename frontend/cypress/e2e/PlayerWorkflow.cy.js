// Path 1: Full admin workflow — single it block so localStorage (auth token)
// persists across all steps. Cypress clears state between separate it blocks,
// which would log the user out before each step.
describe('Path 1: Admin full workflow', () => {
  // Unique credentials per run to avoid conflicts with existing accounts.
  const timestamp = Date.now();
  const name = 'Cypress User';
  const email = `cypress_${timestamp}@example.com`;
  const password = 'Password123!';
  const gameName = `Quiz_${timestamp}`;

  it('completes the full admin workflow end-to-end', () => {

    // ── Step 1: Register ──────────────────────────────────────────────────
    cy.visit('/register');

    cy.get('input[placeholder="Firstname Lastname"]').type(name);
    cy.get('input[placeholder="you@example.com"]').type(email);
    // Two password fields — first is Password, last is Confirm Password
    cy.get('input[type="password"]').first().type(password);
    cy.get('input[type="password"]').last().type(password);

    cy.contains('button', 'Create Account').click();
    cy.url().should('include', '/dashboard');

    // ── Step 2: Create a game ─────────────────────────────────────────────
    cy.contains('button', 'New Game').click({ force: true });

    cy.get('input[placeholder="Game name"]').should('be.visible').type(gameName);
    cy.contains('button', 'Create').click();

    // Wait for the modal overlay to fully leave the DOM before proceeding
    cy.wait(1000);
    cy.get('div.fixed.inset-0').should('not.exist');
    cy.wait(300);
    cy.get('input[placeholder="Game name"]').should('not.exist');

    // New game card should appear in the dashboard list
    cy.contains(gameName).should('be.visible');

    // ── Add a question (required before Start Game) ───────────────────────
    // Navigate into the game editor via the card title link
    // force:true bypasses the brief coverage gap after the modal closes
    cy.contains('h2', gameName).click({ force: true });
    cy.url().should('match', /\/game\/\d+$/);

    // Open the Add Question modal
    cy.contains('button', 'Add Question').click({ force: true });
    cy.contains('New Question').should('be.visible');

    // Judgement type: True/False only — no answer text needed
    cy.wait(1000);
    cy.contains('button', 'Judgement').click();
    cy.get('input[placeholder="Enter your question"]').type('Is Cypress awesome?');
    cy.contains('button', /^Add$/).click({ force: true });

    // Wait for the modal overlay to fully leave the DOM before proceeding
    cy.wait(1000);
    cy.get('div.fixed.inset-0').should('not.exist');
    cy.get('input[placeholder="Enter your question"]').should('not.exist');

    // Question should now appear in the list
    cy.contains('Is Cypress awesome?').should('be.visible');

    // Return to dashboard via the floating nav button
    // force:true bypasses the brief coverage gap after the modal closes
    cy.contains('← Dashboard').click({ force: true });
    cy.url().should('include', '/dashboard');

    // ── Step 4: Start Game ────────────────────────────────────────────────
    // Intercept the mutate API call to capture the session ID for later.
    cy.intercept('POST', '**/admin/game/*/mutate').as('mutateGame');

    cy.contains('button', 'Start Game').click({ force: true });

    cy.wait('@mutateGame')
      .its('response.body.data.sessionId')
      .as('sessionId');

    // Session info and copy link should be visible in the card
    cy.contains('Session ID').should('be.visible');
    cy.contains('button', 'Copy Link').should('be.visible');

    // Advance through all questions so that End Game becomes available
    // (End Game only shows when position === totalQuestions - 1)
    cy.contains('button', 'Start First Question').click({ force: true });
    cy.contains('button', 'End Game', { timeout: 8000 }).should('be.visible');

    // ── Step 5: End Game → Not now ────────────────────────────────────────
    cy.contains('button', 'End Game').click({ force: true });

    // Confirmation modal must appear
    cy.contains('Would you like to view the results?').should('be.visible');

    // Dismiss without viewing results
    cy.contains('button', 'Not now').click();

    // Wait for the modal overlay to fully leave the DOM before proceeding
    cy.wait(1000);
    cy.get('div.fixed.inset-0').should('not.exist');
    cy.contains('Would you like to view the results?').should('not.exist');

    // ── Step 6: View results page ─────────────────────────────────────────
    // Use the session ID captured from the Start Game API response.
    cy.get('@sessionId').then((id) => {
      cy.visit(`/results/${id}`);
    });

    cy.url().should('match', /\/results\/\d+/);
    cy.contains('Game Results').should('be.visible');

    // ── Step 7: Logout → Home ─────────────────────────────────────────────
    cy.visit('/dashboard');
    cy.contains('button', 'Logout').click();
    cy.url().should('eq', `${Cypress.config('baseUrl')}/`);

    // ── Step 8: Login with the same credentials ───────────────────────────
    cy.visit('/login');

    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type(password);
    cy.contains('button', 'Sign In').click();

    cy.url().should('include', '/dashboard');
  });
});
