system overview:
1. Introduction LifeMemoir is a web-based platform designed to allow users, especially older populations, to create and organize their life story in a professional, exciting and accessible book format. The system helps the user throughout the process using artificial intelligence tools to develop content and improve the quality of writing.

2. Main goals - Simplicity and accessibility: An intuitive interface that is friendly even to users who are not technologically skilled.
Guidance in the writing process: A smart questionnaire and automatic treatment to create a chronological writing plan.
Content quality: AI engine for editing, improving style and tone, checking spelling and grammar.
Flexibility and download: Save, download and export in Word and EPUB.

3. Target audience - Older people without technical or literary knowledge.
Families who want to document memories.
Users who need guidance in the planning, writing and improving content stages.

4. Key Technologies - Backend & Auth & Database & Storage: Supabase
AI Integration: (Including JSON protocol system calls)
Frontend: React (e.g. using lovable.dev)
File Export: generation library for Word & EPUB

5. MVP — Main Features
5.1. Home Page - Showing a summary of processes and a link to log in/register.
5.2. Authentication - Registering a new user (Email/Password).
Authentication and Security (Session tokens, JWT).
5.3. Creating a new biography
1. Smart Form: Leading questions (free-text), encouraging memory and chronological order.
Sending to AI:
Initial reading of all answers to obtain an initial plan (TOC).
User approval/editing of the TOC structure.
Second reading to the language generator:
System prompt: structure.
System prompt: Table of contents saved for that biography used as an organized plan for writing
Context: All questions and answers in a JSON file.
Options for choosing style, tone, and writing language.
Text editor view:
WYSIWYG design with direct editing option.
Automatic saving to Supabase Storage.

5.4. Export and sharing
Download or share WORD/ EPUB files

6. Functional requirements .
Dynamic questionnaire interface: Loading questions and storing answers in DB.
Integration of AI modeling services
Rich text editor: Using a component such as Quill or Slate.js.
Project management system: List of personal biographies, status (draft, published).
Access levels: Standard user only.
Ability to move back and forth in the biography creation process, for example, after creating the TOC, the user can return to filling out the questionnaire and recreate the table of contents

7. UX/UI Color Palette:
Background: #FFFFFF
Primary CTA: #FFD217 (Chromatic Yellow)
Text: #333333 (Dark Gray)
Secondary accents: #5B9AA0 (Light Blue-Gray)

9. future features (don't implement yet!, just make sure the code is scalable for them):
service of voice transcriptions in addition to writing
service of cover image generation via flux.dev API and integrate inside the biography
user can upload images to the website and use them to edit the biography