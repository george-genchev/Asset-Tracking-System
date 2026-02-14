# Asset Tracking System

Asset Tracking System is a Financial Technology (FinTech) application designed to help users manage and track their financial assets effectively. The system provides a comprehensive platform for users to monitor their investments, analyze asset performance, and make informed financial decisions.
The application has to be build using the following technologies:
- Frontend: HTML, CSS, JavaScript and Bootstrap for building a responsive and user-friendly interface.
- Backend: Supabase for handling server-side logic and API endpoints.
- Database: Supabase's PostgreSQL database for storing user data, asset information, and transaction history.
- Authentication: Supabase's built-in authentication system for user registration and login.
- API Integration: Supabase's RESTful API for seamless communication between the frontend and backend.

The Asset Tracking System will allow users to:

1. Register and log in to their accounts securely.
2. Create / View / Edit / Delete investment strategies.
3. Create / View / Edit / Delete financial assets and associate them with specific investment strategies.
4. Dashboard to view an overview of their financial assets and investment strategies, including total portfolio value, asset allocation, and recent performance.
5. View detailed information about each asset, including weight and other relevant attributes.
6. Use charts and graphs to visualize weight of assets in the portfolio.

## Architecture and Technical Stack

Classical client-server application:
- Frontend: JS Application using HTML, CSS, JavaScript, Bootstrap
- Backend: Supabase for server-side logic and API endpoints
- Database: Supabase's PostgreSQL database for storing user data, asset information, and transaction history
- Authentication: Supabase's built-in authentication system for user registration and login
- API Integration: Supabase's RESTful API for seamless communication between the frontend and backend
- Build Tools: Vite for development and build process, with npm scripts for running the application in development and production modes.
- Deployment: The application will be deployed on a cloud platform such as Vercel or Netlify for the frontend, and Supabase for the backend and database.
- Source Control: GitHub for version control and collaboration among developers.

## Modular Design and Code Quality

Use modular code structure, with separate files for different functionalities, components, pages, features and follow best practices for code organization, maintainability, and scalability. Implement error handling and validation to ensure the application is robust and secure. Use ES6+ modules to organize the JavaScript code and promote code reusability. Use environment variables to manage sensitive information such as API keys and database credentials securely.

## UI Guidelines

- Use HTML, CSS, Bootstrap and Vanilla JavaScript for the frontend development.
- Use Bootstrap components and utilities to create a responsive and visually appealing user interface.
- Use modern, responsive UI design principles to ensure the application works well on various devices and screen sizes, with semantic HTML and accessibility in mind.
- Use a consistent color scheme and typography to enhance the user experience.
- Use appropriate icons, effects and visual cues to guide users through the application and make it intuitive to use.

## Pages and Navigation

- Split the application into multiple pages or views, such as:
  - Login/Registration: User authentication and account management.
  - Home/Dashboard: Overview of financial assets and investment strategies.
  - Asset Management: Create, view, edit, and delete financial assets.
  - Strategy Management: Create, view, edit, and delete investment strategies.
  - Asset Details: View detailed information about each asset, including weight and other relevant attributes.
  - Admin panel: For admin users to manage user accounts, assets and strategies.
- Implement pages as reusable components to promote code reusability and maintainability (HTML, CSS, JavaScript code).
- Use routing to navigate between different pages or views, ensuring a smooth user experience. This can be achieved using JavaScript to handle navigation and dynamically load content without full page reloads.
- Use full URLs like: /, /login, /register, /dashboard, /strategies, /assets, /admin, etc. for better user experience and SEO.

## Backend and Database

- Use Supabase as the backend and database solution for the application.
- Use PostgreSQL database to store user data, asset information, and transaction history.
- Use Supabase Storage for handling file uploads, if necessary (e.g., for user profile pictures or asset images).
- When changing the database schema, use Supabase's migration tools to manage and version control database changes effectively.
- After applying a migration in Supabase, keep a copy of the migration file in the project's repository for reference and version control. This helps track changes to the database schema over time and allows for easier collaboration among developers.

## Authentication and Authorization

- Use Supabase Auth for user registration and login, ensuring secure authentication and authorization mechanisms.
- Impement role-based access control (RBAC) to restrict access to certain features or pages based on user roles (e.g., admin, regular user).
- Implement RLS (Row-Level Security) in Supabase to ensure that users can only access their own data and prevent unauthorized access to other users' data.
- Implemnt user roles with a separate DB table 'user_roles' to manage user permissions and access levels effectively. Add enum 'roles' to define different user roles (e.g., admin, regular user) and their associated permissions.
