let allCombinations = []; // Spara alla kombinationer globalt

// Hämta alla unika färger från kombinationerna
function getUniqueColors(combinations) {
    const colors = new Set();
    combinations.forEach(comb => {
        colors.add(comb.color1);
        colors.add(comb.color2);
    });
    return Array.from(colors).sort();
}

// Uppdatera färgfilter-dropdown
function updateColorFilter(colors) {
    const filter = document.getElementById('colorFilter');
    // Rensa befintliga alternativ förutom det första
    while (filter.options.length > 1) {
        filter.remove(1);
    }
    
    // Lägg till färgerna i dropdown-menyn
    colors.forEach(color => {
        const option = document.createElement('option');
        option.value = color;
        option.textContent = color;
        filter.appendChild(option);
    });

    // Lägg till event listener för filtrering
    filter.addEventListener('change', function() {
        const selectedColor = this.value;
        filterCombinations(selectedColor);
    });
}

// Filtrera och visa kombinationer baserat på vald färg
function filterCombinations(selectedColor) {
    // Rensa containern
    const container = document.getElementById('colorCombinations');
    container.innerHTML = '';

    // Skapa segment för olika WCAG-nivåer
    const wcagLevels = {
        'AAA': { container: null, cards: null },
        'AA': { container: null, cards: null },
        'A': { container: null, cards: null },
        'Ingen': { container: null, cards: null }
    };

    // Skapa containrar för varje WCAG-nivå
    Object.entries(wcagLevels).forEach(([level, data]) => {
        data.container = document.createElement('div');
        data.container.className = 'segment';
        data.container.innerHTML = `<h2>${level}${level !== 'Ingen' ? ' (kontrast > ' + 
            (level === 'AAA' ? '7.0' : level === 'AA' ? '4.5' : '3.0') + ')' : ''}</h2><div class="cards-container"></div>`;
        data.cards = data.container.querySelector('.cards-container');
        container.appendChild(data.container);
    });

    // Filtrera och skapa kort för varje kombination
    allCombinations.forEach(combination => {
        if (selectedColor === 'all' || combination.color1 === selectedColor || combination.color2 === selectedColor) {
            const card = document.createElement('div');
            card.className = 'card';
            
            // Spara färgerna i data-attribut för hover-effekt
            card.dataset.color1 = JSON.stringify({
                name: combination.color1,
                rgb: combination.color1Farg.join(',')
            });
            card.dataset.color2 = JSON.stringify({
                name: combination.color2,
                rgb: combination.color2Farg.join(',')
            });
            
            // Skapa bakgrunden
            const background = document.createElement('div');
            background.className = 'background';
            
            // Skapa container för texten
            const textContainer = document.createElement('div');
            textContainer.className = 'color-text';
            
            // Färgtext
            const colorName = document.createElement('div');
            colorName.className = 'color-name';
            colorName.textContent = combination.color1;
            
            // Beskrivningstext
            const description = document.createElement('div');
            description.className = 'description';
            description.innerHTML = '<span>En färgad text men</span> <span style="color: white">dessa ord är vita</span><br><span style="color: black">och här kommer lite svart.</span>';
            
            // Lägg till text i containern
            textContainer.appendChild(colorName);
            textContainer.appendChild(description);
            
            // Lägg till textcontainern i bakgrunden
            background.appendChild(textContainer);
            
            // Textbox
            const textBox = document.createElement('div');
            textBox.className = 'text-box';
            textBox.textContent = combination.color2;
            background.appendChild(textBox);
            
            // Info-text
            const info = document.createElement('div');
            info.className = 'info';
            info.textContent = `Kontrast: ${combination.kontrast.toFixed(2)} (${combination.wcagNiva || 'Ingen'})`;
            
            // Sätt initiala färger
            background.style.backgroundColor = `rgb(${combination.color1Farg.join(',')})`;
            background.style.color = `rgb(${combination.color2Farg.join(',')})`;
            textBox.style.backgroundColor = `rgb(${combination.color2Farg.join(',')})`;
            textBox.style.color = `rgb(${combination.color1Farg.join(',')})`;
            
            // Lägg till elementen i kortet
            card.appendChild(background);
            card.appendChild(info);
            
            // Hover-effekt
            card.addEventListener('mouseenter', function() {
                const color1 = JSON.parse(this.dataset.color1);
                const color2 = JSON.parse(this.dataset.color2);
                
                // Byt färger
                this.querySelector('.background').style.backgroundColor = `rgb(${color2.rgb})`;
                this.querySelector('.background').style.color = `rgb(${color1.rgb})`;
                this.querySelector('.color-name').textContent = color2.name;
                this.querySelector('.text-box').style.backgroundColor = `rgb(${color1.rgb})`;
                this.querySelector('.text-box').style.color = `rgb(${color2.rgb})`;
                this.querySelector('.text-box').textContent = color1.name;
            });
            
            card.addEventListener('mouseleave', function() {
                const color1 = JSON.parse(this.dataset.color1);
                const color2 = JSON.parse(this.dataset.color2);
                
                // Återställ färger
                this.querySelector('.background').style.backgroundColor = `rgb(${color1.rgb})`;
                this.querySelector('.background').style.color = `rgb(${color2.rgb})`;
                this.querySelector('.color-name').textContent = color1.name;
                this.querySelector('.text-box').style.backgroundColor = `rgb(${color2.rgb})`;
                this.querySelector('.text-box').style.color = `rgb(${color1.rgb})`;
                this.querySelector('.text-box').textContent = color2.name;
            });
            
            // Lägg till kort i rätt segment baserat på WCAG-nivå
            const level = combination.wcagNiva || 'Ingen';
            wcagLevels[level].cards.appendChild(card);
        }
    });

    // Dölj tomma segment
    Object.entries(wcagLevels).forEach(([level, data]) => {
        if (data.cards.children.length === 0) {
            data.container.style.display = 'none';
        } else {
            data.container.style.display = 'block';
        }
    });
}

// Läs in data från JSON-fil
console.log('Försöker hämta färgdata...');
// Använd en mer robust sökväg
const basePath = window.location.pathname.split('/').slice(0, -1).join('/');
fetch(`${basePath ? basePath + '/' : ''}data/fargkombinationer_WCAG.json`)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(colorData => {
        console.log('Färgdata laddades:', colorData);
        // Spara alla kombinationer globalt
        allCombinations = colorData.kombinationer;
        
        // Sortera kombinationer efter kontrastvärde (högst först)
        allCombinations.sort((a, b) => b.kontrast - a.kontrast);

        // Fyll i färgfilter-dropdown
        const uniqueColors = getUniqueColors(allCombinations);
        updateColorFilter(uniqueColors);

        // Visa alla kombinationer initialt
        filterCombinations('all');
    })
    .catch(error => {
        console.error('Ett fel uppstod vid inläsning av färgdata:', error);
        // Visa felmeddelande för användaren
        const container = document.getElementById('colorCombinations');
        container.innerHTML = `
            <div class="error-message">
                <h3>Kunde inte ladda färgdata</h3>
                <p>${error.message}</p>
                <p>Kontrollera att filen fargkombinationer.json finns i rätt mapp.</p>
            </div>
        `;
    });
