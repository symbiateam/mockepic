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

  // Load vitals from FHIR server
  const loadVitals = async () => {
    setIsLoading(true);
    try {
      const response = await fhirClient.search({
        resourceType: 'Observation',
        searchParams: {
          category: 'vital-signs',
          _sort: '-date',
          _count: 1
        }
      });

      if (response.entry && response.entry.length > 0) {
        const newVitals = {};
        response.entry.forEach(entry => {
          const observation = entry.resource;
          switch(observation.code?.coding?.[0]?.code) {
            case '8310-5': // Temperature
              newVitals.temperature = observation.valueQuantity?.value;
              break;
            case '8302-2': // Height
              newVitals.height = observation.valueQuantity?.value;
              break;
            case '29463-7': // Weight
              newVitals.weight = observation.valueQuantity?.value;
              break;
            case '8480-6': // Systolic BP
              newVitals.systolicBloodPressure = observation.valueQuantity?.value;
              break;
            case '8462-4': // Diastolic BP
              newVitals.diastolicBloodPressure = observation.valueQuantity?.value;
              break;
          }
        });
        setVitalsValues(newVitals);
      }
    } catch (err) {
      setError('Error loading vital signs');
      console.error(err);
    }
    setIsLoading(false);
  };

  // Save vitals to FHIR server
  const saveVitals = async () => {
    setIsLoading(true);
    try {
      // Save each vital sign as a separate observation
      const vitalsMap = [
        { 
          code: '8310-5',
          display: 'Body temperature',
          value: vitalsValues.temperature,
          unit: '°F'
        },
        {
          code: '8302-2',
          display: 'Body height',
          value: vitalsValues.height,
          unit: 'in'
        },
        {
          code: '29463-7',
          display: 'Body weight',
          value: vitalsValues.weight,
          unit: 'lbs'
        },
        {
          code: '8480-6',
          display: 'Systolic blood pressure',
          value: vitalsValues.systolicBloodPressure,
          unit: 'mm[Hg]'
        },
        {
          code: '8462-4',
          display: 'Diastolic blood pressure',
          value: vitalsValues.diastolicBloodPressure,
          unit: 'mm[Hg]'
        }
      ];

      for (const vital of vitalsMap) {
        if (vital.value) {
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
                code: vital.code,
                display: vital.display
              }]
            },
            valueQuantity: {
              value: parseFloat(vital.value),
              unit: vital.unit,
              system: 'http://unitsofmeasure.org'
            }
          };

          await fhirClient.create({
            resourceType: 'Observation',
            body: observation
          });
        }
      }
      alert('Vital signs saved successfully to FHIR server!');
    } catch (err) {
      setError('Error saving vital signs');
      console.error(err);
    }
    setIsLoading(false);
  };

  // Load data when component mounts
  useEffect(() => {
    if (activeTab === 'vitals') {
      loadVitals();
    }
  }, [activeTab]);

  // Rest of your component code remains the same...
  
  return (
    <div className="w-full min-h-screen bg-gray-100 p-4">
      {/* Your existing JSX with added loading states */}
      {isLoading && <div className="fixed top-0 left-0 w-full bg-blue-500 text-white p-2 text-center">Loading...</div>}
      {error && <div className="fixed top-0 left-0 w-full bg-red-500 text-white p-2 text-center">{error}</div>}
      
      {/* Rest of your JSX remains the same, but update the save button onClick */}
      {/* In the vitals section, change the save button to: */}
      <button
        onClick={saveVitals}
        disabled={isLoading}
        className={`mt-4 px-4 py-2 rounded ${
          isLoading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-500 hover:bg-blue-600'
        } text-white`}
      >
        {isLoading ? 'Saving...' : 'Save to FHIR Server'}
      </button>
    </div>
  );
};

export default MedicalResults;