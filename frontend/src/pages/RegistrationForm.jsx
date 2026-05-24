import { useState } from 'react'
import axios from 'axios'

export default function RegistrationForm() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    // Login Account
    create_account: false,
    email: '',
    password: '',
    password_confirm: '',

    // Teilnehmer
    tn_familienname: '',
    tn_vorname: '',
    tn_strasse: '',
    tn_plz: '',
    tn_ort: '',
    tn_geburtsdatum: '',
    tn_geschlecht: 'männlich',
    tn_telefon: '',
    tn_email: '',
    tn_konfession: '',

    // Sorgeberechtigte
    sorge_anrede: 'Herr',
    sorge_familienname: '',
    sorge_vorname: '',
    sorge_strasse: '',
    sorge_plz: '',
    sorge_ort: '',
    sorge_telefon_festnetz: '',
    sorge_telefon_mobil: '',
    sorge_email: '',
    sorge_beruf: '',

    // Notfallkontakt
    notfall_name: '',
    notfall_telefon: '',
    notfall_beziehung: '',

    // Krankenversicherung
    krankenkasse: '',
    versicherten_nr: '',
    kk_karte_mitgebracht: false,
    hausarztmodell: false,
    hausarzt: '',

    // Gesundheit
    allergien: '',
    vegetarier: false,
    vegan: false,
    kein_schweinefleisch: false,
    medikamente: '',
    erkrankungen: '',
    besonderheiten: '',

    // Schwimmen
    schwimmer: false,
    schwimm_erlaubnis: false,

    // Einwilligungen
    foto_einwilligung: false,
    rki_gelesen: false,
    gesundheit_bestaetigung: false,
    medikamente_gabe_erlaubnis: false,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate passwords if creating account
      if (formData.create_account) {
        if (!formData.email || !formData.password) {
          setError('Email und Passwort erforderlich')
          setLoading(false)
          return
        }
        if (formData.password !== formData.password_confirm) {
          setError('Passwörter stimmen nicht überein')
          setLoading(false)
          return
        }
        if (formData.password.length < 6) {
          setError('Passwort muss mindestens 6 Zeichen lang sein')
          setLoading(false)
          return
        }
      }

      const response = await axios.post('https://lagerbank.info/api/registrations/', formData)
      setSuccess(true)
      setTimeout(() => {
        window.location.href = '/login'
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || 'Anmeldung fehlgeschlagen')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-2 text-center">BULA2026 Anmeldung</h1>
        <p className="text-center text-gray-600 mb-8">Jugend-Zeltlager Anmeldung</p>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 text-green-700 p-4 rounded mb-6">
            ✓ Anmeldung erfolgreich! Leitung zu Login...
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4, 5].map(s => (
              <button
                key={s}
                onClick={() => setStep(s)}
                className={`w-12 h-12 rounded-full font-semibold ${
                  s === step
                    ? 'bg-blue-600 text-white'
                    : s < step
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <p className="text-center text-sm text-gray-600">Schritt {step} von 5</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Teilnehmer */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Login Account Section */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <label className="flex items-center gap-3 cursor-pointer mb-4">
                  <input
                    type="checkbox"
                    name="create_account"
                    checked={formData.create_account}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <span className="font-semibold text-navy">Ich möchte einen Login-Account erstellen</span>
                </label>

                {formData.create_account && (
                  <div className="space-y-3 ml-7">
                    <div>
                      <label className="block text-sm font-medium mb-1">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Passwort *</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        placeholder="Mindestens 6 Zeichen"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Passwort wiederholen *</label>
                      <input
                        type="password"
                        name="password_confirm"
                        value={formData.password_confirm}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        placeholder="Passwort bestätigen"
                      />
                    </div>
                  </div>
                )}
              </div>

              <h2 className="text-xl font-semibold mb-4">Persönliche Daten Teilnehmer</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Familienname *</label>
                  <input
                    type="text"
                    name="tn_familienname"
                    value={formData.tn_familienname}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Vorname *</label>
                  <input
                    type="text"
                    name="tn_vorname"
                    value={formData.tn_vorname}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Geburtsdatum *</label>
                <input
                  type="date"
                  name="tn_geburtsdatum"
                  value={formData.tn_geburtsdatum}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Geschlecht *</label>
                <select
                  name="tn_geschlecht"
                  value={formData.tn_geschlecht}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                >
                  <option>männlich</option>
                  <option>weiblich</option>
                  <option>divers</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="tn_strasse"
                  placeholder="Straße"
                  value={formData.tn_strasse}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 rounded"
                />
                <input
                  type="text"
                  name="tn_plz"
                  placeholder="PLZ"
                  value={formData.tn_plz}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 rounded"
                />
              </div>

              <input
                type="text"
                name="tn_ort"
                placeholder="Ort"
                value={formData.tn_ort}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="email"
                  name="tn_email"
                  placeholder="Email"
                  value={formData.tn_email}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 rounded"
                />
                <input
                  type="tel"
                  name="tn_telefon"
                  placeholder="Telefon"
                  value={formData.tn_telefon}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 rounded"
                />
              </div>
            </div>
          )}

          {/* Step 2: Sorgeberechtigte */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Sorgeberechtigte Daten</h2>

              <select
                name="sorge_anrede"
                value={formData.sorge_anrede}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              >
                <option>Herr</option>
                <option>Frau</option>
                <option>Divers</option>
              </select>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="sorge_familienname"
                  placeholder="Familienname *"
                  value={formData.sorge_familienname}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 rounded"
                  required
                />
                <input
                  type="text"
                  name="sorge_vorname"
                  placeholder="Vorname *"
                  value={formData.sorge_vorname}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 rounded"
                  required
                />
              </div>

              <input
                type="text"
                name="sorge_strasse"
                placeholder="Straße *"
                value={formData.sorge_strasse}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="sorge_plz"
                  placeholder="PLZ *"
                  value={formData.sorge_plz}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 rounded"
                  required
                />
                <input
                  type="text"
                  name="sorge_ort"
                  placeholder="Ort *"
                  value={formData.sorge_ort}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 rounded"
                  required
                />
              </div>

              <input
                type="email"
                name="sorge_email"
                placeholder="Email (wird zum Login) *"
                value={formData.sorge_email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="tel"
                  name="sorge_telefon_festnetz"
                  placeholder="Telefon Festnetz"
                  value={formData.sorge_telefon_festnetz}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 rounded"
                />
                <input
                  type="tel"
                  name="sorge_telefon_mobil"
                  placeholder="Telefon Mobil *"
                  value={formData.sorge_telefon_mobil}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 rounded"
                  required
                />
              </div>

              <input
                type="text"
                name="sorge_beruf"
                placeholder="Beruf"
                value={formData.sorge_beruf}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
          )}

          {/* Step 3: Notfall + Krankenversicherung */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Notfall & Gesundheit</h2>

              <div>
                <h3 className="font-semibold mb-2">Notfallkontakt</h3>
                <input
                  type="text"
                  name="notfall_name"
                  placeholder="Name *"
                  value={formData.notfall_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded mb-2"
                  required
                />
                <input
                  type="tel"
                  name="notfall_telefon"
                  placeholder="Telefon *"
                  value={formData.notfall_telefon}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded mb-2"
                  required
                />
                <input
                  type="text"
                  name="notfall_beziehung"
                  placeholder="Beziehung zum Kind"
                  value={formData.notfall_beziehung}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>

              <div>
                <h3 className="font-semibold mb-2">Krankenversicherung</h3>
                <input
                  type="text"
                  name="krankenkasse"
                  placeholder="Krankenkasse *"
                  value={formData.krankenkasse}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded mb-2"
                  required
                />
                <input
                  type="text"
                  name="versicherten_nr"
                  placeholder="Versicherten-Nr."
                  value={formData.versicherten_nr}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded mb-2"
                />
                <label className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    name="kk_karte_mitgebracht"
                    checked={formData.kk_karte_mitgebracht}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Krankenversichertenkarte wird mitgebracht
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="hausarztmodell"
                    checked={formData.hausarztmodell}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Hausarztmodell
                </label>
              </div>

              <textarea
                name="hausarzt"
                placeholder="Hausarzt-Daten (Name, Adresse, Telefon)"
                value={formData.hausarzt}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                rows="3"
              />
            </div>
          )}

          {/* Step 4: Gesundheit */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Gesundheit & Ernährung</h2>

              <textarea
                name="allergien"
                placeholder="Allergien & Unverträglichkeiten"
                value={formData.allergien}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                rows="2"
              />

              <div>
                <h3 className="font-semibold mb-2">Ernährung</h3>
                <label className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    name="vegetarier"
                    checked={formData.vegetarier}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Vegetarisch
                </label>
                <label className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    name="vegan"
                    checked={formData.vegan}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Vegan
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="kein_schweinefleisch"
                    checked={formData.kein_schweinefleisch}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Kein Schweinefleisch
                </label>
              </div>

              <textarea
                name="medikamente"
                placeholder="Medikamente (Name, Dosierung, Zeiten)"
                value={formData.medikamente}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                rows="2"
              />

              <textarea
                name="erkrankungen"
                placeholder="Erkrankungen / Beeinträchtigungen"
                value={formData.erkrankungen}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                rows="2"
              />

              <textarea
                name="besonderheiten"
                placeholder="Besonderheiten / Sonstiges"
                value={formData.besonderheiten}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                rows="2"
              />

              <div>
                <h3 className="font-semibold mb-2">Schwimmen</h3>
                <label className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    name="schwimmer"
                    checked={formData.schwimmer}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Schwimmer
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="schwimm_erlaubnis"
                    checked={formData.schwimm_erlaubnis}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Schwimm-Erlaubnis
                </label>
              </div>
            </div>
          )}

          {/* Step 5: Einwilligungen */}
          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Einwilligungen</h2>

              <label className="flex items-start mb-3">
                <input
                  type="checkbox"
                  name="foto_einwilligung"
                  checked={formData.foto_einwilligung}
                  onChange={handleChange}
                  className="mr-2 mt-1"
                  required
                />
                <span>Ich erlaube, dass Fotos meines Kindes für Dokumentation und Öffentlichkeitsarbeit verwendet werden dürfen.</span>
              </label>

              <label className="flex items-start mb-3">
                <input
                  type="checkbox"
                  name="rki_gelesen"
                  checked={formData.rki_gelesen}
                  onChange={handleChange}
                  className="mr-2 mt-1"
                  required
                />
                <span>RKI-Empfehlungen gelesen und beachtet</span>
              </label>

              <label className="flex items-start mb-3">
                <input
                  type="checkbox"
                  name="gesundheit_bestaetigung"
                  checked={formData.gesundheit_bestaetigung}
                  onChange={handleChange}
                  className="mr-2 mt-1"
                  required
                />
                <span>Mein Kind ist gesund und kann am Zeltlager teilnehmen. Ich informiere bei Änderungen.</span>
              </label>

              <label className="flex items-start mb-3">
                <input
                  type="checkbox"
                  name="medikamente_gabe_erlaubnis"
                  checked={formData.medikamente_gabe_erlaubnis}
                  onChange={handleChange}
                  className="mr-2 mt-1"
                  required
                />
                <span>Betreuer dürfen die angegebenen Medikamente verabreichen.</span>
              </label>

              <p className="text-sm text-gray-600 border-t pt-4">
                Mit dem Absenden akzeptiere ich die Datenschutzerklärung und Allgemeinen Bedingungen.
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={() => setStep(Math.max(1, step - 1))}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              disabled={step === 1}
            >
              Zurück
            </button>

            {step === 5 ? (
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Wird gesendet...' : '✓ Anmeldung abschließen'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Weiter →
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
