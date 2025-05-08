(function() {
    let allCombinations = []; // Privat variabel i IIFE

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
            
            // Skapa kortinnehåll
            const color1 = combination.color1Farg.join(',');
            const color2 = combination.color2Farg.join(',');
            const color1Name = combination.color1;
            const color2Name = combination.color2;
            const contrast = combination.kontrast.toFixed(2);
            const wcagLevel = combination.wcagNiva || 'Ingen';
            
            card.innerHTML = `
                <div class="card-content">
                    <div class="background" style="background-color: rgb(${color1})">
                        <div class="color-text" style="color: rgb(${color2})">
                            <div class="color-name">
                                ${color1Name}
                            </div>
                            <div class="description">
                                <div class="example-text">
                                    <span>En färgad text men</span> 
                                    <span style="color: white">dessa ord är vita</span><br>
                                    <span style="color: black">och här kommer lite svart.</span>
                                </div>
                            </div>
                        </div>
                        <div class="text-box" style="background-color: rgb(${color2}); color: rgb(${color1})">
                            ${color2Name}
                        </div>
                    </div>
                    <div class="info">
                        Kontrast: ${contrast} (${wcagLevel === 'Ej godkänd' ? 'Ingen' : wcagLevel})
                    </div>
                </div>
            `;
            
            // Spara färginformation i data-attribut
            card.dataset.color1 = JSON.stringify({
                name: color1Name,
                rgb: color1.split(',').map(Number)
            });
            card.dataset.color2 = JSON.stringify({
                name: color2Name,
                rgb: color2.split(',').map(Number)
            });
            
            // Lägg till toggle-beteende för färgbytet
            let isSwapped = false;

            const toggleColors = function() {
                const color1 = JSON.parse(this.dataset.color1);
                const color2 = JSON.parse(this.dataset.color2);
                const background = this.querySelector('.background');
                const colorName = this.querySelector('.color-name');
                const textBox = this.querySelector('.text-box');
                const colorText = this.querySelector('.color-text');
                const exampleTextSpan = this.querySelector('.example-text span:first-child');

                if (!isSwapped) {
                    // Byt färger
                    background.style.backgroundColor = `rgb(${color2.rgb})`;
                    background.style.color = `rgb(${color1.rgb})`;
                    colorName.textContent = color2.name;
                    textBox.style.backgroundColor = `rgb(${color1.rgb})`;
                    textBox.style.color = `rgb(${color2.rgb})`;
                    textBox.textContent = color1.name;
                    colorText.style.color = `rgb(${color1.rgb})`;
                    exampleTextSpan.style.color = `rgb(${color1.rgb})`;
                    isSwapped = true;
                } else {
                    // Återställ färger
                    background.style.backgroundColor = `rgb(${color1.rgb})`;
                    background.style.color = `rgb(${color2.rgb})`;
                    colorName.textContent = color1.name;
                    textBox.style.backgroundColor = `rgb(${color2.rgb})`;
                    textBox.style.color = `rgb(${color1.rgb})`;
                    textBox.textContent = color2.name;
                    colorText.style.color = `rgb(${color2.rgb})`;
                    exampleTextSpan.style.color = `rgb(${color2.rgb})`;
                    isSwapped = false;
                }
            };

            // Lägg till klick-event listener
            card.addEventListener('click', toggleColors);
            card.addEventListener('touchstart', toggleColors);

            // Lägg till kort i rätt segment baserat på WCAG-nivå
            const level = wcagLevel === 'Ej godkänd' ? 'Ingen' : wcagLevel;
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

// Funktion för att hämta bas-sökväg
function getBasePath() {
    return window.location.pathname.split('/').slice(0, -1).join('/');
}

// Läs in data från JSON-fil
console.log('Försöker hämta färgdata...');
fetch(`${getBasePath()}/data/fargkombinationer_WCAG.json`)
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
                <p>Försöker ladda från alternativ sökväg...</p>
            </div>
        `;
        
        // Försök med alternativ sökväg
        fetch('data/fargkombinationer_WCAG.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(colorData => {
                console.log('Färgdata laddades från alternativ sökväg:', colorData);
                allCombinations = colorData.kombinationer;
                allCombinations.sort((a, b) => b.kontrast - a.kontrast);
                const uniqueColors = getUniqueColors(allCombinations);
                updateColorFilter(uniqueColors);
                filterCombinations('all');
            })
            .catch(error => {
                console.error('Alternativ sökväg misslyckades:', error);
                container.innerHTML = `
                    <div class="error-message">
                        <h3>Kunde inte ladda färgdata</h3>
                        <p>${error.message}</p>
                        <p>Försök att ladda sidan igen eller kontrollera att filen data/fargkombinationer_WCAG.json finns i rätt mapp.</p>
                    </div>
                `;
            });
    });
})();
