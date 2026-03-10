/**
 * Gemini AI Service
 * Handles AI-powered symptom analysis using Google's Gemini API
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Analyze symptoms using Gemini AI
 * @param {string} symptoms - Description of symptoms from the patient
 * @returns {Object} Analysis result with possible conditions, urgency level, and recommendations
 */
async function analyzeSymptoms(symptoms) {
    try {
        // Check if API key is configured
        if (!process.env.GEMINI_API_KEY) {
            console.warn('GEMINI_API_KEY not configured, using fallback analysis');
            return getFallbackAnalysis(symptoms);
        }

        // Get the generative model
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-preview-05-20' });

        // Create the prompt for symptom analysis
        const prompt = `You are a medical AI assistant. Analyze the following symptoms and provide a structured health assessment.

PATIENT SYMPTOMS:
"${symptoms}"

Please provide your analysis in the following JSON format ONLY (no additional text):
{
    "possibleConditions": [
        {
            "name": "Condition name",
            "probability": 70,
            "description": "Brief description of the condition"
        }
    ],
    "urgencyLevel": "low|medium|high|emergency",
    "urgencyMessage": "A clear message explaining the urgency level and whether the patient should consult a doctor",
    "recommendations": ["List of health recommendations"],
    "shouldConsultDoctor": true,
    "consultationMessage": "Specific advice about consulting a healthcare professional"
}

IMPORTANT GUIDELINES:
- urgencyLevel should be "emergency" for life-threatening symptoms (chest pain, difficulty breathing, severe bleeding)
- urgencyLevel should be "high" for symptoms requiring prompt medical attention within 24 hours
- urgencyLevel should be "medium" for symptoms that need attention within a few days
- urgencyLevel should be "low" for minor symptoms that can be managed at home
- Always recommend consulting a doctor for any concerning symptoms
- Be helpful but always include a disclaimer that this is not a replacement for professional medical advice
- Provide 2-5 possible conditions with reasonable probability estimates (0-100)
- Provide 3-5 actionable recommendations

Respond ONLY with the JSON object, no other text.`;

        // Generate content
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse the JSON response
        let analysis;
        try {
            // Clean up the response - remove markdown code blocks if present
            let cleanText = text.trim();
            if (cleanText.startsWith('```json')) {
                cleanText = cleanText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
            } else if (cleanText.startsWith('```')) {
                cleanText = cleanText.replace(/^```\n?/, '').replace(/\n?```$/, '');
            }

            analysis = JSON.parse(cleanText);
        } catch (parseError) {
            console.error('Error parsing Gemini response:', parseError);
            console.log('Raw response:', text);
            return getFallbackAnalysis(symptoms);
        }

        // Validate and normalize the response
        const validatedAnalysis = {
            possibleConditions: Array.isArray(analysis.possibleConditions)
                ? analysis.possibleConditions.slice(0, 5).map(c => ({
                    name: c.name || 'Unknown condition',
                    probability: Math.min(100, Math.max(0, c.probability || 50)),
                    description: c.description || ''
                }))
                : [],
            urgencyLevel: ['low', 'medium', 'high', 'emergency'].includes(analysis.urgencyLevel)
                ? analysis.urgencyLevel
                : 'low',
            urgencyMessage: analysis.urgencyMessage || getDefaultUrgencyMessage(analysis.urgencyLevel),
            recommendations: Array.isArray(analysis.recommendations)
                ? analysis.recommendations.slice(0, 5)
                : ['Monitor your symptoms', 'Rest and stay hydrated'],
            shouldConsultDoctor: analysis.shouldConsultDoctor !== false,
            consultationMessage: analysis.consultationMessage || 'Please consider consulting a healthcare professional for proper diagnosis and treatment.',
            disclaimer: 'This AI-powered analysis is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.'
        };

        return validatedAnalysis;

    } catch (error) {
        console.error('Error in Gemini symptom analysis:', error);
        return getFallbackAnalysis(symptoms);
    }
}

/**
 * Get default urgency message based on level
 */
function getDefaultUrgencyMessage(level) {
    const messages = {
        emergency: '⚠️ EMERGENCY: These symptoms require immediate medical attention. Please call emergency services or go to the nearest emergency room immediately.',
        high: '🔴 HIGH URGENCY: Please consult a doctor within the next 24 hours. These symptoms need prompt medical evaluation.',
        medium: '🟠 MODERATE URGENCY: We recommend scheduling an appointment with your doctor within the next few days.',
        low: '🟢 LOW URGENCY: Your symptoms appear to be minor, but monitor them closely and consult a doctor if they worsen or persist.'
    };
    return messages[level] || messages.low;
}

/**
 * Fallback analysis when Gemini is unavailable
 */
function getFallbackAnalysis(symptoms) {
    const symptomsLower = symptoms.toLowerCase();

    let urgencyLevel = 'low';
    let urgencyMessage = '';
    let possibleConditions = [];
    let recommendations = [];
    let shouldConsultDoctor = true;

    // Check for emergency symptoms
    if (symptomsLower.includes('chest pain') ||
        symptomsLower.includes('difficulty breathing') ||
        symptomsLower.includes('severe bleeding') ||
        symptomsLower.includes('unconscious') ||
        symptomsLower.includes('stroke')) {
        urgencyLevel = 'emergency';
        urgencyMessage = '⚠️ EMERGENCY: These symptoms require immediate medical attention. Please call emergency services (911) or go to the nearest emergency room immediately.';
        possibleConditions.push({
            name: 'Potentially serious condition',
            probability: 80,
            description: 'Your symptoms may indicate a serious medical condition requiring immediate attention.'
        });
        recommendations.push('Call emergency services immediately');
        recommendations.push('Do not drive yourself to the hospital');
    }
    // Check for high urgency symptoms
    else if (symptomsLower.includes('high fever') ||
        symptomsLower.includes('severe pain') ||
        symptomsLower.includes('blood in')) {
        urgencyLevel = 'high';
        urgencyMessage = '🔴 HIGH URGENCY: Please consult a doctor within the next 24 hours. These symptoms need prompt medical evaluation.';
        possibleConditions.push({
            name: 'Condition requiring prompt attention',
            probability: 70,
            description: 'Your symptoms suggest you should see a doctor soon for proper evaluation.'
        });
        recommendations.push('Schedule an appointment with your doctor today');
        recommendations.push('If symptoms worsen, go to urgent care');
    }
    // Common symptoms
    else {
        if (symptomsLower.includes('fever') || symptomsLower.includes('headache')) {
            possibleConditions.push({
                name: 'Viral infection',
                probability: 65,
                description: 'Common symptoms that may indicate a viral infection such as cold or flu.'
            });
            recommendations.push('Rest and stay hydrated');
            recommendations.push('Take over-the-counter fever reducers if needed');
            urgencyLevel = 'medium';
        }

        if (symptomsLower.includes('cough') || symptomsLower.includes('sore throat')) {
            possibleConditions.push({
                name: 'Upper respiratory infection',
                probability: 60,
                description: 'May indicate a common cold or other upper respiratory condition.'
            });
            recommendations.push('Gargle with warm salt water');
            recommendations.push('Use throat lozenges for relief');
        }

        if (symptomsLower.includes('stomach') || symptomsLower.includes('nausea')) {
            possibleConditions.push({
                name: 'Gastrointestinal issue',
                probability: 55,
                description: 'Symptoms could indicate digestive system problems.'
            });
            recommendations.push('Eat bland foods (BRAT diet)');
            recommendations.push('Stay hydrated with clear fluids');
        }

        if (possibleConditions.length === 0) {
            possibleConditions.push({
                name: 'General health concern',
                probability: 50,
                description: 'Your symptoms require further evaluation by a healthcare professional.'
            });
        }

        urgencyMessage = urgencyLevel === 'medium'
            ? '🟠 MODERATE URGENCY: We recommend scheduling an appointment with your doctor within the next few days.'
            : '🟢 LOW URGENCY: Your symptoms appear to be minor, but monitor them closely and consult a doctor if they worsen or persist.';
    }

    // Default recommendations
    if (recommendations.length === 0) {
        recommendations.push('Monitor your symptoms closely');
        recommendations.push('Rest and maintain good hydration');
    }
    recommendations.push('Consider scheduling a consultation if symptoms persist');

    return {
        possibleConditions,
        urgencyLevel,
        urgencyMessage,
        recommendations,
        shouldConsultDoctor,
        consultationMessage: 'Based on your symptoms, we recommend consulting with a healthcare professional for a proper diagnosis and personalized treatment plan.',
        disclaimer: 'This analysis is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider.'
    };
}

module.exports = {
    analyzeSymptoms
};
