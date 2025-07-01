// SillyTavern macros for autocomplete
// prettier-ignore
const MACROS = [
    // General Macros
    { name: '{{pipe}}', description: 'Only for slash command batching. Replaced with the returned result of the previous command.' },
    { name: '{{newline}}', description: 'Inserts a newline.' },
    { name: '{{trim}}', description: 'Trims newlines surrounding this macro.' },
    { name: '{{noop}}', description: 'No operation, just an empty string.' },
    { name: '{{user}}', description: 'User\'s name.' },
    //{ name: '<USER>', description: 'User\'s name (alternative syntax).' },
    { name: '{{charPrompt}}', description: 'Character\'s Main Prompt override.' },
    { name: '{{charJailbreak}}', description: 'Character\'s Post-History Instructions Prompt override.' },
    { name: '{{group}}', description: 'Comma-separated list of group member names or character name in solo chats.' },
    { name: '{{charIfNotGroup}}', description: 'Comma-separated list of group member names or character name in solo chats.' },
    { name: '{{groupNotMuted}}', description: 'Same as {{group}} but excludes muted members.' },
    { name: '{{char}}', description: 'Character\'s name.' },
    //{ name: '<BOT>', description: 'Character\'s name (alternative syntax).' },
    { name: '{{description}}', description: 'Character\'s description.' },
    { name: '{{scenario}}', description: 'Character\'s scenario or chat scenario override (if set).' },
    { name: '{{personality}}', description: 'Character\'s personality.' },
    { name: '{{persona}}', description: 'User\'s persona description.' },
    { name: '{{mesExamples}}', description: 'Character\'s examples of dialogue (instruct-formatted).' },
    { name: '{{mesExamplesRaw}}', description: 'Character\'s examples of dialogue (unaltered and unsplit).' },
    { name: '{{charVersion}}', description: 'The character\'s version number.' },
    { name: '{{charDepthPrompt}}', description: 'The character\'s at-depth prompt.' },
    { name: '{{model}}', description: 'Text generation model name for the currently selected API. Can be inaccurate!' },
    { name: '{{lastMessageId}}', description: 'Last chat message ID.' },
    { name: '{{lastMessage}}', description: 'Last chat message text.' },
    { name: '{{firstIncludedMessageId}}', description: 'The ID of the first message included in the context. Requires generation to be run at least once in the current session.' },
    { name: '{{lastCharMessage}}', description: 'Last chat message sent by character.' },
    { name: '{{lastUserMessage}}', description: 'Last chat message sent by user.' },
    { name: '{{currentSwipeId}}', description: '1-based ID of the currently displayed last message swipe.' },
    { name: '{{lastSwipeId}}', description: 'Number of swipes in the last chat message.' },
    { name: '{{lastGenerationType}}', description: 'Type of the last queued generation request. Values: "normal", "impersonate", "regenerate", "quiet", "swipe", "continue".' },
    { name: '{{original}}', description: 'Can be used in Prompt Overrides fields to include the default prompt from system settings. Applied to Chat Completion APIs and Instruct mode only.' },
    { name: '{{time}}', description: 'Current system time.' },
    { name: '{{time_UTC±X}}', description: 'Current time in the specified UTC offset (timezone), e.g. for UTC+02:00 use {{time_UTC+2}}.' },
    { name: '{{timeDiff::(time1)::(time2)}}', description: 'The time difference between time1 and time2. Accepts time and date macros.' },
    { name: '{{date}}', description: 'Current system date.' },
    { name: '{{input}}', description: 'Contents of the user input bar.' },
    { name: '{{weekday}}', description: 'The current weekday.' },
    { name: '{{isotime}}', description: 'The current ISO time (24-hour clock).' },
    { name: '{{isodate}}', description: 'The current ISO date (YYYY-MM-DD).' },
    { name: '{{datetimeformat ...}}', description: 'Current date/time in specified format (e.g. {{datetimeformat DD.MM.YYYY HH:mm}}).' },
    { name: '{{idle_duration}}', description: 'Inserts a humanized string of the time range since the last user message was sent (examples: 4 hours, 1 day).' },
    { name: '{{random:(args)}}', description: 'Returns a random item from the list (e.g. {{random:1,2,3,4}} will return 1 of the 4 numbers at random).' },
    { name: '{{random::arg1::arg2}}', description: 'Alternate syntax for random that supports commas in its arguments.' },
    { name: '{{pick::(args)}}', description: 'Alternative to random, but the selected argument is stable on subsequent evaluations in the current chat if the source string remains unchanged.' },
    { name: '{{roll:(formula)}}', description: 'Generates a random value using D&D dice syntax: XdY+Z (e.g. {{roll:d6}} generates a value 1-6).' },
    { name: '{{bias "text here"}}', description: 'Sets a behavioral bias for the AI until the next user input. Quotes around text are required.' },
    { name: '{{// (note)}}', description: 'Allows leaving a note that will be replaced with blank content. Not visible for the AI.' },
    { name: '{{banned "text here"}}', description: 'Dynamically adds quoted text to banned word sequences for Text Generation WebUI backend. Does nothing for other backends. Quotes required.' },
    { name: '{{reverse:(content)}}', description: 'Reverses the content of the macro.' },

    // Instruct Mode and Context Template Macros
    { name: '{{exampleSeparator}}', description: 'Context template example dialogues separator.' },
    { name: '{{chatStart}}', description: 'Context template chat start line.' },
    { name: '{{instructSystemPrompt}}', description: 'Instruct system prompt.' },
    { name: '{{instructSystemPromptPrefix}}', description: 'System prompt prefix sequence.' },
    { name: '{{instructSystemPromptSuffix}}', description: 'System prompt suffix sequence.' },
    { name: '{{instructUserPrefix}}', description: 'User message prefix sequence.' },
    { name: '{{instructAssistantPrefix}}', description: 'Assistant message prefix sequence.' },
    { name: '{{instructSystemPrefix}}', description: 'System message prefix sequence.' },
    { name: '{{instructUserSuffix}}', description: 'User message suffix sequence.' },
    { name: '{{instructAssistantSuffix}}', description: 'Assistant message suffix sequence.' },
    { name: '{{instructSystemSuffix}}', description: 'System message suffix sequence.' },
    { name: '{{instructFirstAssistantPrefix}}', description: 'Assistant first output sequence.' },
    { name: '{{instructLastAssistantPrefix}}', description: 'Assistant last output sequence.' },
    { name: '{{instructFirstUserPrefix}}', description: 'Instruct user first input sequence.' },
    { name: '{{instructLastUserPrefix}}', description: 'Instruct user last input sequence.' },
    { name: '{{instructSystemInstructionPrefix}}', description: 'System instruction prefix sequence.' },
    { name: '{{instructUserFiller}}', description: 'User filler message text.' },
    { name: '{{instructStop}}', description: 'Instruct stop sequence.' },
    { name: '{{maxPrompt}}', description: 'Max size of the prompt in tokens (context length reduced by response length).' },
    { name: '{{systemPrompt}}', description: 'System prompt content, including character prompt override if allowed and available.' },
    { name: '{{defaultSystemPrompt}}', description: 'System prompt content (excluding character prompt override).' },

    // Chat Variables Macros
    { name: '{{getvar::name}}', description: 'Replaced with the value of the local variable "name".' },
    { name: '{{setvar::name::value}}', description: 'Replaced with empty string, sets the local variable "name" to "value".' },
    { name: '{{addvar::name::increment}}', description: 'Replaced with empty string, adds a numeric value of "increment" to the local variable "name".' },
    { name: '{{incvar::name}}', description: 'Replaced with the result of incrementing the value of variable "name" by 1.' },
    { name: '{{decvar::name}}', description: 'Replaced with the result of decrementing the value of variable "name" by 1.' },
    { name: '{{getglobalvar::name}}', description: 'Replaced with the value of the global variable "name".' },
    { name: '{{setglobalvar::name::value}}', description: 'Replaced with empty string, sets the global variable "name" to "value".' },
    { name: '{{addglobalvar::name::value}}', description: 'Replaced with empty string, adds a numeric value of "increment" to the global variable "name".' },
    { name: '{{incglobalvar::name}}', description: 'Replaced with the result of incrementing the value of global variable "name" by 1.' },
    { name: '{{decglobalvar::name}}', description: 'Replaced with the result of decrementing the value of global variable "name" by 1.' },
    { name: '{{var::name}}', description: 'Replaced with the value of the scoped variable "name" (STscript only).' },
    { name: '{{var::name::index}}', description: 'Replaced with the value at index of the scoped variable "name" (for arrays/objects in STscript).' },

    // Extension-specific Macros
    { name: '{{summary}}', description: 'Replaced with the summary of the current chat session (if available).' },
    { name: '{{authorsNote}}', description: 'Replaced with the contents of the Author\'s Note.' },
    { name: '{{charAuthorsNote}}', description: 'Replaced with the contents of the Character\'s Author\'s Note.' },
    { name: '{{defaultAuthorsNote}}', description: 'Replaced with the contents of the default Author\'s Note.' },
    { name: '{{charPrefix}}', description: 'Replaced with a character-specific Image Generation positive prompt prefix (if available).' },
    { name: '{{charNegativePrefix}}', description: 'Replaced with a character-specific Image Generation negative prompt prefix (if available).' }
];

// Function to filter macros based on input
function filterMacros(input) {
    const searchTerm = input.toLowerCase();
    return MACROS.filter(
        (macro) =>
            macro.name.toLowerCase().includes(searchTerm) ||
            macro.description.toLowerCase().includes(searchTerm)
    );
}

// Function to get macro suggestions for autocomplete
function getMacroSuggestions(input, maxResults = 10) {
    if (!input || input.length < 2) return [];

    const filtered = filterMacros(input);
    return filtered.slice(0, maxResults);
}
