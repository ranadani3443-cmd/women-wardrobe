import { getStoredGoogleToken, connectGoogleSheets } from './googleSheets.ts';

declare const gapi: any;
declare const google: any;

export interface PickedFile {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  description?: string;
  iconUrl?: string;
  lastEditedUtc?: number;
  sizeBytes?: number;
  thumbnailUrl?: string;
  embedUrl?: string;
}

export type PickerViewType = 'spreadsheets' | 'images' | 'documents' | 'all' | 'upload';

/**
 * Loads the Google API client script and initializes the Google Picker library.
 */
export async function loadPickerApi(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof google !== 'undefined' && google.picker) {
      resolve();
      return;
    }

    const checkGapi = () => {
      if (typeof gapi !== 'undefined') {
        gapi.load('picker', {
          callback: () => {
            if (typeof google !== 'undefined' && google.picker) {
              resolve();
            } else {
              reject(new Error('Google Picker library failed to load properly.'));
            }
          },
          onerror: () => {
            reject(new Error('Failed to load Google Picker via gapi.load.'));
          },
        });
      } else {
        // Dynamically inject script if not yet present
        const existingScript = document.querySelector('script[src*="apis.google.com/js/api.js"]');
        if (!existingScript) {
          const script = document.createElement('script');
          script.src = 'https://apis.google.com/js/api.js';
          script.async = true;
          script.defer = true;
          script.onload = () => {
            setTimeout(checkGapi, 100);
          };
          script.onerror = () => {
            reject(new Error('Failed to load Google API loader script.'));
          };
          document.head.appendChild(script);
        } else {
          setTimeout(checkGapi, 200);
        }
      }
    };

    checkGapi();
  });
}

/**
 * Opens Google Picker dialog and resolves with the chosen file.
 */
export async function openGooglePicker(options: {
  viewType?: PickerViewType;
  title?: string;
  multiselect?: boolean;
}): Promise<PickedFile | null> {
  // Ensure token exists or prompt authentication
  let token = getStoredGoogleToken();
  if (!token) {
    const authResult = await connectGoogleSheets();
    token = authResult.token;
  }

  if (!token) {
    throw new Error('Google authentication required to open Google Drive Picker.');
  }

  await loadPickerApi();

  return new Promise((resolve, reject) => {
    try {
      const pickerOrigin =
        window.location.ancestorOrigins &&
        window.location.ancestorOrigins.length > 0
          ? window.location.ancestorOrigins[
              window.location.ancestorOrigins.length - 1
            ]
          : window.location.origin;

      const builder = new google.picker.PickerBuilder();

      // Configure View based on type
      if (options.viewType === 'spreadsheets') {
        const view = new google.picker.DocsView(google.picker.ViewId.SPREADSHEETS);
        view.setMimeTypes('application/vnd.google-apps.spreadsheet');
        builder.addView(view);
      } else if (options.viewType === 'images') {
        const view = new google.picker.DocsView(google.picker.ViewId.DOCS_IMAGES);
        view.setMimeTypes('image/png,image/jpeg,image/jpg,image/webp,image/gif');
        builder.addView(view);
        builder.addView(new google.picker.DocsUploadView());
      } else if (options.viewType === 'upload') {
        builder.addView(new google.picker.DocsUploadView());
        builder.addView(new google.picker.DocsView(google.picker.ViewId.DOCS));
      } else {
        // Default to Google Docs / All Files
        builder.addView(google.picker.ViewId.DOCS);
      }

      if (options.title) {
        builder.setTitle(options.title);
      }

      if (options.multiselect) {
        builder.enableFeature(google.picker.Feature.MULTISELECT_ENABLED);
      }

      // Mandatory standard configurations
      builder
        .setOAuthToken(token)
        .setOrigin(pickerOrigin)
        .setCallback((data: any) => {
          if (data.action === google.picker.Action.PICKED) {
            const doc = data.docs && data.docs[0];
            if (doc) {
              const picked: PickedFile = {
                id: doc.id,
                name: doc.name,
                url: doc.url || `https://docs.google.com/open?id=${doc.id}`,
                mimeType: doc.mimeType,
                description: doc.description,
                iconUrl: doc.iconUrl,
                lastEditedUtc: doc.lastEditedUtc,
                sizeBytes: doc.sizeBytes,
                thumbnailUrl: doc.thumbnails ? doc.thumbnails[0]?.url : undefined,
                embedUrl: doc.embedUrl,
              };
              resolve(picked);
            } else {
              resolve(null);
            }
          } else if (data.action === google.picker.Action.CANCEL) {
            resolve(null);
          }
        });

      const picker = builder.build();
      picker.setVisible(true);
    } catch (err) {
      console.error('Error launching Google Picker:', err);
      reject(err);
    }
  });
}
