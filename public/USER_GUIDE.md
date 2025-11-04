# Rehi - User Guide & Feature Documentation

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Browser Extension Features](#browser-extension-features)
4. [Web Application Features](#web-application-features)
5. [Advanced Features](#advanced-features)
6. [Tips & Tricks](#tips--tricks)
7. [Feature Summary](#feature-summary)

---

## Introduction

### What is Rehi?

Rehi is an AI-powered knowledge management platform designed to help you read, highlight, and remember information effectively. It combines article saving, intelligent highlighting, AI-powered chat, and spaced repetition flashcards to transform how you learn and retain knowledge.

### Key Capabilities

- **Save & Organize Articles**: Collect articles from the web using browser extension
- **Smart Highlighting**: Highlight important content with color coding and notes
- **AI-Powered Chat**: Ask questions about your saved articles or get general assistance
- **Flashcard Learning**: Automatically generate flashcards from highlights for spaced repetition
- **Tag Management**: Organize articles with custom tags
- **Reading Experience**: Customize fonts, sizes, and reading preferences
- **Advanced Search**: Find articles using powerful filters and boolean operators
- **Cross-Device Sync**: Access your library from any device

---

## Getting Started

### 1. Account Setup

1. Navigate to the Rehi web application
2. Click "Log In" in the header
3. Sign in using Auth0 authentication
4. Complete your profile setup

### 2. Install Browser Extension (Optional but Recommended)

1. Install **rehi-browser-extension** from Chrome Web Store
2. Pin the extension to your browser toolbar
3. Open the extension popup
4. Click "Login" to authenticate
5. You're now ready to save articles directly from the web!

---

## Browser Extension Features

### Save Article by Browser Extension

**Prerequisites:**
- Install rehi-browser-extension from Chrome store
- Pin the extension and open popup
- Click button login in the popup

**To Save an Article:**
1. Navigate to any article you want to save
2. Press **Alt + R** (Rehi shortcut)
3. The article will be automatically saved to your Rehi library
4. Highlighting is now enabled - you can highlight directly on the original article page

**What Gets Saved:**
- Article title, URL, and content
- Author information
- Article summary (auto-generated)
- Word count and reading time estimates
- Language detection

### Revisit Article with Highlights

**To View Your Highlights:**
1. Navigate to a previously saved article
2. Press **Alt + R** to activate Rehi mode
3. All your previous highlights will be displayed on the article
4. You can continue highlighting or review existing highlights

**Note:** Highlights created via browser extension are synced with the web app and vice versa.

---

## Web Application Features

### 1. Navigation & Sidebar

#### Main Navigation Structure

- **Home**: Landing page with pricing information
- **Library** (Collapsible):
  - **Articles**: View and manage all saved articles
  - **Tags**: Manage your article tags
- **Daily Review**: Review flashcards scheduled for today
- **Master Flashcard**: View all flashcards across all articles
- **Chat AI**: General AI chat interface
- **Shared with you**: Articles shared by others (Coming soon)
- **Trash**: Deleted articles
- **Settings**: Application settings
- **Profile**: User profile management

#### Sidebar Features

- Collapsible sidebar (click trigger to expand/collapse)
- Active page highlighting
- Quick access to all major features

---

### 2. Articles Management

#### Articles Page (`/articles`)

**Article Locations:**

Articles can be organized into three locations accessed via URL parameters:
- **Reading** (`/articles?location=reading`) - Default, articles you're currently reading
- **Later** (`/articles?location=later`) - Articles saved for later reading
- **Archived** (`/articles?location=archived`) - Completed or archived articles

**Article Item Actions:**

Each article card provides:
- **Click article card**: Opens full article view
- **Three-dot menu (⋯)**:
  - **Copy article URL**: Copy article link to clipboard
  - **Open original article**: Open in new tab
  - **Add article tag**: Assign tags to organize articles
  - **Move to**: Change article location (Reading/Later/Archived)
  - **Move to Trash**: Soft delete article

**Article Information Display:**
- Article thumbnail image
- Title and summary
- Tags (if assigned)
- URL, language, and reading time
- Creation timestamp (time if today, date if older)

**Article Search:**

1. Press **Ctrl + K** (or **Cmd + K** on Mac) to open command palette
2. Enter search query with advanced filters:
   - **Text search**: Type keywords to search in title, summary, or content
   - **Tag filter**: `tag:ai` or `tag:javascript`
   - **Author filter**: `author:john`
   - **Combined filters**: 
     - `tag:ai and author:john` (both conditions)
     - `tag:ai or tag:javascript` (either condition)
     - `tag:ai and author:john or tag:javascript` (complex queries)
3. Press **Enter** to search
4. Press **Escape** to close palette

**Tag Management on Articles:**
- Click "Add article tag" from menu
- Type tag name or select from existing tags
- Tags are auto-created if they don't exist
- Tags appear as badges on article cards

---

### 3. Article Reading Experience

#### Article Detail Page (`/articles/[articleId]`)

**Article Header:**
- Back to Articles button
- Article title
- Author, publication date, reading time
- Reading Preferences button (font & size settings)
- Info sidebar toggle button

**Left Sidebar (Article Navigation):**
- Auto-generated table of contents from article headings
- Click any heading to jump to that section
- Highlights active section as you scroll
- Collapsible sidebar

**Reading Preferences:**

1. Click "Reading Preferences" button in article header
2. **Font Family**: Choose from 9 typefaces:
   - Inter, Times New Roman, Arial, Georgia, Helvetica, Merriweather, Open Sans, Roboto, Source Serif Pro
3. **Font Size**: Adjust from 12px to 24px
   - Click **-** to decrease
   - Click **+** to increase
4. Settings apply immediately to article content

**Article Content:**
- Clean, readable HTML rendering
- Scrollable content area
- Highlights automatically applied and visible
- Click highlights to interact with them

---

### 4. Highlighting System

#### Create Highlights

**Method 1: Text Selection**

1. Select any text in an article
2. Selection menu appears with:
   - **Color picker**: 5 colors (Yellow, Green, Blue, Purple, Pink)
   - **Highlight button**: Save highlight with selected color
   - **Ask Rehi button**: Ask AI about selected text
3. Click highlight button to save
4. Highlight is saved and displayed immediately

**Method 2: From Browser Extension**

1. Press **Alt + R** on any saved article
2. Highlight text directly on the original webpage
3. Highlights sync automatically to web app

#### Highlight Colors

- **Yellow** (default): General highlights
- **Green**: Important concepts
- **Blue**: Definitions or key terms
- **Purple**: Examples or case studies
- **Pink**: Personal notes or thoughts

#### Highlight Management

**View All Highlights:**

1. Open article detail page
2. Click **Info sidebar toggle** (three dots button)
3. Go to **Notebook** tab
4. All highlights listed with:
   - Highlight text
   - Color indicator
   - Source (Web or Extension)
   - Creation timestamp

**Interact with Highlights:**
- **Click highlight in sidebar**: Scrolls to highlight location in article
- **Add/edit note**: Click "Click to add a note" or edit icon
- **Delete highlight**: Hover over highlight, click trash icon
- **View highlight context**: Click highlight text to jump to location

**Highlight Notes:**
- Add contextual notes to any highlight
- Edit notes anytime
- Notes appear below highlight text
- Notes are saved with highlights and synced

---

### 5. Notebook & Notes

#### Document Notes

**Add Article-Level Notes:**

1. Open article detail page
2. Open **Info Sidebar** (right sidebar)
3. Click **Notebook** tab
4. In "Document Note" section:
   - Click empty area or edit icon
   - Type your notes
   - Click **Save** or **Cancel**
5. Notes are saved per article

**Use Cases:**
- Overall article summary
- Key takeaways
- Personal reflections
- Action items from article
- Connections to other articles

#### Highlight Notes

**Add Notes to Highlights:**

1. In Notebook tab, find highlight
2. Click "Click to add a note" button
3. Enter note text
4. Click **Save**
5. Notes appear below highlight text with "Note:" label

**Edit Highlight Notes:**
- Hover over note, click edit icon
- Modify note text
- Save or cancel changes

---

### 6. AI Chat Features

#### General Chat (`/chat`)

**Features:**
- General AI assistant powered by your saved articles
- Chat history panel (left sidebar)
- Multiple chat sessions support
- Relevant documents panel (shows related articles)

**How to Use:**

1. Navigate to **Chat AI** from sidebar
2. Type your question in the input area
3. Press **Enter** to send (Shift+Enter for new line)
4. AI responds with relevant information from your library
5. Related articles appear in right panel
6. Click article preview to navigate to full article

**Chat Sessions:**
- **New Chat**: Start fresh conversation (button in history panel)
- **Chat History**: All previous conversations listed
- **Switch Sessions**: Click any session in history to resume
- **Clear Chat**: Delete all messages in current session (trash icon)

**Message Features:**
- Markdown rendering in AI responses
- Code syntax highlighting
- Links and formatting
- Timestamps on hover
- Smooth scrolling to new messages

#### Article-Specific Chat (Info Sidebar)

**Features:**
- Context-aware chat about current article
- Available in article detail page
- Access via Info Sidebar → Chat tab

**How to Use:**

1. Open article detail page
2. Open **Info Sidebar** (three dots button)
3. Click **Chat** tab
4. Type questions about the article
5. AI responds based on article content

**Ask Rehi from Selection:**

1. Select text in article
2. Click **Ask Rehi** button in selection menu
3. Sidebar opens automatically to Chat tab
4. Selected text is pre-filled in input
5. Press Enter to send

**Chat History:**
- Per-article chat history
- Persists across sessions
- Only visible when viewing that article

---

### 7. Flashcard System

#### Daily Review (`/review`)

**Purpose:**

Review flashcards scheduled for today using spaced repetition algorithm.

**How to Use:**

1. Navigate to **Daily Review** from sidebar
2. Flashcard displays:
   - Highlight text (or HTML/Markdown)
   - Your note (if added)
   - Source article title (clickable)
3. Review the content
4. Provide feedback:
   - **Again**: Didn't remember, schedule soon
   - **Hard**: Remembered with difficulty
   - **Good**: Remembered well
   - **Easy**: Too easy, schedule later
5. System schedules next review based on your feedback

**Navigation:**
- **Previous/Next**: Navigate through flashcards
- **Card indicators**: Dots show position in deck
- **Go to Article**: Click article title to view source

**Spaced Repetition:**
- System automatically schedules reviews
- Based on your performance feedback
- More difficult cards appear more frequently
- Easy cards appear less frequently

#### Master Flashcard (`/flashcard`)

**Purpose:**

View and study all flashcards across all articles, not just scheduled reviews.

**How to Use:**

1. Navigate to **Master Flashcard** from sidebar
2. Browse all flashcards
3. Click **Reveal Answer** to see complete highlight
4. Click **Hide Answer** to hide again
5. Study at your own pace

**Features:**
- Shows category (article title)
- Question format with fill-in-the-blank style
- Answer revealed on demand
- No spaced repetition in this view (for browsing)

---

### 8. Tags Management

#### Tags Page (`/tags`)

**View All Tags:**

1. Navigate to **Library → Tags** from sidebar
2. All tags listed alphabetically
3. Each tag shows name and delete button

**Create Tag:**

1. Click **Create Tag** button (if no tags exist)
2. Or create via article menu: "Add article tag"
3. Enter tag name
4. Tag is created and assigned to article

**Delete Tag:**

1. Hover over tag in Tags page
2. Click trash icon
3. Tag is removed from all articles
4. Confirmation may be required

**Tag Usage:**
- Assign multiple tags to articles
- Filter articles by tags using search: `tag:tagname`
- Tags help organize articles by topic, subject, or category

---

### 9. Trash Management

#### Trash Page (`/trash`)

**View Deleted Articles:**

1. Navigate to **Trash** from sidebar
2. All soft-deleted articles displayed
3. Same article card format as main articles page

**Restore Articles:**
- (Feature may require implementation - check UI for restore option)

**Permanent Delete:**
- (Feature may require implementation - check UI for permanent delete)

---

### 10. Article Organization

#### Article Locations

**Move Articles Between Locations:**

1. Open article menu (three dots)
2. Click **Move to** option:
   - **Reading**: Currently reading
   - **Later**: Saved for later
   - **Archived**: Completed reading
3. Article moves to selected location

**Location Filtering:**
- Articles automatically filtered by location
- URL parameter controls location: `?location=reading|later|archived`
- Default location: Reading

---

## Advanced Features

### 1. Advanced Search

**Search Syntax:**

**Basic Text Search:**
```
neural networks
javascript frameworks
```

**Tag Filters:**
```
tag:ai
tag:javascript
tag:ai and tag:machine-learning
tag:ai or tag:javascript
```

**Author Filters:**
```
author:john
author:smith
author:john and tag:ai
```

**Complex Queries:**
```
tag:ai and author:john or tag:javascript
neural networks and tag:ai
```

**Boolean Operators:**
- `and`: All conditions must match
- `or`: Any condition can match
- Can combine multiple filters

### 2. Keyboard Shortcuts

**Command Palette:**
- `Ctrl + K` / `Cmd + K`: Open search command palette
- `Escape`: Close command palette

**Article Navigation:**
- Scroll to navigate
- Click headings in left sidebar to jump to sections

**Chat:**
- `Enter`: Send message
- `Shift + Enter`: New line in message

**Browser Extension:**
- `Alt + R`: Save article / Show highlights

### 3. Data Synchronization

**Offline-First Architecture:**
- Articles and highlights stored locally (IndexedDB)
- Automatic sync with server when online
- Last update timestamp tracked
- Works offline with sync on reconnect

**Cross-Device Sync:**
- All data synced across devices
- Browser extension highlights sync with web app
- Real-time updates when online

---

## Tips & Tricks

### 1. Efficient Article Organization

- Use tags consistently (e.g., `tech`, `design`, `business`)
- Move articles to "Later" when saving for future reading
- Archive articles after completing to keep "Reading" clean
- Use descriptive tags for easy searching

### 2. Effective Highlighting

- Use consistent color coding:
  - Yellow: General important points
  - Green: Key concepts
  - Blue: Definitions
  - Purple: Examples
  - Pink: Personal insights
- Add notes to highlights for context
- Highlight actionable items differently

### 3. Flashcard Learning

- Review Daily Review flashcards consistently
- Be honest with feedback (Again/Hard/Good/Easy)
- Use Master Flashcard for comprehensive review
- Add notes to highlights to enhance flashcard content

### 4. AI Chat Usage

- Ask specific questions for better results
- Use article-specific chat for focused questions
- Leverage "Ask Rehi" from text selection for quick questions
- Review relevant documents panel for source articles

### 5. Search Optimization

- Use tag filters to narrow results quickly
- Combine text search with tag/author filters
- Save frequently used searches as mental templates
- Use OR for related topics: `tag:ai or tag:machine-learning`

### 6. Reading Experience

- Adjust font size for comfort
- Choose font family that suits your reading style
- Use table of contents (left sidebar) for long articles
- Bookmark important sections via highlights

---

## Feature Summary

### Core Features

✅ Article saving from browser extension  
✅ Article management (Reading/Later/Archived)  
✅ Smart text highlighting with color coding  
✅ Highlight notes and article notes  
✅ AI-powered chat (general and article-specific)  
✅ Flashcard generation from highlights  
✅ Spaced repetition review system  
✅ Tag-based organization  
✅ Advanced search with filters  
✅ Reading preferences customization  
✅ Cross-device synchronization  
✅ Table of contents navigation  

### Coming Soon / Under Development

⏳ Library page (placeholder)  
⏳ Settings page (placeholder)  
⏳ Share page (placeholder)  
⏳ Group sharing features  
⏳ PDF export  
⏳ Note translation  

---

## Support & Resources

### Getting Help

- Check FAQs in footer
- Contact support via Contact Us link
- Review browser extension documentation

### Keyboard Shortcuts Reference

- `Ctrl/Cmd + K`: Search articles
- `Alt + R`: Save article / Show highlights (Extension)
- `Enter`: Send chat message
- `Shift + Enter`: New line in chat

---

## Conclusion

Rehi transforms how you read, learn, and remember information. By combining intelligent highlighting, AI-powered assistance, and spaced repetition flashcards, Rehi helps you build a second brain for your knowledge management needs.

**Start your journey:**

1. Install the browser extension
2. Save your first article with Alt + R
3. Highlight important content
4. Ask questions via AI chat
5. Review flashcards daily

Happy learning with Rehi!
