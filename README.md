# RBDC_6 TicketFlowAI

1. User Logs in with GitLab OAuth

    Goal: Users must be authenticated via GitLab to ensure secure access and to link their repositories.
    Outcome: Once logged in, the app knows who the user is and which GitLab repos they can interact with.

Technical Steps

    Create a “Login with GitLab” button.
    Redirect users to GitLab’s OAuth page to grant permissions.
    On successful authentication, store user info in the session (or JWT).

2. Upload Project Documents

    Goal: The user uploads one or more project files (TXT or PDF) that describe requirements or scope.
    Outcome: Files are sent to the backend, stored in a database or file storage, and prepped for analysis.

Technical Steps

    Create a simple upload form (e.g., Next.js component) that accepts PDF/TXT files.
    On upload, send the file to an /api/upload-document endpoint.
    Store the document metadata (file name, etc.) in a documents table.

3. Document Summarization & Clarifying Questions

    Goal: Once the file is uploaded, use Crew AI to summarize the text and generate clarifying questions.
    Outcome: The app presents the user with a concise scope overview and a set of questions that highlight potential ambiguities or missing requirements.

Technical Steps

    Backend: Pass the document text to Crew AI (via API call or library) for summarization.
    Crew AI returns a summary and a list of questions (e.g., “Which error codes should be handled for login failures?”).
    Store or cache these results for quick retrieval (/api/summarize/{document_id}).

4. Generate Jira-Style Tickets

    Goal: Turn the summarized scope into actionable Jira tickets, each with a title, description, estimates, and dependencies.
    Outcome: The system automatically generates structured tasks (“[Task] Configure PostgreSQL”), so the user has a starting point for project planning.

Technical Steps

    Call an endpoint like /api/generate-tickets/{document_id}.
    Crew AI or your logic engine processes the summary, clarifying questions, and best practices to create recommended tickets.
    The response is a list of tickets with fields such as title, description, estimated time, and labels (e.g., “Frontend,” “Backend,” “Bug,” etc.).

5. Review & Approve Tickets

    Goal: The user reviews the automatically generated tickets, makes edits if needed, and selects which tickets to actually submit to Jira.
    Outcome: Only the finalized, high-quality tickets get pushed into Jira.

Technical Steps

    Display the generated tickets in the frontend, allowing inline editing of title, description, estimates, etc.
    Let the user toggle which tickets to include or exclude.
    Provide a “Submit to Jira” button.

6. Choose Target GitLab Repo & Submit to Jira

    Goal: The user decides which GitLab repo they’re tying these tickets to, then the app automatically creates those tickets in Jira while linking them to the GitLab project.
    Outcome: The newly created Jira tickets are associated with the user’s GitLab repo, so the development team has a clear reference to the codebase.

Technical Steps

    User selects their GitLab project repository (e.g., “gitlab.com/user/my-project”).
    The request to /api/submit-tickets includes the chosen repo plus the list of approved tickets.
    The backend then calls the Jira API to create new issues (tickets) in Jira with relevant metadata (title, description, estimate, labels, etc.).
    Optionally store the “Jira issue ID” and any references back in the database to keep track of them.

7. Ticket Prioritization

    Goal: Use Crew AI to sort tickets by urgency, complexity, dependencies, etc. so that the engineering team knows what to tackle first.
    Outcome: A prioritized list of tasks that the team can follow in Jira.

Technical Steps

    Either upon generation or after submission, Crew AI can calculate priority by analyzing dependencies and possible deadlines.
    The app might assign priorities automatically (e.g., “High,” “Medium,” “Low”) or compute an ordering of tasks.
    Reflect this info in the final Jira tickets or your own internal dashboard.

8. Maintain Continuous Workflow

    Goal: “Eat your own dogfood”—the same teams building the tool are using it for their daily tasks. This feedback loop ensures the system is continuously improved and any shortcomings become apparent.
    Outcome: An iterative process where user feedback leads to refinements in scope analysis, question generation, or ticket creation.

Technical Steps

    Use version control for both the project’s code and the tickets.
    Each time new features are added or the scope changes, re-upload or update the documents.
    Observe how well the generated tickets match actual development needs. Adjust your AI prompts and logic accordingly.