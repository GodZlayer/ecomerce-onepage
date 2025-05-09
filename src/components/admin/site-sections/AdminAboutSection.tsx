import React, { useEffect, useRef } from "react";
import { InlineEdit } from "../AdminSiteSectionsForm"; // Assuming InlineEdit remains in the main file
import { SiteSectionsConfig } from "@/lib/siteConfig";

// Import Editor.js and tools
import EditorJS, { OutputData } from '@editorjs/editorjs';
import Header from '@editorjs/header';
import Paragraph from '@editorjs/paragraph';
import List from '@editorjs/list';
import ImageTool from '@editorjs/image';
import Embed from '@editorjs/embed';

interface AdminAboutSectionProps {
  sections: SiteSectionsConfig;
  setSections: React.Dispatch<React.SetStateAction<SiteSectionsConfig | null>>;
  handleChange: (sections: SiteSectionsConfig | null, setSections: React.Dispatch<React.SetStateAction<SiteSectionsConfig | null>>, section: string, field: string, value: any) => void;
  handleToggle: (sections: SiteSectionsConfig | null, setSections: React.Dispatch<React.SetStateAction<SiteSectionsConfig | null>>, section: keyof SiteSectionsConfig['sectionsAtivas']) => void;
}

const AdminAboutSection: React.FC<AdminAboutSectionProps> = ({
  sections,
  setSections,
  handleChange,
  handleToggle,
}) => {
  const editorInstance = useRef<EditorJS | null>(null);

  useEffect(() => {
    // Only initialize if window is available and editor not already initialized
    if (typeof window === 'undefined' || editorInstance.current) return;

    const editorElement = document.getElementById('editorjs-about');
    if (!editorElement) {
        console.error("Editor.js holder element 'editorjs-about' not found.");
        return;
    }

    // Use the sections data available in the initial render for initialization
    // Ensure it's valid OutputData, default if not
    let editorData: OutputData = (sections?.about?.content as OutputData) || { time: Date.now(), blocks: [], version: "2.22.2" };
     if (typeof editorData !== 'object' || !Array.isArray(editorData.blocks)) {
         editorData = { time: Date.now(), blocks: [], version: "2.22.2" };
     }


    editorInstance.current = new EditorJS({
      holder: editorElement,
      data: editorData,
      tools: {
        header: Header,
        paragraph: Paragraph,
        list: List,
        image: {
          class: ImageTool,
          config: {
            uploader: {
              async uploadByFile(file: File) {
                const cloudName = import.meta.env.VITE_CLOUDINARY_URL?.split('@')[1];
                if (!cloudName) {
                    console.error("Cloudinary Cloud Name is missing in VITE_CLOUDINARY_URL.");
                    return { success: 0, message: "Image upload configuration error." };
                }

                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', 'test_preset_unsigned'); // Using the 'test_preset_unsigned' upload preset for testing

                try {
                  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                    method: 'POST',
                    body: formData,
                  });

                  if (!response.ok) {
                    const errorData = await response.json();
                    console.error("Error uploading image to Cloudinary:", errorData);
                    return { success: 0, message: errorData.error?.message || 'Upload failed' };
                  }

                  const result = await response.json();
                  console.log("Cloudinary upload response:", result); // Log Cloudinary response
                  if (result.secure_url) {
                    const returnData = {
                      success: 1,
                      file: { url: result.secure_url },
                    };
                    console.log("Returning to Editor.js:", returnData); // Log return data
                    return returnData;
                  } else {
                     console.error("Cloudinary upload failed:", result);
                     const errorData = { success: 0, message: 'Invalid response from Cloudinary' };
                     console.log("Returning error to Editor.js:", errorData); // Log error data
                     return errorData;
                   }
                } catch (error) {
                  console.error("Error during Cloudinary upload fetch:", error);
                  const errorData = { success: 0, message: 'Network error or unexpected issue' };
                  console.log("Returning error to Editor.js:", errorData); // Log error data
                  return errorData;
                }
              },
              uploadByUrl(url: string) {
                 console.log("Attempting uploadByUrl for:", url); // Log URL upload attempt
                 return Promise.resolve({
                   success: 1,
                   file: { url: url }
                 }).then(result => {
                     console.log("uploadByUrl successful, returning:", result); // Log successful URL upload
                     return result;
                 }).catch(error => {
                     console.error("uploadByUrl failed:", error); // Log URL upload failure
                     return { success: 0, message: 'URL upload failed' };
                 });
              }
            }
          }
        },
        embed: Embed,
      },
      onChange: async () => {
        if (editorInstance.current) {
          try {
            const content = await editorInstance.current.save();
            // Use the handleChange prop to update the parent state
            handleChange(sections, setSections, "about", "content", content);
          } catch (error) {
            console.error("Error saving Editor.js content:", error); // Log save errors
          }
        }
      },
      onReady: () => {
        console.log('Editor.js is ready to work!');
      },
    });

    return () => {
      if (editorInstance.current && typeof editorInstance.current.destroy === 'function') { // Add check before destroying
        try {
            editorInstance.current.destroy();
        } catch (e) {
            console.error("Error destroying Editor.js instance:", e);
        }
        editorInstance.current = null;
      } else {
          console.warn("Editor.js instance not available or destroy method missing during cleanup.");
      }
    };
  }, [sections, handleChange, setSections]); // Add dependencies

  return (
    <section className="border rounded-md p-4 space-y-3">
      <label className="flex items-center gap-2 font-medium mb-2 cursor-pointer">
        <input
          type="checkbox"
          checked={sections.sectionsAtivas.about}
          onChange={() => handleToggle(sections, setSections, "about")}
        />
        Ativar Section Sobre
      </label>
      {sections.sectionsAtivas.about && (
        <div className="space-y-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Título</label>
            <InlineEdit
              value={sections.about.title}
              onChange={(v: string) => handleChange(sections, setSections, "about", "title", v)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo</label>
            {/* Editor.js will be initialized here */}
            <div id="editorjs-about" className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 editorjs-render prose max-w-none"></div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminAboutSection;