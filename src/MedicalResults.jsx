import React, { useState, useEffect } from 'react';
import Client from 'fhir-kit-client';

const MedicalResults = () => {
  const [activeTab, setActiveTab] = useState('vitals');
  const [chemistryValues, setChemistryValues] = useState({});
  const [vitalsValues, setVitalsValues] = useState({
    temperature: '',
    height: '',
    weight: '',
    systolicBloodPressure: '',
    diastolicBloodPressure: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Initialize FHIR client
  const fhirClient = new Client({
    baseUrl: 'https://hapi.fhir.org/baseR4'
  });

  const chemistryFields = [
    { name: 'sodium', label: 'Sodium' },
    { name: 'potassium', label: 'Potassium' },
    { name: 'chloride', label: 'Chloride' },
    { name: 'carbonDioxide', label: 'Carbon Dioxide Total' },
    { name: 'urea', label: 'Urea Nitrogen, Blood (BUN)' },
    { name: 'creatinine', label: 'Creatinine Blood' },
    { name: 'glucose', label: 'Glucose' },
    { name: 'calcium', label: 'Calcium' },
    { name: 'protein', label: 'Protein' },
    { name: 'albumin', label: 'Albumin' },
    { name: 'alp', label: 'Alkaline Phosphatase (ALP)' },
    { name: 'ast', label: 'Aspartate Transaminase (AST)' },
    { name: 'bilirubinTotal', label: 'Bilirubin Total' },
    { name: 'alt', label: 'Alanine Transferase (ALT)' }
  ];

  const vitalsFields = [
    { name: 'temperature', label: 'Temperature', unit: '°F', loincCode: '8310-5' },
    { name: 'height', label: 'Height', unit: 'in', loincCode: '8302-2' },
    { name: 'weight', label: 'Weight', unit: 'lbs.', loincCode: '29463-7' },
    { name: 'systolicBloodPressure', label: 'Systolic Blood Pressure', unit: 'mm Hg', loincCode: '8480-6' },
    { name: 'diastolicBloodPressure', label: 'Diastolic Blood Pressure', unit: 'mm Hg', loincCode: '8462-4' }
  ];

  const dates = ['9/19/21 12:30', '9/19/21 10:00', '9/18/21 15:00', '9/18/21 11:00', '9/13/21 13:00'];

  // Function to fetch vital signs from FHIR server
  const fetchVitalSigns = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fhirClient.search({
        resourceType: 'Observation',
        searchParams: {
          category: 'vital-signs',
          // You can add patient ID when needed
          // patient: 'example-patient-id'
        }
      });
      
      // Process the response and update vital signs
      const observations = response.entry || [];
      const newVitalsValues = { ...vitalsValues };
      
      observations.forEach(obs => {
        const resource = obs.resource;
        const code = resource.code?.coding?.[0]?.code;
        const value = resource.valueQuantity?.value;
        
        // Map LOINC codes to our vital signs
        const vitalField = vitalsFields.find(field => field.loincCode === code);
        if (vitalField && value) {
          newVitalsValues[vitalField.name] = value.toString();
        }
      });
      
      setVitalsValues(newVitalsValues);
    } catch (error) {
      setError('Error fetching vital signs');
      console.error('Error fetching vital signs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to save vital signs to FHIR server
  const saveVitalSigns = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Save each vital sign as a separate observation
      for (const field of vitalsFields) {
        if (vitalsValues[field.name]) {
          const observation = {
            resourceType: 'Observation',
            status: 'preliminary',
            category: [{
              coding: [{
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'vital-signs',
                display: 'Vital Signs'
              }]
            }],
            code: {
              coding: [{
                system: 'http://loinc.org',
                code: field.loincCode,
                display: field.label
              }]
            },
            valueQuantity: {
              value: parseFloat(vitalsValues[field.name]),
              unit: field.unit,
              system: 'http://unitsofmeasure.org'
            }
          };

          await fhirClient.create({
            resourceType: 'Observation',
            body: observation
          });
        }
      }
      
      alert('Vital signs saved successfully!');
    } catch (error) {
      setError('Error saving vital signs');
      console.error('Error saving vital signs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChemistryChange = (field, date, value) => {
    setChemistryValues(prev => ({
      ...prev,
      [`${field}-${date}`]: value
    }));
  };

  const handleVitalsChange = (field, value) => {
    setVitalsValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Fetch vital signs when component mounts
  useEffect(() => {
    if (activeTab === 'vitals') {
      fetchVitalSigns();
    }
  }, [activeTab]);

  return (
    <div className="w-full min-h-screen bg-gray-100 p-4">
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
          {activeTab === 'results' && (
            <div className="pl-4 text-blue-600">CHEMISTRY</div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white p-4 shadow-md">
          {activeTab === 'vitals' ? (
            <div>
              <h2 className="text-xl font-bold mb-4">VITALS</h2>
              {error && <div className="text-red-500 mb-4">{error}</div>}
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
                  onClick={saveVitalSigns}
                  disabled={isLoading}
                  className={`mt-4 px-4 py-2 rounded ${
                    isLoading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-500 hover:bg-blue-600'
                  } text-white`}
                >
                  {isLoading ? 'Saving...' : 'Save Vital Signs'}
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
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalResults;