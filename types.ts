
export interface GeneratedFile {
  fileName: string;
  language: string;
  content: string;
}

export interface GenerationResult {
  appName: string;
  packageName: string;
  iconUrl: string;
  manifestContent: string;
  mainActivityContent: string;
  layoutContent: string;
  gradleContent: string;
}
