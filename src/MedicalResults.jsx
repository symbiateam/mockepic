import React, { useState, useEffect } from 'react';

const MedicalResults = () => {
  const [activeTab, setActiveTab] = useState('vitals');
  const [docRefs, setDocRefs] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chemistryValues, setChemistryValues] = useState({});
  const [vitalsValues, setVitalsValues] = useState({
    temperature: '',
    height: '',
    weight: '',
    systolicBloodPressure: '',
    diastolicBloodPressure: ''
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const chemistryFields = [
    { name: 'sodium', label: 'Sodium', code: '2951-2', unit: 'mmol/L' },
    { name: 'potassium', label: 'Potassium', code: '2823-3', unit: 'mmol/L' },
    { name: 'chloride', label: 'Chloride', code: '2075-0', unit: 'mmol/L' },
    { name: 'carbonDioxide', label: 'Carbon Dioxide Total', code: '2028-9', unit: 'mmol/L' },
    { name: 'urea', label: 'Urea Nitrogen, Blood (BUN)', code: '3094-0', unit: 'mg/dL' },
    { name: 'creatinine', label: 'Creatinine Blood', code: '2160-0', unit: 'mg/dL' },
    { name: 'glucose', label: 'Glucose', code: '2339-0', unit: 'mg/dL' },
    { name: 'calcium', label: 'Calcium', code: '17861-6', unit: 'mg/dL' },
    { name: 'protein', label: 'Protein', code: '2885-2', unit: 'g/dL' },
    { name: 'albumin', label: 'Albumin', code: '1751-7', unit: 'g/dL' },
    { name: 'alp', label: 'Alkaline Phosphatase (ALP)', code: '6768-6', unit: 'U/L' },
    { name: 'ast', label: 'Aspartate Transaminase (AST)', code: '1920-8', unit: 'U/L' },
    { name: 'bilirubinTotal', label: 'Bilirubin Total', code: '1975-2', unit: 'mg/dL' },
    { name: 'alt', label: 'Alanine Transferase (ALT)', code: '1742-6', unit: 'U/L' }
  ];

  const vitalsFields = [
    { name: 'temperature', label: 'Temperature', unit: '°F', code: '8310-5', display: 'Body temperature' },
    { name: 'height', label: 'Height', unit: 'in', code: '8302-2', display: 'Body height' },
    { name: 'weight', label: 'Weight', unit: 'lbs.', code: '29463-7', display: 'Body weight' },
    { name: 'systolicBloodPressure', label: 'Systolic Blood Pressure', unit: 'mm Hg', code: '8480-6', display: 'Systolic blood pressure' },
    { name: 'diastolicBloodPressure', label: 'Diastolic Blood Pressure', unit: 'mm Hg', code: '8462-4', display: 'Diastolic blood pressure' }
  ];

  const dates = ['9/19/21 12:30', '9/19/21 10:00', '9/18/21 15:00', '9/18/21 11:00', '9/13/21 13:00'];

  useEffect(() => {
    // Load saved data from localStorage
    const savedVitals = localStorage.getItem('vitals');
    const savedChemistry = localStorage.getItem('chemistry');
    
    if (savedVitals) setVitalsValues(JSON.parse(savedVitals));
    if (savedChemistry) setChemistryValues(JSON.parse(savedChemistry));
    
    if (activeTab === 'vitals') {
      loadVitals();
    } else {
      loadChemistry();
    }
  }, [activeTab]);

  // Load vitals from FHIR server
  const loadVitals = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://mockepic.onrender.com');
      const data = await response.json();
      const newVitals = {};
      data.forEach(observation => {
        const matchingField = vitalsFields.find(field => field.code === observation.code?.coding?.[0]?.code);
        if (matchingField) {
          newVitals[matchingField.name] = observation.valueQuantity?.value?.toString() || '';
        }
      });
      setVitalsValues(prev => ({
        ...prev,
        ...newVitals
      }));
    } catch (err) {
      setError('Error loading vital signs');
      console.error(err);
    }
    setIsLoading(false);
  };

  const saveVitals = async () => {
    try {
      // We'll build an array of Observations, one for each vital
      const observationsToSend = [];
  
      // Temperature (LOINC: 8310-5)
      if (vitalsValues.temperature) {
        observationsToSend.push({
          resourceType: 'Observation',
          status: 'final',
          code: {
            coding: [
              {
                system: 'http://loinc.org',
                code: '8310-5',
                display: 'Body temperature'
              }
            ]
          },
          subject: {
            reference: 'Patient/example' // You can replace "example" with a real Patient ID if you have one
          },
          effectiveDateTime: new Date().toISOString(),
          valueQuantity: {
            value: parseFloat(vitalsValues.temperature),
            unit: '°F',
            system: 'http://unitsofmeasure.org',
            code: 'degF'
          }
        });
      }
  
      // Height (LOINC: 8302-2)
      if (vitalsValues.height) {
        observationsToSend.push({
          resourceType: 'Observation',
          status: 'final',
          code: {
            coding: [
              {
                system: 'http://loinc.org',
                code: '8302-2',
                display: 'Body height'
              }
            ]
          },
          subject: {
            reference: 'Patient/example'
          },
          effectiveDateTime: new Date().toISOString(),
          valueQuantity: {
            value: parseFloat(vitalsValues.height),
            unit: 'in',
            system: 'http://unitsofmeasure.org'
          }
        });
      }
  
      // Weight (LOINC: 29463-7)
      if (vitalsValues.weight) {
        observationsToSend.push({
          resourceType: 'Observation',
          status: 'final',
          code: {
            coding: [
              {
                system: 'http://loinc.org',
                code: '29463-7',
                display: 'Body weight'
              }
            ]
          },
          subject: {
            reference: 'Patient/example'
          },
          effectiveDateTime: new Date().toISOString(),
          valueQuantity: {
            value: parseFloat(vitalsValues.weight),
            unit: 'lbs.',
            system: 'http://unitsofmeasure.org'
          }
        });
      }
  
      // Systolic Blood Pressure (LOINC: 8480-6)
      if (vitalsValues.systolicBloodPressure) {
        observationsToSend.push({
          resourceType: 'Observation',
          status: 'final',
          code: {
            coding: [
              {
                system: 'http://loinc.org',
                code: '8480-6',
                display: 'Systolic blood pressure'
              }
            ]
          },
          subject: {
            reference: 'Patient/example'
          },
          effectiveDateTime: new Date().toISOString(),
          valueQuantity: {
            value: parseFloat(vitalsValues.systolicBloodPressure),
            unit: 'mmHg',
            system: 'http://unitsofmeasure.org'
          }
        });
      }
  
      // Diastolic Blood Pressure (LOINC: 8462-4)
      if (vitalsValues.diastolicBloodPressure) {
        observationsToSend.push({
          resourceType: 'Observation',
          status: 'final',
          code: {
            coding: [
              {
                system: 'http://loinc.org',
                code: '8462-4',
                display: 'Diastolic blood pressure'
              }
            ]
          },
          subject: {
            reference: 'Patient/example'
          },
          effectiveDateTime: new Date().toISOString(),
          valueQuantity: {
            value: parseFloat(vitalsValues.diastolicBloodPressure),
            unit: 'mmHg',
            system: 'http://unitsofmeasure.org'
          }
        });
      }
  
      // Now POST each Observation to your Node server (which then forwards to FHIR, presumably)
      for (const obs of observationsToSend) {
        const response = await fetch('https://mockepic.onrender.com/fhir/Observation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/fhir+json',
            'Accept': 'application/fhir+json'
          },
          body: JSON.stringify(obs)
        });
  
        if (!response.ok) {
          // Check if there's a more detailed error message:
          const errorText = await response.text();
          console.error('Failed to create observation:', errorText);
          throw new Error(`Failed to create observation: ${errorText}`);
        }
      }
  
      // Store the raw input in localStorage (optional)
      localStorage.setItem('vitals', JSON.stringify(vitalsValues));
      setSaveSuccess(true); // Show "Save successful" message
    } catch (err) {
      console.error(err);
      setError('Error saving vitals');
    }
  };  
  

  const loadChemistry = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://mockepic.onrender.com');
      const data = await response.json();
      const newChemistry = {};
      data.forEach(observation => {
        const matchingField = chemistryFields.find(field => field.code === observation.code?.coding?.[0]?.code);
        if (matchingField) {
          newChemistry[matchingField.name] = observation.valueQuantity?.value?.toString() || '';
        }
      });
      setChemistryValues(newChemistry);
    } catch (err) {
      setError('Error loading chemistry values');
      console.error(err);
    }
    setIsLoading(false);
  };

  function parseToISODate(dateString) {
    // dateString might be "9/19/21 12:30"
    // This is a naive parse. Adjust if your date/time format differs.
    const [mdy, hm] = dateString.split(' ');        // ["9/19/21", "12:30"]
    const [month, day, year] = mdy.split('/');      // ["9", "19", "21"]
    const [hour, minute] = hm.split(':');           // ["12", "30"]
  
    // Guess that "21" means 2021
    const fullYear = '20' + year;    // "2021"
    const dateObj = new Date(fullYear, month - 1, day, hour, minute);
  
    // If the date parse fails, fallback to "new Date()" or handle differently
    if (isNaN(dateObj.getTime())) {
      return new Date().toISOString();
    }
    return dateObj.toISOString();
  }

  const saveChemistry = async () => {
    try {
      // We'll gather all Observations in an array
      const labsToSend = [];
  
      // For each lab test definition (sodium, potassium, etc.)
      chemistryFields.forEach((field) => {
        // For each date in your dates array
        dates.forEach((date) => {
          // The user input is stored in chemistryValues["<fieldName>-<dateString>"]
          const val = chemistryValues[`${field.name}-${date}`];
          if (val) {
            // Build a FHIR Observation
            const observation = {
              resourceType: 'Observation',
              status: 'final',
              code: {
                coding: [
                  {
                    system: 'http://loinc.org',
                    code: field.code,
                    display: field.label
                  }
                ]
              },
              subject: {
                reference: 'Patient/example' 
                // You can replace "example" with a real Patient ID if you have one
              },
              effectiveDateTime: parseToISODate(date), // Convert '9/19/21 12:30' to an ISO string
              valueQuantity: {
                value: parseFloat(val),
                unit: field.unit,
                system: 'http://unitsofmeasure.org'
                // code could be 'mmol/L', 'mg/dL', etc. if you want to be very precise
              }
            };
  
            labsToSend.push(observation);
          }
        });
      });
  
      // Now send each built Observation to your Node server
      for (const obs of labsToSend) {
        const response = await fetch('https://mockepic.onrender.com/fhir/Observation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/fhir+json',
            'Accept': 'application/fhir+json'
          },
          body: JSON.stringify(obs)
        });
  
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to create lab Observation:', errorText);
          throw new Error(`Failed to create lab Observation: ${errorText}`);
        }
      }
  
      // Optionally save input data locally
      localStorage.setItem('chemistry', JSON.stringify(chemistryValues));
      setSaveSuccess(true);  // e.g., show "Save successful!"
    } catch (err) {
      console.error(err);
      setError('Error saving chemistry values');
    }
  };  

  const handleVitalsChange = (field, value) => {
    setVitalsValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 p-4">
      {isLoading && <div className="fixed top-0 left-0 w-full bg-blue-500 text-white p-2 text-center">Loading...</div>}
      {error && <div className="fixed top-0 left-0 w-full bg-red-500 text-white p-2 text-center">{error}</div>}
      {saveSuccess && <div className="fixed top-0 left-0 w-full bg-green-500 text-white p-2 text-center">Save successful!</div>}
      
      {/* Top Navigation */}
      <div className="bg-gray-200 mb-4 flex">
        <button 
          className={`px-4 py-2 ${activeTab === 'vitals' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
          onClick={() => setActiveTab('vitals')}
        >
          Vitals
        </button>
        <button 
          className={`px-4 py-2 ${activeTab === 'results' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
          onClick={() => setActiveTab('results')}
        >
          Results
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-48 bg-white p-4 mr-4 shadow-md">
          <div className="font-bold mb-2">
            {activeTab === 'vitals' ? 'VITALS' : 'LABORATORY'}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white p-4 shadow-md">
          {activeTab === 'vitals' ? (
            <div>
              <h2 className="text-xl font-bold mb-4">VITALS</h2>
              <div className="space-y-4">
                {vitalsFields.map(field => (
                  <div key={field.name} className="flex items-center border-b py-3">
                    <label className="w-48 text-gray-700">{field.label}</label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        className="border p-2 w-32 rounded"
                        value={vitalsValues[field.name]}
                        onChange={(e) => handleVitalsChange(field.name, e.target.value)}
                        disabled={isLoading}
                      />
                      <span className="ml-2 text-gray-500">{field.unit}</span>
                    </div>
                  </div>
                ))}
                <button
                  onClick={saveVitals}
                  disabled={isLoading}
                  className={`mt-4 px-4 py-2 rounded ${
                    isLoading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-500 hover:bg-blue-600'
                  } text-white`}
                >
                  {isLoading ? 'Saving...' : 'Save Vitals'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold mb-4">CHEMISTRY PANELS</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left p-2 border-b">Test</th>
                      {dates.map(date => (
                        <th key={date} className="p-2 border-b text-center w-32">{date}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {chemistryFields.map(field => (
                      <tr key={field.name} className="hover:bg-blue-50">
                        <td className="p-2 border-b">{field.label}</td>
                        {dates.map(date => (
                          <td key={date} className="p-2 border-b text-center bg-blue-50/30">
                            <div className="flex items-center justify-center">
                              <div className="w-1 h-4 bg-blue-500 mx-2"></div>
                              <input
                                type="text"
                                className="w-16 p-1 text-center border-none bg-transparent"
                                value={chemistryValues[`${field.name}-${date}`] || ''}
                                onChange={(e) => handleChemistryChange(field.name, date, e.target.value)}
                              />
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  onClick={saveChemistry}
                  disabled={isLoading}
                  className={`mt-4 px-4 py-2 rounded ${
                    isLoading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-500 hover:bg-blue-600'
                    } text-white`}
                  >
                    {isLoading ? 'Saving...' : 'Save Labs'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalResults;