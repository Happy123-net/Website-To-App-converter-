
import React from 'react';

const InfoIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const Instructions: React.FC = () => {
  return (
    <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg shadow-lg backdrop-blur-sm">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center">
        <InfoIcon className="w-6 h-6 mr-3 text-cyan-400"/>
        How to Build Your App
      </h2>
      <ol className="list-decimal list-inside space-y-3 text-slate-300">
        <li>Open Android Studio and select <span className="font-semibold text-cyan-300">"New Project"</span>.</li>
        <li>Choose the <span className="font-semibold text-cyan-300">"Empty Views Activity"</span> template.</li>
        <li>Use the generated <span className="font-mono text-green-400">App Name</span> and <span className="font-mono text-green-400">Package Name</span> when prompted. Set language to Java.</li>
        <li>Once the project is created, replace the content of the corresponding files in your project with the code generated below. The files are usually located in <span className="font-mono text-sm text-slate-400">app/src/main/</span>.</li>
        <li>
          (Optional) For a custom icon, download the icon from the provided URL, rename it (e.g., <span className="font-mono text-sm">ic_launcher.png</span>), and add it to your project's <span className="font-mono text-sm text-slate-400">res/mipmap</span> directories.
          Then update <code className="font-mono text-sm text-slate-400">android:icon</code> and <code className="font-mono text-sm text-slate-400">android:roundIcon</code> in <code className="font-mono text-sm text-slate-400">AndroidManifest.xml</code>.
        </li>
        <li>Click the "Sync Project with Gradle Files" button in Android Studio, then build and run your app!</li>
      </ol>
    </div>
  );
};
