const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'src', 'locales');

const translations = {
  pt: {
    "chooseFlavor": "escolher sabor:",
    "optionsAvailable": "{{count}} opções disponíveis"
  },
  en: {
    "chooseFlavor": "choose flavor:",
    "optionsAvailable": "{{count}} options available"
  },
  es: {
    "chooseFlavor": "elegir sabor:",
    "optionsAvailable": "{{count}} opciones disponibles"
  },
  de: {
    "chooseFlavor": "geschmack wählen:",
    "optionsAvailable": "{{count}} optionen verfügbar"
  },
  fr: {
    "chooseFlavor": "choisir la saveur :",
    "optionsAvailable": "{{count}} options disponibles"
  }
};

const langs = ['pt', 'en', 'es', 'de', 'fr'];

langs.forEach(lang => {
  const filePath = path.join(localesDir, `${lang}.json`);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Add to productPage object
    if (!data.productPage) data.productPage = {};
    
    data.productPage.chooseFlavor = translations[lang].chooseFlavor;
    data.productPage.optionsAvailable = translations[lang].optionsAvailable;
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Updated ${lang}.json`);
  }
});
