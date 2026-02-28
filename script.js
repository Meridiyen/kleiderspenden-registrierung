// script.js - Vanilla JS: Form-Handling, Validierung, PLZ-Check, Schutz vor einfacher Injection
(() => {
    const form = document.getElementById('donationForm');
    const modeRadios = document.getElementsByName('mode');
    const pickupFields = document.getElementById('pickup-fields');
    const officeInfo = document.getElementById('office-info');
    const validateBtn = document.getElementById('validateBtn');
    const message = document.getElementById('formMessage');
  
    // Geschäftsstellen-PLZ (erste 2 Ziffern) - Simulierter fixer Wert
    const officePostcodePrefix = '10'; // z.B. 10115 => '10' (anpasbar)
  
    function getSelectedMode(){
      return Array.from(modeRadios).find(r => r.checked).value;
    }
  
    function showHideFields(){
      const mode = getSelectedMode();
      if (mode === 'pickup'){
        pickupFields.classList.remove('hidden');
        officeInfo.classList.add('hidden');
      } else {
        pickupFields.classList.add('hidden');
        officeInfo.classList.remove('hidden');
      }
      message.textContent = '';
    }
  
    // einfache HTML-Escape-Funktion → schützt vor direkter HTML-Injection bei Anzeige
    function escapeHtml(str){
      if (str === undefined || str === null) return '';
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }
  
    // PLZ-Prüfung: erste zwei Zeichen müssen gleich
    function checkPostcodePrefix(inputPostcode){
      if (!inputPostcode) return false;
      const clean = inputPostcode.trim();
      if (clean.length < 2) return false;
      return clean.slice(0,2) === officePostcodePrefix;
    }
  
    // Formularvalidierung
    function validateForm(data){
      const errors = [];
  
      if (!data.clothingType) errors.push('Bitte Art der Kleidung auswählen.');
      if (!data.crisis) errors.push('Bitte ein Krisengebiet auswählen.');
  
      if (data.mode === 'pickup'){
        if (!data.address || !data.address.trim()) errors.push('Bitte Abholadresse eingeben.');
        if (!data.postcode || !/^\d{5}$/.test(data.postcode.trim())) errors.push('Bitte eine gültige 5-stellige PLZ eingeben.');
        else if (!checkPostcodePrefix(data.postcode.trim())) errors.push('Die PLZ liegt nicht in der Nähe der Geschäftsstelle (erste zwei Ziffern müssen übereinstimmen).');
      }
  
      return errors;
    }
  
    // sammle Formdaten
    function collectData(){
      const mode = getSelectedMode();
      return {
        mode,
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        clothingType: document.getElementById('clothingType').value,
        crisis: document.getElementById('crisis').value,
        address: document.getElementById('address') ? document.getElementById('address').value.trim() : '',
        postcode: document.getElementById('postcode') ? document.getElementById('postcode').value.trim() : '',
        timestamp: new Date().toISOString()
      };
    }
  
    // auf "Registrierung prüfen"
    validateBtn.addEventListener('click', (e) => {
      const data = collectData();
      const errors = validateForm(data);
      if (errors.length){
        message.textContent = errors.join(' ');
        message.style.color = '#b45309';
      } else {
        message.textContent = 'Alles gut — Formular ist valide.';
        message.style.color = '#059669';
      }
    });
  
    // beim Absenden: validieren -> in sessionStorage speichern -> weiterleiten
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = collectData();
      const errors = validateForm(data);
      if (errors.length){
        message.textContent = errors.join(' ');
        message.style.color = '#b45309';
        // Fokus auf erstes Feld für Fehler (optional)
        const el = form.querySelector('input, select, textarea');
        if (el) el.focus();
        return;
      }
  
      // Speichere die Daten sicher (als JSON string) in sessionStorage
      // Achtung: sessionStorage ist lokal im Browser
      sessionStorage.setItem('kleiderspende', JSON.stringify(data));
  
      // Weiterleitung zur Bestätigungsseite
      window.location.href = 'confirm.html';
    });
  
    // Reagiere auf Wechsel von Übergabeart
    Array.from(modeRadios).forEach(r => r.addEventListener('change', showHideFields));
    // Initial
    showHideFields();
  })();