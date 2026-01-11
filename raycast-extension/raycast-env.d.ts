/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** API URL - AI Video Transcriber API URL */
  "apiUrl": string,
  /** Default Summary Language - Default language for video summaries */
  "summaryLanguage": "en" | "zh" | "ja" | "ko" | "es" | "fr" | "de"
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `transcribe-video` command */
  export type TranscribeVideo = ExtensionPreferences & {}
  /** Preferences accessible in the `view-tasks` command */
  export type ViewTasks = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `transcribe-video` command */
  export type TranscribeVideo = {}
  /** Arguments passed to the `view-tasks` command */
  export type ViewTasks = {}
}

