# Supabase Team Workflow

This guide provides the essential steps for all team members to get started and collaborate effectively on the database schema.

### 1. Project Access

The project owner (Vivek) must first invite you to the Supabase project via the dashboard. Please provide him with your email address associated with your GitHub account.

Once you accept the invitation, you will have the necessary permissions to work on the database.

### 2. Initial Setup

To get started, you will need the Supabase CLI installed on your machine.

* **Install the CLI:** Follow the instructions on the official Supabase documentation for your operating system.
* **Clone the Repository:**
    ```bash
    git clone [https://github.com/vivek-rx/sgbrmh-alumni-connect.git](https://github.com/vivek-rx/sgbrmh-alumni-connect.git)
    cd sgbrmh-alumni-connect
    ```

### 3. Login and Link Your Project

The Supabase CLI needs to be linked to your live project so it knows where to apply changes.

1.  **Log in to the CLI:**
    ```bash
    supabase login
    ```
    This will open a browser window and prompt you to log in with your GitHub account.

2.  **Link Your Local Project:** Find your project's reference ID in the URL of your Supabase dashboard (e.g., `https://supabase.com/dashboard/projects/<project-ref>`). Then, run:
    ```bash
    supabase link --project-ref <your-project-ref>
    ```

### 4. Pulling the Latest Schema

To ensure your local `schema.sql` file is up-to-date with the live database, you should pull the schema from Supabase.

* **Pull the schema:**
    ```bash
    supabase db pull
    ```
    This command generates a new SQL file that reflects the current state of the live database. You can use this file to update your `database/schema.sql` file to ensure you're working with the latest changes.

### 5. Making and Pushing Database Changes

Once you've made a change to `database/schema.sql` on your local machine:

1.  **Push the changes to the live database:**
    ```bash
    supabase db push
    ```
    This is the command that will apply your local schema changes to the live database.

2.  **Commit and push the changes to GitHub:** This ensures the rest of the team can see your updates.
    ```bash
    git add .
    git commit -m "fix: [A brief description of your changes]"
    git push origin [your-branch-name]
    ```