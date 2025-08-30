
import { GoogleGenAI, Type } from "@google/genai";
import type { GenerationResult } from '../types';

const GEMINI_MODEL = 'gemini-2.5-flash';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const generationSchema = {
  type: Type.OBJECT,
  properties: {
    appName: { type: Type.STRING, description: "A suitable app name from the website title." },
    packageName: { type: Type.STRING, description: "A generated package name like com.domain.app." },
    iconUrl: { type: Type.STRING, description: "URL of the website's favicon, or an empty string if not found." },
    manifestContent: { type: Type.STRING, description: "The full content of AndroidManifest.xml." },
    mainActivityContent: { type: Type.STRING, description: "The full content of MainActivity.java." },
    layoutContent: { type: Type.STRING, description: "The full content of activity_main.xml." },
    gradleContent: { type: Type.STRING, description: "The full content of build.gradle." }
  },
  required: ['appName', 'packageName', 'iconUrl', 'manifestContent', 'mainActivityContent', 'layoutContent', 'gradleContent']
};

interface GenerationOptions {
  domStorage: boolean;
  fileAccess: boolean;
}

export const generateAndroidAppFiles = async (url: string, options: GenerationOptions): Promise<GenerationResult> => {
  if (!url) {
    throw new Error("URL cannot be empty.");
  }

  const webSettingsInstructions: string[] = [
    'webSettings.setJavaScriptEnabled(true);'
  ];

  if (options.domStorage) {
    webSettingsInstructions.push('webSettings.setDomStorageEnabled(true);');
  }
  if (options.fileAccess) {
    webSettingsInstructions.push('webSettings.setAllowFileAccess(true);');
  }
  
  const prompt = `
    You are an expert Android developer assistant. Your task is to take a website URL and generate all the necessary code and configuration files to wrap it in a simple Android WebView application.

    Analyze the website at the provided URL: ${url}

    Based on your analysis, generate the following files:

    1.  **App Name:** A short, suitable name for the app, derived from the website's title.
    2.  **Package Name:** A standard Android package name. Use 'com.website.wrapper' as a template, replacing 'website' with a sanitized version of the website's domain name (e.g., 'google.com' becomes 'google').
    3.  **Icon URL:** The URL of the website's favicon or a suitable logo. If you cannot find one, return an empty string.
    4.  **AndroidManifest.xml:** The manifest file. It must include the <uses-permission android:name="android.permission.INTERNET" /> permission. It should define a single activity, MainActivity.
    5.  **MainActivity.java:** The main activity code. It must:
        *   Be in the generated package.
        *   Set its content view to R.layout.activity_main.
        *   Find the WebView by its ID.
        *   Get the WebSettings and apply the following settings specifically:
            ${webSettingsInstructions.join('\n            ')}
        *   Load the provided URL: ${url}.
        *   Set a WebViewClient to handle page navigation within the WebView itself, preventing links from opening in an external browser.
        *   Implement onBackPressed() to allow the user to navigate back through the WebView's history.
    6.  **activity_main.xml:** The layout file for the main activity. It must contain a single <WebView> element that fills the entire screen ('match_parent' for both width and height).
    7.  **build.gradle (Module: app):** The app-level Gradle build file. It should be a basic configuration for a modern Android app, targeting a recent SDK version (e.g., compileSdk 34, targetSdk 34) and using AndroidX libraries. Ensure it's syntactically correct for Groovy.

    Please provide the output as a single JSON object matching the provided schema. Do not include any explanatory text, markdown formatting, or code fences around the JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: generationSchema,
      },
    });

    const jsonText = response.text.trim();
    const result: GenerationResult = JSON.parse(jsonText);
    return result;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate Android app files. Please check the URL and try again.");
  }
};
