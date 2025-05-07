// Mobile-specific JavaScript
class ColorApp {
    constructor() {
        this.allCombinations = [];
        this.filterSelect = document.getElementById('colorFilter');
        this.colorGrid = document.getElementById('colorCombinations');
        
        this.init();
    }
    
    async init() {
        await this.loadColorData();
        this.setupEventListeners();
    }
    
    async loadColorData() {
        try {
            const basePath = window.location.pathname.split('/').slice(0, -1).join('/');
            const response = await fetch(`${basePath}/data/fargkombinationer_WCAG.json`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.allCombinations = data.kombinationer;
            
            // Initialize color filter
            this.initializeColorFilter();
            
            // Display all combinations initially
            this.displayCombinations('all');
        } catch (error) {
            console.error('Error loading color data:', error);
            this.showError('Kunde inte ladda färgdata. Kontrollera din internetanslutning.');
        }
    }
    
    initializeColorFilter() {
        const colors = new Set();
        
        this.allCombinations.forEach(comb => {
            colors.add(comb.color1);
            colors.add(comb.color2);
        });
        
        // Sort colors alphabetically
        const sortedColors = Array.from(colors).sort();
        
        // Add colors to filter
        sortedColors.forEach(color => {
            const option = document.createElement('option');
            option.value = color;
            option.textContent = color;
            this.filterSelect.appendChild(option);
        });
    }
    
    displayCombinations(filterColor) {
        // Clear current grid
        this.colorGrid.innerHTML = '';
        
        // Filter combinations
        const filtered = filterColor === 'all' 
            ? this.allCombinations 
            : this.allCombinations.filter(comb => 
                comb.color1 === filterColor || comb.color2 === filterColor);
        
        // Create and append cards
        filtered.forEach((comb, index) => {
            const card = this.createColorCard(comb, index);
            this.colorGrid.appendChild(card);
        });
    }
    
    createColorCard(combination, index) {
        const card = document.createElement('div');
        card.className = 'color-card';
        card.dataset.contrast = combination.wcagNiva || 'none';
        
        // Add animation delay
        card.style.animationDelay = `${index * 50}ms`;
        
        const preview = document.createElement('div');
        preview.className = 'color-preview';
        preview.style.backgroundColor = `rgb(${combination.color1Farg.join(',')})`;
        preview.style.color = `rgb(${combination.color2Farg.join(',')})`;
        
        const colorName = document.createElement('div');
        colorName.className = 'color-name';
        colorName.textContent = combination.color1;
        
        const textBox = document.createElement('div');
        textBox.className = 'text-box';
        textBox.textContent = combination.color2;
        textBox.style.backgroundColor = `rgb(${combination.color2Farg.join(',')})`;
        textBox.style.color = `rgb(${combination.color1Farg.join(',')})`;
        textBox.style.padding = '2px 6px';
        textBox.style.borderRadius = '10px';
        textBox.style.fontSize = '0.7rem';
        
        const info = document.createElement('div');
        info.className = 'color-info';
        info.innerHTML = `
            <div class="color-name">${combination.color2} på ${combination.color1}</div>
            <div class="color-contrast">Kontrast: ${combination.kontrast.toFixed(2)} (${combination.wcagNiva || 'Ej godkänd'})</div>
        `;
        
        preview.appendChild(colorName);
        preview.appendChild(textBox);
        
        card.appendChild(preview);
        card.appendChild(info);
        
        // Add tap/hold functionality
        let tapTimer;
        let isLongPress = false;
        
        const handleTap = (e) => {
            if (!isLongPress) {
                // Toggle between text and background colors
                const bgColor = preview.style.backgroundColor;
                const textColor = preview.style.color;
                
                preview.style.backgroundColor = textColor;
                preview.style.color = bgColor;
                textBox.style.backgroundColor = bgColor;
                textBox.style.color = textColor;
                
                // Update info text
                const temp = colorName.textContent;
                colorName.textContent = textBox.textContent;
                textBox.textContent = temp;
            }
            isLongPress = false;
        };
        
        card.addEventListener('touchstart', (e) => {
            isLongPress = false;
            tapTimer = setTimeout(() => {
                isLongPress = true;
                // Show more details or perform long press action
                this.showColorDetails(combination);
            }, 500);
        });
        
        card.addEventListener('touchend', () => {
            clearTimeout(tapTimer);
        });
        
        card.addEventListener('touchmove', () => {
            clearTimeout(tapTimer);
        });
        
        // For mouse users
        card.addEventListener('click', handleTap);
        
        return card;
    }
    
    showColorDetails(combination) {
        // This could be expanded to show a modal with more details
        const message = `
            ${combination.color1} på ${combination.color2}
            Kontrast: ${combination.kontrast.toFixed(2)}
            WCAG-nivå: ${combination.wcagNiva || 'Ej godkänd'}
            
            Tryck för att kopiera färgkod: ${combination.color1Farg.join(', ')}
        `;
        
        alert(message);
    }
    
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        this.colorGrid.appendChild(errorDiv);
    }
    
    setupEventListeners() {
        this.filterSelect.addEventListener('change', (e) => {
            this.displayCombinations(e.target.value);
        });
    }
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new ColorApp();
});
