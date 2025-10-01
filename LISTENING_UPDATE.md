# EnglishWeb Listening Activity Update

## Changes Made

### 1. Created AudioGenerationOptions component
- Location: `src/components/ui/AudioGenerationOptions.tsx`
- Features:
  - Upload audio file
  - Generate audio from text (English/Vietnamese)
  - Audio preview functionality
  - Integration with TanStack Query

### 2. Updated CreateAssignmentModal
- Modified listening activity to support multiple questions with single audio
- Integrated AudioGenerationOptions component
- Changed listening content structure from:
  ```js
  {
    audioUrl: '',
    prompt: '',
    options: ['', ''],
    correctIndex: 0
  }
  ```
  To:
  ```js
  {
    audioUrl: '',
    questions: [
      {
        question: '',
        options: ['', ''],
        correctIndex: 0
      }
    ]
  }
  ```

### 3. Features Added
- **Audio Generation**: Users can type text and generate audio in English or Vietnamese
- **Audio Upload**: Traditional file upload option
- **Audio Preview**: Play/stop audio preview
- **Multiple Questions**: Each listening activity can have unlimited questions
- **Question Management**: Add/remove questions and options dynamically

### 4. UI Improvements
- Clear separation between audio and questions sections
- Intuitive question numbering
- Visual feedback for audio status
- Better organization of form fields

## Usage
1. Select "listening" activity type
2. Choose audio method: Upload file or Generate from text
3. Add questions with multiple choice options
4. Set correct answer index for each question
5. Preview audio before saving

This matches the structure implemented in cms-english and backend DTOs.
