// Character Card Creator - Main JavaScript

class CharacterCardCreator {
    constructor() {
        this.currentImage = null;
        this.currentImageData = null;
        this.greetingCount = 0;
        this.bookEntryCount = 0;
        this.selectedMacroIndex = -1;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupMacroAutocomplete();
    }

    setupEventListeners() {
        // Image upload
        const imageUpload = document.getElementById('imageUpload');
        const imageInput = document.getElementById('imageInput');
        const characterImage = document.getElementById('characterImage');
        const uploadPlaceholder = document.getElementById('uploadPlaceholder');

        imageUpload.addEventListener('click', () => imageInput.click());

        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.currentImageData = e.target.result;
                    characterImage.src = e.target.result;
                    characterImage.style.display = 'block';
                    uploadPlaceholder.style.display = 'none';
                };
                reader.readAsDataURL(file);
            }
        });

        // Dynamic sections
        document
            .getElementById('addGreeting')
            .addEventListener('click', () => this.addAlternateGreeting());
        document
            .getElementById('addBookEntry')
            .addEventListener('click', () => this.addBookEntry());

        // Export buttons
        document
            .getElementById('exportJson')
            .addEventListener('click', () => this.exportAsJson());
        document
            .getElementById('importCard')
            .addEventListener('click', () =>
                document.getElementById('importInput').click()
            );

        // Import functionality
        document
            .getElementById('importInput')
            .addEventListener('change', (e) => this.importCard(e));
    }

    setupMacroAutocomplete() {
        const textareas = document.querySelectorAll('textarea');
        const autocompleteDiv = document.getElementById('macroAutocomplete');
        const macroList = document.getElementById('macroList');

        textareas.forEach((textarea) => {
            textarea.addEventListener('input', (e) =>
                this.handleMacroInput(e, autocompleteDiv, macroList)
            );
            textarea.addEventListener('keydown', (e) =>
                this.handleMacroKeydown(e, autocompleteDiv, macroList)
            );
            textarea.addEventListener('blur', () => {
                setTimeout(() => (autocompleteDiv.style.display = 'none'), 150);
            });
        });
    }

    handleMacroInput(e, autocompleteDiv, macroList) {
        const textarea = e.target;
        const cursorPos = textarea.selectionStart;
        const text = textarea.value;

        // Find the start of the current macro (looking backwards for {{)
        let macroStart = -1;
        for (let i = cursorPos - 1; i >= 0; i--) {
            if (text.substring(i, i + 2) === '{{') {
                macroStart = i;
                break;
            }
            // Stop if we hit a space, newline, or closing braces
            if (
                text[i] === ' ' ||
                text[i] === '\n' ||
                text.substring(i, i + 2) === '}}'
            ) {
                break;
            }
        }

        // Check if we're currently typing a macro
        if (macroStart !== -1) {
            const macroText = text.substring(macroStart + 2, cursorPos); // Skip the {{
            const suggestions = getMacroSuggestions(macroText);

            if (suggestions.length > 0) {
                this.showMacroAutocomplete(
                    textarea,
                    autocompleteDiv,
                    macroList,
                    suggestions,
                    macroStart,
                    cursorPos
                );
            } else {
                autocompleteDiv.style.display = 'none';
            }
        } else {
            autocompleteDiv.style.display = 'none';
        }
    }

    handleMacroKeydown(e, autocompleteDiv, macroList) {
        if (autocompleteDiv.style.display === 'none') return;

        const items = macroList.querySelectorAll('li');

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.selectedMacroIndex = Math.min(
                    this.selectedMacroIndex + 1,
                    items.length - 1
                );
                this.updateMacroSelection(items);
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.selectedMacroIndex = Math.max(
                    this.selectedMacroIndex - 1,
                    -1
                );
                this.updateMacroSelection(items);
                break;
            case 'Enter':
            case 'Tab':
                if (this.selectedMacroIndex >= 0) {
                    e.preventDefault();
                    this.insertMacro(
                        e.target,
                        items[this.selectedMacroIndex].dataset.macro
                    );
                    autocompleteDiv.style.display = 'none';
                }
                break;
            case 'Escape':
                autocompleteDiv.style.display = 'none';
                break;
        }
    }

    showMacroAutocomplete(
        textarea,
        autocompleteDiv,
        macroList,
        suggestions,
        wordStart,
        cursorPos
    ) {
        macroList.innerHTML = '';
        this.selectedMacroIndex = -1;

        suggestions.forEach((macro, index) => {
            const li = document.createElement('li');
            li.dataset.macro = macro.name;
            li.innerHTML = `
                <div class="macro-name">${macro.name}</div>
                <div class="macro-description">${macro.description}</div>
            `;

            li.addEventListener('click', () => {
                this.insertMacro(textarea, macro.name);
                autocompleteDiv.style.display = 'none';
            });

            macroList.appendChild(li);
        });

        // Reset scroll position to top
        autocompleteDiv.scrollTop = 0;

        // Position the autocomplete relative to the textarea
        const rect = textarea.getBoundingClientRect();
        const scrollTop =
            window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft =
            window.pageXOffset || document.documentElement.scrollLeft;

        // Calculate position relative to the document
        const absoluteTop = rect.top + scrollTop;
        const absoluteLeft = rect.left + scrollLeft;

        // Position below the textarea with some padding
        const topPosition = absoluteTop + rect.height + 5;
        const leftPosition = absoluteLeft;

        autocompleteDiv.style.display = 'block';
        autocompleteDiv.style.position = 'absolute';
        autocompleteDiv.style.left = leftPosition + 'px';
        autocompleteDiv.style.top = topPosition + 'px';
        autocompleteDiv.style.width = Math.min(400, rect.width) + 'px';

        // Ensure the autocomplete doesn't go off-screen
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const autocompleteRect = autocompleteDiv.getBoundingClientRect();

        // Adjust horizontal position if it goes off-screen
        if (autocompleteRect.right > viewportWidth) {
            autocompleteDiv.style.left =
                viewportWidth - autocompleteRect.width - 10 + 'px';
        }

        // Adjust vertical position if it goes off-screen (show above textarea instead)
        if (autocompleteRect.bottom > viewportHeight) {
            autocompleteDiv.style.top =
                absoluteTop - autocompleteRect.height - 5 + 'px';
        }
    }

    updateMacroSelection(items) {
        items.forEach((item, index) => {
            item.classList.toggle(
                'selected',
                index === this.selectedMacroIndex
            );
        });
    }

    insertMacro(textarea, macro) {
        const cursorPos = textarea.selectionStart;
        const text = textarea.value;

        // Find the start of the current macro (looking backwards for {{)
        let macroStart = -1;
        for (let i = cursorPos - 1; i >= 0; i--) {
            if (text.substring(i, i + 2) === '{{') {
                macroStart = i;
                break;
            }
            // Stop if we hit a space, newline, or closing braces
            if (
                text[i] === ' ' ||
                text[i] === '\n' ||
                text.substring(i, i + 2) === '}}'
            ) {
                break;
            }
        }

        if (macroStart !== -1) {
            const beforeMacro = text.substring(0, macroStart);
            const afterMacro = text.substring(cursorPos);

            textarea.value = beforeMacro + macro + afterMacro;
            textarea.selectionStart = textarea.selectionEnd =
                macroStart + macro.length;
        } else {
            // Fallback: just insert the macro at cursor position
            const beforeCursor = text.substring(0, cursorPos);
            const afterCursor = text.substring(cursorPos);

            textarea.value = beforeCursor + macro + afterCursor;
            textarea.selectionStart = textarea.selectionEnd =
                cursorPos + macro.length;
        }

        textarea.focus();
    }

    addAlternateGreeting() {
        this.greetingCount++;
        const container = document.getElementById('alternateGreetings');

        const greetingDiv = document.createElement('div');
        greetingDiv.className = 'greeting-item';
        greetingDiv.innerHTML = `
            <h4>Alternate Greeting ${this.greetingCount}</h4>
            <button type="button" class="remove-btn" onclick="this.parentElement.remove()">×</button>
            <textarea name="alternate_greeting_${this.greetingCount}" placeholder="Alternative opening message..." rows="3"></textarea>
        `;

        container.appendChild(greetingDiv);

        // Setup macro autocomplete for the new textarea
        const textarea = greetingDiv.querySelector('textarea');
        const autocompleteDiv = document.getElementById('macroAutocomplete');
        const macroList = document.getElementById('macroList');

        textarea.addEventListener('input', (e) =>
            this.handleMacroInput(e, autocompleteDiv, macroList)
        );
        textarea.addEventListener('keydown', (e) =>
            this.handleMacroKeydown(e, autocompleteDiv, macroList)
        );
        textarea.addEventListener('blur', () => {
            setTimeout(() => (autocompleteDiv.style.display = 'none'), 150);
        });
    }

    addBookEntry() {
        this.bookEntryCount++;
        const container = document.getElementById('bookEntries');

        const entryDiv = document.createElement('div');
        entryDiv.className = 'book-entry-item';
        entryDiv.innerHTML = `
            <h4>Lorebook Entry ${this.bookEntryCount}</h4>
            <button type="button" class="remove-btn" onclick="this.parentElement.remove()">×</button>
            
            <div class="form-group">
                <label>Entry Name</label>
                <input type="text" name="entry_name_${this.bookEntryCount}" placeholder="Entry name (optional)">
            </div>
            
            <div class="form-group">
                <label>Keys (comma-separated)</label>
                <input type="text" name="entry_keys_${this.bookEntryCount}" placeholder="keyword1, keyword2, keyword3" required>
            </div>
            
            <div class="form-group">
                <label>Secondary Keys (comma-separated)</label>
                <input type="text" name="entry_secondary_keys_${this.bookEntryCount}" placeholder="secondary1, secondary2">
            </div>
            
            <div class="form-group">
                <label>Content</label>
                <textarea name="entry_content_${this.bookEntryCount}" placeholder="Lorebook entry content..." rows="4" required></textarea>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label>Insertion Order</label>
                    <input type="number" name="entry_insertion_order_${this.bookEntryCount}" value="100" min="0">
                </div>
                
                <div class="form-group">
                    <label>Priority</label>
                    <input type="number" name="entry_priority_${this.bookEntryCount}" value="100" min="0">
                </div>
                
                <div class="form-group">
                    <label>Position</label>
                    <select name="entry_position_${this.bookEntryCount}">
                        <option value="before_char">Before Character</option>
                        <option value="after_char">After Character</option>
                    </select>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label>
                        <input type="checkbox" name="entry_enabled_${this.bookEntryCount}" checked>
                        Enabled
                    </label>
                </div>
                
                <div class="form-group">
                    <label>
                        <input type="checkbox" name="entry_case_sensitive_${this.bookEntryCount}">
                        Case Sensitive
                    </label>
                </div>
                
                <div class="form-group">
                    <label>
                        <input type="checkbox" name="entry_selective_${this.bookEntryCount}">
                        Selective (requires both keys and secondary keys)
                    </label>
                </div>
                
                <div class="form-group">
                    <label>
                        <input type="checkbox" name="entry_constant_${this.bookEntryCount}">
                        Constant (always inserted)
                    </label>
                </div>
            </div>
            
            <div class="form-group">
                <label>Comment</label>
                <textarea name="entry_comment_${this.bookEntryCount}" placeholder="Internal comment (not used in prompts)..." rows="2"></textarea>
            </div>
        `;

        container.appendChild(entryDiv);

        // Setup macro autocomplete for new textareas
        const textareas = entryDiv.querySelectorAll('textarea');
        const autocompleteDiv = document.getElementById('macroAutocomplete');
        const macroList = document.getElementById('macroList');

        textareas.forEach((textarea) => {
            textarea.addEventListener('input', (e) =>
                this.handleMacroInput(e, autocompleteDiv, macroList)
            );
            textarea.addEventListener('keydown', (e) =>
                this.handleMacroKeydown(e, autocompleteDiv, macroList)
            );
            textarea.addEventListener('blur', () => {
                setTimeout(() => (autocompleteDiv.style.display = 'none'), 150);
            });
        });
    }

    collectFormData() {
        const formData = new FormData(document.getElementById('characterForm'));
        const data = {};

        // Basic fields
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }

        // Collect alternate greetings
        const alternateGreetings = [];
        const greetingItems = document.querySelectorAll(
            '.greeting-item textarea'
        );
        greetingItems.forEach((textarea) => {
            if (textarea.value.trim()) {
                alternateGreetings.push(textarea.value.trim());
            }
        });

        // Collect book entries
        const bookEntries = [];
        const entryItems = document.querySelectorAll('.book-entry-item');
        entryItems.forEach((item) => {
            const entry = {
                keys: [],
                content: '',
                extensions: {},
                enabled: true,
                insertion_order: 100
            };

            // Get entry data
            const nameInput = item.querySelector('[name^="entry_name_"]');
            const keysInput = item.querySelector('[name^="entry_keys_"]');
            const secondaryKeysInput = item.querySelector(
                '[name^="entry_secondary_keys_"]'
            );
            const contentInput = item.querySelector('[name^="entry_content_"]');
            const insertionOrderInput = item.querySelector(
                '[name^="entry_insertion_order_"]'
            );
            const priorityInput = item.querySelector(
                '[name^="entry_priority_"]'
            );
            const positionSelect = item.querySelector(
                '[name^="entry_position_"]'
            );
            const enabledCheckbox = item.querySelector(
                '[name^="entry_enabled_"]'
            );
            const caseSensitiveCheckbox = item.querySelector(
                '[name^="entry_case_sensitive_"]'
            );
            const selectiveCheckbox = item.querySelector(
                '[name^="entry_selective_"]'
            );
            const constantCheckbox = item.querySelector(
                '[name^="entry_constant_"]'
            );
            const commentInput = item.querySelector('[name^="entry_comment_"]');

            if (keysInput.value.trim() && contentInput.value.trim()) {
                entry.keys = keysInput.value
                    .split(',')
                    .map((k) => k.trim())
                    .filter((k) => k);
                entry.content = contentInput.value.trim();
                entry.enabled = enabledCheckbox.checked;
                entry.insertion_order =
                    parseInt(insertionOrderInput.value) || 100;

                if (nameInput.value.trim()) entry.name = nameInput.value.trim();
                if (secondaryKeysInput.value.trim()) {
                    entry.secondary_keys = secondaryKeysInput.value
                        .split(',')
                        .map((k) => k.trim())
                        .filter((k) => k);
                }
                if (priorityInput.value)
                    entry.priority = parseInt(priorityInput.value);
                if (positionSelect.value) entry.position = positionSelect.value;
                if (caseSensitiveCheckbox.checked) entry.case_sensitive = true;
                if (selectiveCheckbox.checked) entry.selective = true;
                if (constantCheckbox.checked) entry.constant = true;
                if (commentInput.value.trim())
                    entry.comment = commentInput.value.trim();

                bookEntries.push(entry);
            }
        });

        return {
            basicData: data,
            alternateGreetings,
            bookEntries
        };
    }

    createCharacterCard() {
        const { basicData, alternateGreetings, bookEntries } =
            this.collectFormData();

        // Create character book if there are entries or book settings
        let characterBook = null;
        if (
            bookEntries.length > 0 ||
            basicData.book_name ||
            basicData.book_description ||
            basicData.scan_depth ||
            basicData.token_budget
        ) {
            characterBook = {
                entries: bookEntries,
                extensions: {}
            };

            if (basicData.book_name) characterBook.name = basicData.book_name;
            if (basicData.book_description)
                characterBook.description = basicData.book_description;
            if (basicData.scan_depth)
                characterBook.scan_depth = parseInt(basicData.scan_depth);
            if (basicData.token_budget)
                characterBook.token_budget = parseInt(basicData.token_budget);
            if (basicData.recursive_scanning)
                characterBook.recursive_scanning = true;
        }

        // Parse tags
        const tags = basicData.tags
            ? basicData.tags
                  .split(',')
                  .map((tag) => tag.trim())
                  .filter((tag) => tag)
            : [];

        // Create the character card
        const characterCard = {
            spec: 'chara_card_v2',
            spec_version: '2.0',
            data: {
                name: basicData.name || '',
                description: basicData.description || '',
                personality: basicData.personality || '',
                scenario: basicData.scenario || '',
                first_mes: basicData.first_mes || '',
                mes_example: basicData.mes_example || '',
                creator_notes: basicData.creator_notes || '',
                system_prompt: basicData.system_prompt || '',
                post_history_instructions:
                    basicData.post_history_instructions || '',
                alternate_greetings: alternateGreetings,
                tags: tags,
                creator: basicData.creator || '',
                character_version: basicData.character_version || '',
                extensions: {}
            }
        };

        if (characterBook) {
            characterCard.data.character_book = characterBook;
        }

        return characterCard;
    }

    exportAsJson() {
        const characterCard = this.createCharacterCard();
        const jsonString = JSON.stringify(characterCard, null, 2);

        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${characterCard.data.name || 'character'}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async importCard(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            if (file.type === 'application/json') {
                const text = await file.text();
                const characterCard = JSON.parse(text);
                this.loadCharacterCard(characterCard);
            } else if (file.type.startsWith('image/')) {
                const tags = await ExifReader.load(file);
                const chara = tags['chara'] || tags['Chara'];
                if (chara.value) {
                    const characterCard = JSON.parse(atob(chara.value));
                    this.loadCharacterCard(characterCard);
                } else {
                    alert('No character card data found in the image.');
                }
            }
        } catch (error) {
            alert('Error importing character card: ' + error.message);
        }

        event.target.value = '';
    }

    loadCharacterCard(characterCard) {
        // Handle both V1 and V2 formats
        const data = characterCard.data || characterCard;

        // Load basic fields
        document.getElementById('name').value = data.name || '';
        document.getElementById('description').value = data.description || '';
        document.getElementById('personality').value = data.personality || '';
        document.getElementById('scenario').value = data.scenario || '';
        document.getElementById('first_mes').value = data.first_mes || '';
        document.getElementById('mes_example').value = data.mes_example || '';

        // Load V2 fields if available
        if (data.creator_notes)
            document.getElementById('creator_notes').value = data.creator_notes;
        if (data.system_prompt)
            document.getElementById('system_prompt').value = data.system_prompt;
        if (data.post_history_instructions)
            document.getElementById('post_history_instructions').value =
                data.post_history_instructions;
        if (data.creator)
            document.getElementById('creator').value = data.creator;
        if (data.character_version)
            document.getElementById('character_version').value =
                data.character_version;
        if (data.tags)
            document.getElementById('tags').value = data.tags.join(', ');

        // Load alternate greetings
        if (data.alternate_greetings && data.alternate_greetings.length > 0) {
            data.alternate_greetings.forEach((greeting) => {
                this.addAlternateGreeting();
                const greetingItems = document.querySelectorAll(
                    '.greeting-item textarea'
                );
                const lastGreeting = greetingItems[greetingItems.length - 1];
                lastGreeting.value = greeting;
            });
        }

        // Load character book
        if (data.character_book) {
            const book = data.character_book;
            if (book.name)
                document.getElementById('book_name').value = book.name;
            if (book.description)
                document.getElementById('book_description').value =
                    book.description;
            if (book.scan_depth)
                document.getElementById('scan_depth').value = book.scan_depth;
            if (book.token_budget)
                document.getElementById('token_budget').value =
                    book.token_budget;
            if (book.recursive_scanning)
                document.getElementById('recursive_scanning').checked =
                    book.recursive_scanning;

            // Load book entries
            if (book.entries && book.entries.length > 0) {
                book.entries.forEach((entry) => {
                    this.addBookEntry();
                    const entryItems =
                        document.querySelectorAll('.book-entry-item');
                    const lastEntry = entryItems[entryItems.length - 1];

                    if (entry.name)
                        lastEntry.querySelector('[name^="entry_name_"]').value =
                            entry.name;
                    if (entry.keys)
                        lastEntry.querySelector('[name^="entry_keys_"]').value =
                            entry.keys.join(', ');
                    if (entry.secondary_keys)
                        lastEntry.querySelector(
                            '[name^="entry_secondary_keys_"]'
                        ).value = entry.secondary_keys.join(', ');
                    if (entry.content)
                        lastEntry.querySelector(
                            '[name^="entry_content_"]'
                        ).value = entry.content;
                    if (entry.insertion_order !== undefined)
                        lastEntry.querySelector(
                            '[name^="entry_insertion_order_"]'
                        ).value = entry.insertion_order;
                    if (entry.priority !== undefined)
                        lastEntry.querySelector(
                            '[name^="entry_priority_"]'
                        ).value = entry.priority;
                    if (entry.position)
                        lastEntry.querySelector(
                            '[name^="entry_position_"]'
                        ).value = entry.position;
                    if (entry.enabled !== undefined)
                        lastEntry.querySelector(
                            '[name^="entry_enabled_"]'
                        ).checked = entry.enabled;
                    if (entry.case_sensitive)
                        lastEntry.querySelector(
                            '[name^="entry_case_sensitive_"]'
                        ).checked = entry.case_sensitive;
                    if (entry.selective)
                        lastEntry.querySelector(
                            '[name^="entry_selective_"]'
                        ).checked = entry.selective;
                    if (entry.constant)
                        lastEntry.querySelector(
                            '[name^="entry_constant_"]'
                        ).checked = entry.constant;
                    if (entry.comment)
                        lastEntry.querySelector(
                            '[name^="entry_comment_"]'
                        ).value = entry.comment;
                });
            }
        }

        alert('Character card loaded successfully!');
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CharacterCardCreator();
});
